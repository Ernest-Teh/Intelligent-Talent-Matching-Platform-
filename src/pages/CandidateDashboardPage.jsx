import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJobs } from '../data/allJobs'
import { useJobsRevision } from '../hooks/useJobsRevision'
import './CandidateDashboardPage.css'

const DASHBOARD_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard' },
    { id: 'job-search', label: 'Job Search', path: '/candidate/job-search' },
    { id: 'applications', label: 'My Applications', path: '/candidate/my-applications' },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  searchPlaceholder: 'Search jobs by title or keyword…',
  searchButton: 'Search',
  recommendedTitle: 'Recommended for you',
  viewDetails: 'View Details',
  membership: {
    label: 'Membership:',
    nonMember: 'Non-Member',
    member: 'Member',
    upgrade: 'Upgrade to Membership',
  },
}

function greetingLabel() {
  const session = localStorage.getItem('talentmatch-session')
  return session === 'login' ? 'Welcome back, John!' : 'Welcome John!'
}

function CandidateDashboardPage() {
  const navigate = useNavigate()
  const jobsRev = useJobsRevision()
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [isMember, setIsMember] = useState(false)
  const [feedback, setFeedback] = useState('')

  const allJobs = useMemo(() => getAllJobs(), [jobsRev])

  const themeVars = useMemo(
    () => ({
      '--dash-bg': '#F8FAFC',
      '--dash-surface': '#FFFFFF',
      '--dash-border': '#E2E8F0',
      '--dash-heading': '#1E293B',
      '--dash-body': '#64748B',
      '--dash-primary': '#2563EB',
    }),
    [],
  )

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allJobs
    return allJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [allJobs, query])

  const goNav = (item) => {
    if (item.id === 'logout') {
      navigate('/')
      return
    }
    setActiveNav(item.id)
    navigate(item.path)
  }

  const onViewDetails = (job) => {
    sessionStorage.setItem('job-details-source', 'dashboard')
    navigate(`/candidate/job-details?source=dashboard`, {
      state: { job, source: 'dashboard' },
    })
  }

  return (
    <div className="dash-page" style={themeVars}>
      <aside className="dash-sidebar">
        <button className="dash-brand" type="button" onClick={() => navigate('/')}>
          <span className="dash-brand-icon">{DASHBOARD_CONFIG.brand.glyph}</span>
          <span>{DASHBOARD_CONFIG.brand.name}</span>
        </button>
        <nav className="dash-nav">
          {DASHBOARD_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => goNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="dash-nav-item dash-logout"
          onClick={() => goNav(DASHBOARD_CONFIG.sidebarFooter)}
        >
          {DASHBOARD_CONFIG.sidebarFooter.label}
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>{greetingLabel()}</h1>
            <p>Here are roles matched to your profile.</p>
          </div>
          <div className="dash-membership">
            <div className="dash-membership-row">
              <span>{DASHBOARD_CONFIG.membership.label}</span>
              <span className="dash-pill">
                {isMember ? DASHBOARD_CONFIG.membership.member : DASHBOARD_CONFIG.membership.nonMember}
              </span>
            </div>
            <button
              type="button"
              className="dash-upgrade"
              disabled={isMember}
              onClick={() => {
                setIsMember(true)
                setFeedback('Membership upgraded')
              }}
            >
              {isMember ? DASHBOARD_CONFIG.membership.member : DASHBOARD_CONFIG.membership.upgrade}
            </button>
          </div>
        </header>

        <div className="dash-search-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={DASHBOARD_CONFIG.searchPlaceholder}
            aria-label={DASHBOARD_CONFIG.searchPlaceholder}
          />
          <button type="button" onClick={() => setFeedback(`Searching: ${query || '(all)'}`)}>
            {DASHBOARD_CONFIG.searchButton}
          </button>
        </div>

        <section className="dash-section">
          <h2>{DASHBOARD_CONFIG.recommendedTitle}</h2>
          <div className="dash-job-list">
            {filteredJobs.map((job) => (
              <article key={job.id} className="dash-job-card">
                <div>
                  <h3>{job.title}</h3>
                  <p className="dash-job-meta">
                    {job.company} · {job.location} · {job.type}
                  </p>
                  <p className="dash-job-salary">{job.salary}</p>
                  <div className="dash-tags">
                    {job.tags.map((t) => (
                      <span key={t} className="dash-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="dash-job-actions">
                  <span className="dash-match">{job.match}% match</span>
                  <button type="button" onClick={() => onViewDetails(job)}>
                    {DASHBOARD_CONFIG.viewDetails}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="dash-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>
    </div>
  )
}

export default CandidateDashboardPage
