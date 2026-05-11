import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJobs } from '../data/allJobs'
import { useJobsRevision } from '../hooks/useJobsRevision'
import './CandidateJobSearchPage.css'

const JOB_SEARCH_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard' },
    { id: 'job-search', label: 'Job Search', path: '/candidate/job-search' },
    { id: 'applications', label: 'My Applications', path: '/candidate/my-applications' },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  title: 'Job Search',
  subtitle: 'Filter and search roles that fit your skills.',
  filters: {
    typeLabel: 'Job type',
    locationLabel: 'Location',
  },
  searchPlaceholder: 'Search by title, company, or skill…',
  searchButton: 'Search',
  viewDetails: 'View Details',
}

function CandidateJobSearchPage() {
  const navigate = useNavigate()
  const jobsRev = useJobsRevision()
  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [feedback, setFeedback] = useState('')

  const allJobs = useMemo(() => getAllJobs(), [jobsRev])

  const typeOptions = useMemo(() => {
    const s = new Set(['Full-time', 'Part-time', 'Contract'])
    allJobs.forEach((j) => {
      if (j.type) s.add(j.type)
    })
    return ['All', ...Array.from(s).sort((a, b) => a.localeCompare(b))]
  }, [allJobs])

  const locationOptions = useMemo(() => {
    const s = new Set()
    allJobs.forEach((j) => {
      if (j.location) s.add(j.location)
    })
    return ['All', ...Array.from(s).sort((a, b) => a.localeCompare(b))]
  }, [allJobs])

  const themeVars = useMemo(
    () => ({
      '--js-bg': '#F8FAFC',
      '--js-surface': '#FFFFFF',
      '--js-border': '#E2E8F0',
      '--js-heading': '#1E293B',
      '--js-body': '#64748B',
      '--js-primary': '#2563EB',
    }),
    [],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allJobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q))
      const matchesType = jobType === 'All' || job.type === jobType
      const matchesLoc = locationFilter === 'All' || job.location === locationFilter
      return matchesQuery && matchesType && matchesLoc
    })
  }, [allJobs, query, jobType, locationFilter])

  const goNav = (item) => {
    if (item.id === 'logout') {
      navigate('/')
      return
    }
    navigate(item.path)
  }

  const onViewDetails = (job) => {
    sessionStorage.setItem('job-details-source', 'job-search')
    navigate(`/candidate/job-details?source=job-search`, {
      state: { job, source: 'job-search' },
    })
  }

  return (
    <div className="job-search-page" style={themeVars}>
      <aside className="js-sidebar">
        <button className="js-brand" type="button" onClick={() => navigate('/')}>
          <span className="js-brand-icon">{JOB_SEARCH_CONFIG.brand.glyph}</span>
          <span>{JOB_SEARCH_CONFIG.brand.name}</span>
        </button>
        <nav className="js-nav">
          {JOB_SEARCH_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`js-nav-item ${item.id === 'job-search' ? 'active' : ''}`}
              onClick={() => goNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="js-nav-item js-logout" onClick={() => goNav(JOB_SEARCH_CONFIG.sidebarFooter)}>
          {JOB_SEARCH_CONFIG.sidebarFooter.label}
        </button>
      </aside>

      <main className="js-main">
        <header className="js-header">
          <h1>{JOB_SEARCH_CONFIG.title}</h1>
          <p>{JOB_SEARCH_CONFIG.subtitle}</p>
        </header>

        <section className="js-filters">
          <label className="js-filter">
            <span>{JOB_SEARCH_CONFIG.filters.typeLabel}</span>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="js-filter">
            <span>{JOB_SEARCH_CONFIG.filters.locationLabel}</span>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              {locationOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="js-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={JOB_SEARCH_CONFIG.searchPlaceholder}
              aria-label={JOB_SEARCH_CONFIG.searchPlaceholder}
            />
            <button type="button" onClick={() => setFeedback(`Showing ${results.length} roles`)}>
              {JOB_SEARCH_CONFIG.searchButton}
            </button>
          </div>
        </section>

        <div className="js-results">
          {results.map((job) => (
            <article key={job.id} className="js-card">
              <div>
                <h2>{job.title}</h2>
                <p className="js-meta">
                  {job.company} · {job.location} · {job.type}
                </p>
                <p className="js-salary">{job.salary}</p>
                <div className="js-tags">
                  {job.tags.map((t) => (
                    <span key={t} className="js-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="js-card-actions">
                <span className="js-match">{job.match}% match</span>
                <button type="button" onClick={() => onViewDetails(job)}>
                  {JOB_SEARCH_CONFIG.viewDetails}
                </button>
              </div>
            </article>
          ))}
          {results.length === 0 ? <p className="js-empty">No roles match your filters.</p> : null}
        </div>

        <p className="js-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>
    </div>
  )
}

export default CandidateJobSearchPage
