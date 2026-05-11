import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CandidateMyApplicationsPage.css'

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
  applications: [
    { id: 'a1', role: 'Senior Frontend Developer', company: 'TechNova Labs', status: 'Interview', date: 'Apr 18, 2026' },
    { id: 'a2', role: 'Product Designer', company: 'Bright UX Studio', status: 'Applied', date: 'Apr 12, 2026' },
    { id: 'a3', role: 'Backend Engineer', company: 'CloudScale Inc', status: 'Rejected', date: 'Apr 02, 2026' },
  ],
  statusLabels: {
    Applied: 'Applied',
    Interview: 'Interview',
    Rejected: 'Rejected',
  },
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
          {MY_APPLICATIONS_CONFIG.applications.map((app) => (
            <article key={app.id} className="ma-row">
              <div>
                <h2>{app.role}</h2>
                <p className="ma-company">{app.company}</p>
                <p className="ma-date">Applied on {app.date}</p>
              </div>
              <div className="ma-right">
                <span className={`ma-status ma-status-${app.status.toLowerCase()}`}>
                  {MY_APPLICATIONS_CONFIG.statusLabels[app.status] ?? app.status}
                </span>
                <button type="button" onClick={() => setFeedback(`Opening ${app.role}`)}>
                  View
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="ma-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>
    </div>
  )
}

export default CandidateMyApplicationsPage
