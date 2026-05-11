import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EmployerDashboardPage.css'

const EMPLOYER_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'create-job', label: 'Create Job' },
    { id: 'find-candidates', label: 'Find Candidates' },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  title: 'Employer Dashboard',
  subtitle: 'Manage your job postings and find qualified candidates',
  membership: {
    label: 'Membership:',
    nonMember: 'Non-Member',
    member: 'Member',
    upgrade: 'Upgrade to Membership',
  },
  stats: [
    { id: 'active-jobs', label: 'Active Jobs', value: '3', icon: 'A' },
    { id: 'recommended', label: 'Recommended Candidates', value: '5', icon: 'R' },
    { id: 'shortlisted', label: 'Shortlisted Candidates', value: '12', icon: 'S' },
  ],
  topTitle: 'Top 10 Recommended Candidates',
  candidates: [
    {
      name: 'Sarah Johnson',
      education: "Bachelor's in Computer Science",
      experience: '4 years of experience',
      skills: ['React', 'TypeScript', 'Node.js'],
      match: 95,
    },
    {
      name: 'Michael Chen',
      education: "Master's in Software Engineering",
      experience: '5 years of experience',
      skills: ['Python', 'Django', 'PostgreSQL'],
      match: 92,
    },
    {
      name: 'Emily Rodriguez',
      education: "Bachelor's in Information Technology",
      experience: '3 years of experience',
      skills: ['JavaScript', 'Vue.js', 'MongoDB'],
      match: 88,
    },
  ],
  viewProfileLabel: 'View Profile',
}

function EmployerDashboardPage() {
  const navigate = useNavigate()
  const [activeSidebar, setActiveSidebar] = useState('dashboard')
  const [isMember, setIsMember] = useState(false)
  const [feedback, setFeedback] = useState('Employer dashboard ready')

  const themeVars = useMemo(
    () => ({
      '--emp-white': '#FFFFFF',
      '--emp-page-bg': '#F8FAFC',
      '--emp-border': '#E2E8F0',
      '--emp-primary': '#2563EB',
      '--emp-heading': '#1E293B',
      '--emp-body': '#64748B',
      '--emp-membership-bg': '#F3F4F6',
      '--emp-membership-text': '#364153',
      '--emp-chip-bg': '#EFF6FF',
      '--emp-stat-1': '#DBEAFE',
      '--emp-stat-2': '#DCFCE7',
      '--emp-stat-3': '#FFF7ED',
      '--emp-match-bg': '#DCFCE7',
      '--emp-match-text': '#008236',
    }),
    [],
  )

  const onSidebarClick = (itemId, label) => {
    if (itemId === 'logout') {
      navigate('/')
      return
    }
    setActiveSidebar(itemId)
    setFeedback(`${label} selected`)
  }

  return (
    <div className="employer-page" style={themeVars}>
      <aside className="employer-sidebar">
        <div className="employer-brand-wrap">
          <button className="employer-brand" type="button" onClick={() => navigate('/')}>
            <span className="employer-brand-icon">{EMPLOYER_CONFIG.brand.glyph}</span>
            <span className="employer-brand-text">{EMPLOYER_CONFIG.brand.name}</span>
          </button>
        </div>

        <nav className="employer-nav">
          {EMPLOYER_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`employer-nav-item ${activeSidebar === item.id ? 'active' : ''}`}
              onClick={() => onSidebarClick(item.id, item.label)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="employer-nav-footer">
          <button
            type="button"
            className="employer-nav-item"
            onClick={() =>
              onSidebarClick(
                EMPLOYER_CONFIG.sidebarFooter.id,
                EMPLOYER_CONFIG.sidebarFooter.label,
              )
            }
          >
            {EMPLOYER_CONFIG.sidebarFooter.label}
          </button>
        </div>
      </aside>

      <main className="employer-main">
        <header className="employer-header">
          <div>
            <h1>{EMPLOYER_CONFIG.title}</h1>
            <p>{EMPLOYER_CONFIG.subtitle}</p>
          </div>
          <div className="employer-membership">
            <div className="membership-line">
              <span>{EMPLOYER_CONFIG.membership.label}</span>
              <span className="membership-pill">
                {isMember ? EMPLOYER_CONFIG.membership.member : EMPLOYER_CONFIG.membership.nonMember}
              </span>
            </div>
            <button
              type="button"
              className="upgrade-btn"
              disabled={isMember}
              onClick={() => {
                setIsMember(true)
                setFeedback('Membership upgraded')
              }}
            >
              {isMember ? EMPLOYER_CONFIG.membership.member : EMPLOYER_CONFIG.membership.upgrade}
            </button>
          </div>
        </header>

        <section className="stats-grid">
          {EMPLOYER_CONFIG.stats.map((stat) => (
            <article key={stat.id} className="stat-card">
              <div className="stat-top">
                <p>{stat.label}</p>
                <span className={`stat-icon ${stat.id}`}>{stat.icon}</span>
              </div>
              <h2>{stat.value}</h2>
            </article>
          ))}
        </section>

        <section className="candidates-section">
          <h3>{EMPLOYER_CONFIG.topTitle}</h3>
          <div className="candidate-list">
            {EMPLOYER_CONFIG.candidates.map((candidate) => (
              <article key={candidate.name} className="candidate-card">
                <div>
                  <h4>{candidate.name}</h4>
                  <p>{candidate.education}</p>
                  <p>{candidate.experience}</p>
                  <div className="skill-list">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="candidate-actions">
                  <span className="match-pill">{candidate.match}%</span>
                  <button
                    type="button"
                    onClick={() => setFeedback(`Viewing ${candidate.name}'s profile`)}
                  >
                    {EMPLOYER_CONFIG.viewProfileLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="employer-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>
    </div>
  )
}

export default EmployerDashboardPage
