from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User

# Blueprint for admin actions
admin_bp = Blueprint("admin", __name__)


# Admin can view all users
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def view_users():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)

    if not admin or admin.role != "admin":
        return jsonify({"error": "Only admins can view users"}), 403

    users = User.query.all()

    return jsonify({
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "is_member": user.is_member
            }
            for user in users
        ]
    }), 200


# Admin can update membership status for any user
@admin_bp.route("/users/<int:user_id>/membership", methods=["PUT"])
@jwt_required()
def update_membership(user_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)

    if not admin or admin.role != "admin":
        return jsonify({"error": "Only admins can update membership"}), 403

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    is_member = data.get("is_member")

    if not isinstance(is_member, bool):
        return jsonify({"error": "is_member must be true or false"}), 400

    user.is_member = is_member
    db.session.commit()

    return jsonify({
        "message": "Membership status updated successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_member": user.is_member
        }
    }), 200