import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobApplications } from '../lib/talentmatchStorage'
import './CandidateMyApplicationsPage.css'

// Nav + headings here. Rows come from getJobApplications() (same data Apply Now writes).
const MY_APPLICATIONS_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard' },
    { id: 'job-search', label: 'Job Search', path: '/candidate/job-search' },
    { id: 'applications', label: 'My Applications', path: '/candidate/my-applications' },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  title: 'My Applications',
  subtitle: 'Track roles you have applied to.',
  emptyHint:
    'Nothing here yet. Apply from a job details page first — entries show up here (and in job-applications.json when dev server is on).',
  statusLabels: {
    Applied: 'Applied',
    Interview: 'Interview',
    Rejected: 'Rejected',
  },
  datePrefix: 'Applied on',
  viewLabel: 'View',
}

function formatAppliedDate(iso) {
  if (!iso || typeof iso !== 'string') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function CandidateMyApplicationsPage() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')

  const themeVars = useMemo(
    () => ({
      '--ma-bg': '#F8FAFC',
      '--ma-surface': '#FFFFFF',
      '--ma-border': '#E2E8F0',
      '--ma-heading': '#1E293B',
      '--ma-body': '#64748B',
      '--ma-primary': '#2563EB',
    }),
    [],
  )

  const goNav = (item) => {
    if (item.id === 'logout') {
      navigate('/')
      return
    }
    navigate(item.path)
  }

  const applications = getJobApplications()

  return (
    <div className="ma-page" style={themeVars}>
      <aside className="ma-sidebar">
        <button className="ma-brand" type="button" onClick={() => navigate('/')}>
          <span className="ma-brand-icon">{MY_APPLICATIONS_CONFIG.brand.glyph}</span>
          <span>{MY_APPLICATIONS_CONFIG.brand.name}</span>
        </button>
        <nav className="ma-nav">
          {MY_APPLICATIONS_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ma-nav-item ${item.id === 'applications' ? 'active' : ''}`}
              onClick={() => goNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="ma-nav-item ma-logout" onClick={() => goNav(MY_APPLICATIONS_CONFIG.sidebarFooter)}>
          {MY_APPLICATIONS_CONFIG.sidebarFooter.label}
        </button>
      </aside>

      <main className="ma-main">
        <header className="ma-header">
          <h1>{MY_APPLICATIONS_CONFIG.title}</h1>
          <p>{MY_APPLICATIONS_CONFIG.subtitle}</p>
        </header>

        <div className="ma-list">
          {applications.length === 0 ? (
            <p className="ma-empty">{MY_APPLICATIONS_CONFIG.emptyHint}</p>
          ) : (
            applications.map((app) => {
              const id = String(app.id ?? app.jobId ?? Math.random())
              const role = String(app.jobTitle ?? 'Role')
              const company = String(app.company ?? '')
              const status = String(app.status ?? 'Applied')
              const statusClass = status.toLowerCase()
              return (
                <article key={id} className="ma-row">
                  <div>
                    <h2>{role}</h2>
                    <p className="ma-company">{company}</p>
                    <p className="ma-date">
                      {MY_APPLICATIONS_CONFIG.datePrefix} {formatAppliedDate(app.savedAt)}
                    </p>
                  </div>
                  <div className="ma-right">
                    <span className={`ma-status ma-status-${statusClass}`}>
                      {MY_APPLICATIONS_CONFIG.statusLabels[status] ?? status}
                    </span>
                    <button type="button" onClick={() => setFeedback(`Selected: ${role} at ${company}`)}>
                      {MY_APPLICATIONS_CONFIG.viewLabel}
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <p className="ma-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>
    </div>
  )
}

export default CandidateMyApplicationsPage
