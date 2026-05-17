from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from models import db, User

# Blueprint for authentication routes
auth_bp = Blueprint("auth", __name__)


# Register a new user account
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    # Ensure all required fields are provided
    if not full_name or not email or not password or not role:
        return jsonify({"error": "All fields are required"}), 400

    # Allow only approved user roles
    if role not in ["candidate", "employer", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    # Prevent duplicate email registration
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    # Create new user record
    new_user = User(
        full_name=full_name,
        email=email,
        role=role
    )

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }), 201


# Login existing user and issue token
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    # Check login credentials
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token after successful login
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }), 200