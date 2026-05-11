import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import './CandidateJobDetailsPage.css'

const DETAILS_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard', source: 'dashboard' },
    { id: 'job-search', label: 'Job Search', path: '/candidate/job-search', source: 'job-search' },
    {
      id: 'applications',
      label: 'My Applications',
      path: '/candidate/my-applications',
      source: 'applications',
    },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  applyLabel: 'Apply Now',
  backLabels: {
    dashboard: 'Back to Dashboard',
    'job-search': 'Back to Job Search',
    applications: 'Back to My Applications',
    default: 'Back',
  },
}

const SENIOR_FE_DETAILS = {
  overview:
    'Lead the evolution of our customer-facing web apps with performance, accessibility, and design systems in mind.',
  responsibilities: [
    'Own complex UI features end-to-end with React and TypeScript.',
    'Collaborate with design on accessible, responsive layouts.',
    'Improve observability, bundle size, and runtime performance.',
  ],
  requirements: [
    '5+ years shipping production web apps.',
    'Strong React + TypeScript fundamentals.',
    'Comfortable mentoring peers through code review.',
  ],
}

function buildDetails(job) {
  const title = job?.title ?? 'Role'
  if (title === 'Senior Frontend Developer') {
    return {
      title,
      company: job?.company ?? 'Company',
      location: job?.location ?? 'Location',
      type: job?.type ?? 'Full-time',
      salary: job?.salary ?? '',
      overview: SENIOR_FE_DETAILS.overview,
      responsibilities: SENIOR_FE_DETAILS.responsibilities,
      requirements: SENIOR_FE_DETAILS.requirements,
    }
  }
  return {
    title,
    company: job?.company ?? 'Company',
    location: job?.location ?? 'Location',
    type: job?.type ?? 'Full-time',
    salary: job?.salary ?? '',
    overview: `Join ${job?.company ?? 'the team'} as a ${title}. You will collaborate across engineering and product to ship high-quality features.`,
    responsibilities: [
      'Deliver features with clear ownership and measurable outcomes.',
      'Partner with stakeholders to clarify requirements and timelines.',
      'Improve reliability and quality through testing and reviews.',
    ],
    requirements: [
      'Relevant experience in a similar role.',
      'Strong communication and collaboration skills.',
      'Comfort working in a fast-paced product environment.',
    ],
  }
}

function resolveSource(location, searchParams) {
  const fromState = location.state?.source
  const fromQuery = searchParams.get('source')
  const fromStorage = sessionStorage.getItem('job-details-source')
  const raw = fromState || fromQuery || fromStorage || 'job-search'
  if (raw === 'dashboard' || raw === 'job-search' || raw === 'applications') return raw
  return 'job-search'
}

function CandidateJobDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const job = location.state?.job
  const openedFrom = useMemo(
    () => resolveSource(location, searchParams),
    [location.state, searchParams],
  )

  const detail = useMemo(() => buildDetails(job), [job])

  const themeVars = useMemo(
    () => ({
      '--jd-bg': '#F8FAFC',
      '--jd-surface': '#FFFFFF',
      '--jd-border': '#E2E8F0',
      '--jd-heading': '#1E293B',
      '--jd-body': '#64748B',
      '--jd-primary': '#2563EB',
    }),
    [],
  )

  const backPath =
    openedFrom === 'dashboard'
      ? '/candidate/dashboard'
      : openedFrom === 'applications'
        ? '/candidate/my-applications'
        : '/candidate/job-search'

  const backLabel =
    DETAILS_CONFIG.backLabels[openedFrom] ?? DETAILS_CONFIG.backLabels.default

  const sidebarActive = (item) => {
    if (item.source === openedFrom) return 'active'
    if (openedFrom === 'applications' && item.id === 'applications') return 'active'
    return ''
  }

  return (
    <div className="jd-page" style={themeVars}>
      <aside className="jd-sidebar">
        <button className="jd-brand" type="button" onClick={() => navigate('/')}>
          <span className="jd-brand-icon">{DETAILS_CONFIG.brand.glyph}</span>
          <span>{DETAILS_CONFIG.brand.name}</span>
        </button>
        <nav className="jd-nav">
          {DETAILS_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`jd-nav-item ${sidebarActive(item)}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="jd-nav-item jd-logout" onClick={() => navigate('/')}>
          {DETAILS_CONFIG.sidebarFooter.label}
        </button>
      </aside>

      <main className="jd-main">
        <button type="button" className="jd-back" onClick={() => navigate(backPath)}>
          ← {backLabel}
        </button>

        <article className="jd-card">
          <header className="jd-card-head">
            <div>
              <h1>{detail.title}</h1>
              <p className="jd-meta">
                {detail.company} · {detail.location} · {detail.type}
              </p>
              {detail.salary ? <p className="jd-salary">{detail.salary}</p> : null}
            </div>
            <button type="button" className="jd-apply">
              {DETAILS_CONFIG.applyLabel}
            </button>
          </header>

          <section className="jd-section">
            <h2>Overview</h2>
            <p>{detail.overview}</p>
          </section>

          <section className="jd-section">
            <h2>Responsibilities</h2>
            <ul>
              {detail.responsibilities.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="jd-section">
            <h2>Requirements</h2>
            <ul>
              {detail.requirements.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </article>
      </main>
    </div>
  )
}

export default CandidateJobDetailsPage
