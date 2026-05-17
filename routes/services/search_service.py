from difflib import SequenceMatcher

from models import Job, CandidateProfile, User


def similarity_score(text_one, text_two):
    """
    Returns a similarity score between two text values.
    Used for fuzzy search when spelling is not exact.
    """
    if not text_one or not text_two:
        return 0

    return SequenceMatcher(
        None,
        text_one.lower(),
        text_two.lower()
    ).ratio()


def keyword_matches(keyword, text):
    """
    Checks normal keyword match and fuzzy match.
    """
    if not keyword or not text:
        return False

    keyword = keyword.lower().strip()
    text = text.lower().strip()

    # Normal keyword match
    if keyword in text:
        return True

    # Fuzzy match for typo handling
    words = text.split()

    for word in words:
        if similarity_score(keyword, word) >= 0.75:
            return True

    return False


def search_jobs(keyword=None, location=None, work_mode=None, job_type=None):
    """
    Search jobs using keyword, filters, keyword + filters, and fuzzy matching.
    """
    jobs = Job.query.all()
    results = []

    for job in jobs:
        searchable_text = f"""
        {job.title}
        {job.company_name}
        {job.description}
        {job.required_skills}
        {job.education_required}
        {job.experience_required}
        {job.location}
        {job.work_mode}
        {job.job_type}
        """

        # Keyword search with fuzzy matching
        if keyword:
            keyword_terms = keyword.split()
            keyword_found = any(
                keyword_matches(term, searchable_text)
                for term in keyword_terms
            )

            if not keyword_found:
                continue

        # Filter by location
        if location and job.location:
            if location.lower() != job.location.lower():
                continue

        # Filter by work mode
        if work_mode and job.work_mode:
            if work_mode.lower() != job.work_mode.lower():
                continue

        # Filter by job type
        if job_type and job.job_type:
            if job_type.lower() != job.job_type.lower():
                continue

        results.append({
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
        })

    return results


def search_candidates(keyword=None, location=None, work_mode=None):
    """
    Search candidate profiles using keyword, filters, and fuzzy matching.
    """
    profiles = CandidateProfile.query.all()
    results = []

    for profile in profiles:
        candidate = User.query.get(profile.candidate_id)

        if not candidate or candidate.role != "candidate":
            continue

        searchable_text = f"""
        {candidate.full_name}
        {candidate.email}
        {profile.education}
        {profile.skills}
        {profile.experience}
        {profile.preferred_location}
        {profile.preferred_work_mode}
        """

        # Keyword search with fuzzy matching
        if keyword:
            keyword_terms = keyword.split()
            keyword_found = any(
                keyword_matches(term, searchable_text)
                for term in keyword_terms
            )

            if not keyword_found:
                continue

        # Filter by preferred location
        if location and profile.preferred_location:
            if location.lower() != profile.preferred_location.lower():
                continue

        # Filter by preferred work mode
        if work_mode and profile.preferred_work_mode:
            if work_mode.lower() != profile.preferred_work_mode.lower():
                continue

        results.append({
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name,
            "candidate_email": candidate.email,
            "education": profile.education,
            "skills": profile.skills,
            "experience": profile.experience,
            "preferred_location": profile.preferred_location,
            "preferred_work_mode": profile.preferred_work_mode
        })

    return results