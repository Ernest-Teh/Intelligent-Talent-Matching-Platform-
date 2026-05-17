from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, Job, Application, CandidateProfile
from services.search_service import search_jobs

# Blueprint for candidate actions
candidate_bp = Blueprint("candidate", __name__)


# Candidate can view all available jobs
@candidate_bp.route("/jobs", methods=["GET"])
@jwt_required()
def view_all_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "candidate":
        return jsonify({"error": "Only candidates can view jobs"}), 403

    jobs = Job.query.all()

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


# Candidate creates or updates profile details
@candidate_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_or_update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "candidate":
        return jsonify({"error": "Only candidates can create profiles"}), 403

    data = request.get_json()
    skills = data.get("skills")

    if not skills:
        return jsonify({"error": "Skills are required"}), 400

    profile = CandidateProfile.query.filter_by(candidate_id=user.id).first()

    # Create profile if first time
    if not profile:
        profile = CandidateProfile(candidate_id=user.id)

    profile.education = data.get("education")
    profile.skills = skills
    profile.experience = data.get("experience")
    profile.preferred_location = data.get("preferred_location")
    profile.preferred_work_mode = data.get("preferred_work_mode")

    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "Candidate profile saved successfully",
        "profile": {
            "education": profile.education,
            "skills": profile.skills,
            "experience": profile.experience,
            "preferred_location": profile.preferred_location,
            "preferred_work_mode": profile.preferred_work_mode
        }
    }), 200


# Candidate receives recommended jobs
@candidate_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def recommended_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "candidate":
        return jsonify({"error": "Only candidates can view recommendations"}), 403

    profile = CandidateProfile.query.filter_by(candidate_id=user.id).first()

    if not profile:
        return jsonify({"error": "Please create profile first"}), 404

    candidate_skills = set(
        skill.strip().lower()
        for skill in profile.skills.split(",")
        if skill.strip()
    )

    jobs = Job.query.all()
    recommendations = []

    for job in jobs:
        job_skills = set(
            skill.strip().lower()
            for skill in job.required_skills.split(",")
            if skill.strip()
        )

        matched_skills = candidate_skills.intersection(job_skills)
        score = len(matched_skills)

        # Bonus score for preferred location match
        if profile.preferred_location and job.location:
            if profile.preferred_location.lower() == job.location.lower():
                score += 1

        # Bonus score for preferred work mode match
        if profile.preferred_work_mode and job.work_mode:
            if profile.preferred_work_mode.lower() == job.work_mode.lower():
                score += 1

        if score > 0:
            recommendations.append({
                "job_id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "work_mode": job.work_mode,
                "job_type": job.job_type,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "matched_skills": list(matched_skills),
                "match_score": score
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    # Membership requirement:
    # members get unlimited recommendations, non-members get Top 10
    if user.is_member:
        result = recommendations
    else:
        result = recommendations[:10]

    return jsonify({
        "is_member": user.is_member,
        "recommendation_count": len(result),
        "recommendations": result
    }), 200


# Candidate applies for a selected job
@candidate_bp.route("/apply/<int:job_id>", methods=["POST"])
@jwt_required()
def apply_for_job(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "candidate":
        return jsonify({"error": "Only candidates can apply for jobs"}), 403

    job = Job.query.get(job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    # Prevent duplicate applications
    existing_application = Application.query.filter_by(
        candidate_id=user.id,
        job_id=job.id
    ).first()

    if existing_application:
        return jsonify({"error": "You have already applied"}), 409

    application = Application(
        candidate_id=user.id,
        job_id=job.id,
        status="Submitted"
    )

    db.session.add(application)
    db.session.commit()

    return jsonify({
        "message": "Application submitted successfully"
    }), 201


# Candidate searches jobs using keywords, filters, salary range, and fuzzy matching
@candidate_bp.route("/search/jobs", methods=["GET"])
@jwt_required()
def candidate_search_jobs():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or user.role != "candidate":
        return jsonify({"error": "Only candidates can search jobs"}), 403

    keyword = request.args.get("keyword")
    location = request.args.get("location")
    work_mode = request.args.get("work_mode")
    job_type = request.args.get("job_type")
    salary_min = request.args.get("salary_min")
    salary_max = request.args.get("salary_max")

    results = search_jobs(
        keyword=keyword,
        location=location,
        work_mode=work_mode,
        job_type=job_type,
        salary_min=salary_min,
        salary_max=salary_max
    )

    return jsonify({
        "search_type": "job_search",
        "keyword": keyword,
        "location": location,
        "work_mode": work_mode,
        "job_type": job_type,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "result_count": len(results),
        "results": results
    }), 200