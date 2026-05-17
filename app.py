from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.candidate_routes import candidate_bp
from routes.employer_routes import employer_bp
from routes.admin_routes import admin_bp 

# Main Flask application setup
app = Flask(__name__)
app.config.from_object(Config)

# Enable frontend-backend communication and JWT authentication
CORS(app)
jwt = JWTManager(app)

# Connect SQLAlchemy database with the Flask app
db.init_app(app)

# Register route files for each main user role
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(candidate_bp, url_prefix="/candidate")
app.register_blueprint(employer_bp, url_prefix="/employer")
app.register_blueprint(admin_bp, url_prefix="/admin")


# Simple route to check that backend is running
@app.route("/")
def home():
    return {
        "message": "Intelligent Talent Matching Platform Backend is running"
    }


# Return a clean message when an invalid route is requested
@app.errorhandler(404)
def not_found(error):
    return {"error": "Route not found"}, 404


# Return a clean message for unexpected server errors
@app.errorhandler(500)
def internal_error(error):
    return {"error": "Internal server error"}, 500


# Create database tables if they do not already exist
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)