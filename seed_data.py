from app import app
from models import db, User, Job, CandidateProfile, Application


def create_user(full_name, email, password, role, is_member=False):
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        existing_user.is_member = is_member
        db.session.commit()
        return existing_user

    user = User(
        full_name=full_name,
        email=email,
        role=role,
        is_member=is_member
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return user


with app.app_context():
    print("Starting seed data setup...")

    # Create demo admin
    admin = create_user(
        full_name="Admin User",
        email="admin@test.com",
        password="123456",
        role="admin",
        is_member=True
    )

    # Create demo employer
    employer = create_user(
        full_name="Alyan Baber Azam",
        email="abz0@test.com",
        password="123456",
        role="employer",
        is_member=True
    )

    # Create demo candidate
    candidate = create_user(
        full_name="Sujal Kumar",
        email="sk12@test.com",
        password="123456",
        role="candidate",
        is_member=False
    )

    # Create or update demo job
    job = Job.query.filter_by(
        title="Data Analyst Intern",
        company_name="University of Wollongong"
    ).first()

    if not job:
        job = Job(
            title="Data Analyst Intern",
            company_name="University of Wollongong",
            employer_id=employer.id
        )

    job.description = (
        "Support reporting, dashboards, student data analysis, "
        "and operational insights across university departments."
    )
    job.required_skills = "Python, SQL, Excel, Data Analysis"
    job.education_required = "Bachelor Degree or currently studying"
    job.experience_required = "Entry level"
    job.location = "Wollongong"
    job.work_mode = "Hybrid"
    job.job_type = "Internship"
    job.salary_min = 50000
    job.salary_max = 65000
    job.employer_id = employer.id

    db.session.add(job)
    db.session.commit()

    # Create or update candidate profile
    profile = CandidateProfile.query.filter_by(candidate_id=candidate.id).first()

    if not profile:
        profile = CandidateProfile(candidate_id=candidate.id)

    profile.education = "Bachelor of Computer Science"
    profile.skills = "Python, SQL, Excel, Data Analysis"
    profile.experience = "Entry level"
    profile.preferred_location = "Wollongong"
    profile.preferred_work_mode = "Hybrid"

    db.session.add(profile)
    db.session.commit()

    # Create sample application if it does not already exist
    existing_application = Application.query.filter_by(
        candidate_id=candidate.id,
        job_id=job.id
    ).first()

    if not existing_application:
        application = Application(
            candidate_id=candidate.id,
            job_id=job.id,
            status="Submitted"
        )

        db.session.add(application)
        db.session.commit()

    print("Seed data created successfully.")
    print("Admin login: admin@test.com / 123456")
    print("Employer login: abz0@test.com / 123456")
    print("Candidate login: sk12@test.com / 123456")