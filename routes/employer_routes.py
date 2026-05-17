from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, Job, Application, CandidateProfile
from services.search_service import search_candidates

# Blueprint for employer actions
employer_bp = Blueprint("employer", __name__)


# Employer creates a new job post
@employer_bp.route("/jobs", methods=["POST"])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "employer":
        return jsonify({"error": "Only employers can create jobs"}), 403

    data = request.get_json()

    title = data.get("title")
    company_name = data.get("company_name")
    description = data.get("description")
    required_skills = data.get("required_skills")

    if not title or not company_name or not description or not required_skills:
        return jsonify({"error": "Required fields are missing"}), 400

    new_job = Job(
        title=title,
        company_name=company_name,
        description=description,
        required_skills=required_skills,
        education_required=data.get("education_required"),
        experience_required=data.get("experience_required"),
        location=data.get("location"),
        work_mode=data.get("work_mode"),
        job_type=data.get("job_type"),
        salary_min=data.get("salary_min"),
        salary_max=data.get("salary_max"),
        employer_id=user.id
    )

    db.session.add(new_job)
    db.session.commit()

    return jsonify({
        "message": "Job posted successfully",
        "job": {
            "id": new_job.id,
            "title": new_job.title,
            "company_name": new_job.company_name,
            "description": new_job.description,
            "required_skills": new_job.required_skills,
            "education_required": new_job.education_required,
            "experience_required": new_job.experience_required,
            "location": new_job.location,
            "work_mode": new_job.work_mode,
            "job_type": new_job.job_type,
            "salary_min": new_job.salary_min,
            "salary_max": new_job.salary_max
        }
    }), 201


# Employer views jobs they created
@employer_bp.route("/jobs", methods=["GET"])
@jwt_required()
def get_employer_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "employer":
        return jsonify({"error": "Only employers can view jobs"}), 403

    jobs = Job.query.filter_by(employer_id=user.id).all()

    return jsonify({
        "jobs": [
            {
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "description": job.description,
                "required_skills": job.required_skills,
                "education_required": job.education_required,
                "experience_required": job.experience_required,
                "location": job.location,
                "work_mode": job.work_mode,
                "job_type": job.job_type,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max
            }
            for job in jobs
        ]
    }), 200


# Employer views applications for a selected job
@employer_bp.route("/jobs/<int:job_id>/applications", methods=["GET"])
@jwt_required()
def view_job_applications(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "employer":
        return jsonify({"error": "Only employers can view applications"}), 403

    job = Job.query.get(job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    if job.employer_id != user.id:
        return jsonify({"error": "Access denied"}), 403

    applications = Application.query.filter_by(job_id=job.id).all()

    application_list = []

    for application in applications:
        candidate = User.query.get(application.candidate_id)
        profile = CandidateProfile.query.filter_by(candidate_id=application.candidate_id).first()

        application_list.append({
            "application_id": application.id,
            "candidate_id": application.candidate_id,
            "candidate_name": candidate.full_name if candidate else None,
            "candidate_email": candidate.email if candidate else None,
            "candidate_skills": profile.skills if profile else None,
            "candidate_experience": profile.experience if profile else None,
            "preferred_location": profile.preferred_location if profile else None,
            "preferred_work_mode": profile.preferred_work_mode if profile else None,
            "status": application.status
        })

    return jsonify({
        "job": {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name
        },
        "applications": application_list
    }), 200


# Employer updates application result
@employer_bp.route("/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(application_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "employer":
        return jsonify({"error": "Only employers can update status"}), 403

    application = Application.query.get(application_id)

    if not application:
        return jsonify({"error": "Application not found"}), 404

    job = Job.query.get(application.job_id)

    if not job or job.employer_id != user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["Shortlisted", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    application.status = new_status
    db.session.commit()

    return jsonify({
        "message": "Application status updated successfully",
        "application": {
            "application_id": application.id,
            "candidate_id": application.candidate_id,
            "job_id": application.job_id,
            "status": application.status
        }
    }), 200


# Employer receives recommended candidates for a selected job
@employer_bp.route("/jobs/<int:job_id>/recommended-candidates", methods=["GET"])
@jwt_required()
def recommended_candidates(job_id):
    current_user_id = get_jwt_identity()
    employer = User.query.get(current_user_id)

    if not employer or employer.role != "employer":
        return jsonify({"error": "Only employers can view recommended candidates"}), 403

    job = Job.query.get(job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    if job.employer_id != employer.id:
        return jsonify({"error": "Access denied"}), 403

    job_skills = set(
        skill.strip().lower()
        for skill in job.required_skills.split(",")
        if skill.strip()
    )

    candidate_profiles = CandidateProfile.query.all()
    recommendations = []

    for profile in candidate_profiles:
        candidate = User.query.get(profile.candidate_id)

        if not candidate or candidate.role != "candidate":
            continue

        candidate_skills = set(
            skill.strip().lower()
            for skill in profile.skills.split(",")
            if skill.strip()
        )

        matched_skills = job_skills.intersection(candidate_skills)
        score = len(matched_skills)

        # Bonus score for location match
        if profile.preferred_location and job.location:
            if profile.preferred_location.lower() == job.location.lower():
                score += 1

        # Bonus score for work mode match
        if profile.preferred_work_mode and job.work_mode:
            if profile.preferred_work_mode.lower() == job.work_mode.lower():
                score += 1

        if score > 0:
            recommendations.append({
                "candidate_id": candidate.id,
                "candidate_name": candidate.full_name,
                "candidate_email": candidate.email,
                "skills": profile.skills,
                "experience": profile.experience,
                "preferred_location": profile.preferred_location,
                "preferred_work_mode": profile.preferred_work_mode,
                "matched_skills": list(matched_skills),
                "match_score": score
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    # Membership requirement:
    # member employers get unlimited recommendations
    # non-member employers get Top 10 only
    if employer.is_member:
        result = recommendations
    else:
        result = recommendations[:10]

    return jsonify({
        "is_member": employer.is_member,
        "recommendation_count": len(result),
        "recommended_candidates": result
    }), 200
# Employer searches candidate profiles using keywords, filters, and fuzzy matching
@employer_bp.route("/search/candidates", methods=["GET"])
@jwt_required()
def employer_search_candidates():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "employer":
        return jsonify({"error": "Only employers can search candidates"}), 403

    keyword = request.args.get("keyword")
    location = request.args.get("location")
    work_mode = request.args.get("work_mode")

    results = search_candidates(
        keyword=keyword,
        location=location,
        work_mode=work_mode
    )

    return jsonify({
        "search_type": "candidate_search",
        "keyword": keyword,
        "location": location,
        "work_mode": work_mode,
        "result_count": len(results),
        "results": results
    }), 200