from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Database object used across the project
db = SQLAlchemy()


# Stores login accounts for candidates, employers and admins
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    # False = non-member, True = member
    is_member = db.Column(db.Boolean, default=False, nullable=False)

    # Convert plain password into secure hash
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Check entered password during login
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Stores candidate profile details for job recommendations
class CandidateProfile(db.Model):
    __tablename__ = "candidate_profiles"

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    education = db.Column(db.String(120), nullable=True)
    skills = db.Column(db.String(255), nullable=False)
    experience = db.Column(db.String(120), nullable=True)
    preferred_location = db.Column(db.String(120), nullable=True)
    preferred_work_mode = db.Column(db.String(50), nullable=True)


# Stores job posts created by employers
class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(120), nullable=False)
    company_name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.String(255), nullable=False)
    education_required = db.Column(db.String(120), nullable=True)
    experience_required = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    work_mode = db.Column(db.String(50), nullable=True)

    job_type = db.Column(db.String(50), nullable=True)
    salary_min = db.Column(db.Integer, nullable=True)
    salary_max = db.Column(db.Integer, nullable=True)

    employer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)


# Stores job applications submitted by candidates
class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(50), default="Submitted")