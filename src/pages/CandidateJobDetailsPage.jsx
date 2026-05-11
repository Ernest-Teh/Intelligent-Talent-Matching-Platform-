import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getAllJobs } from '../data/allJobs'
import { SAMPLE_JOBS } from '../data/jobs'
import { useJobsRevision } from '../hooks/useJobsRevision'
import { addJobApplication } from '../lib/talentmatchStorage'
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
  applyModal: {
    title: 'Apply for this role',
    subtitle: 'Add a short note for the hiring team.',
    jobLine: 'Applying to',
    coverLabel: 'Cover letter or message',
    coverPlaceholder: 'Tell the employer why you are a great fit…',
    linkedinLabel: 'LinkedIn profile (optional)',
    linkedinPlaceholder: 'https://linkedin.com/in/…',
    cancel: 'Cancel',
    submit: 'Submit application',
    successTitle: 'Application sent',
    successBody: 'Done — check My Applications for this entry.',
    close: 'Close',
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

// Rich copy for one featured role; everyone else gets the generic template below.
function buildDetails(job) {
  if (job?.employerPosted && job.description) {
    const parts = String(job.description)
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const overview = parts[0] ?? job.description
    const responsibilities = parts.length > 1 ? parts.slice(1) : [job.description]
    const requirements = []
    if (job.educationRequirement) requirements.push(`Education: ${job.educationRequirement}`)
    if (job.experienceYears) requirements.push(`Experience: ${job.experienceYears}`)
    if (job.workMode) requirements.push(`Work mode: ${job.workMode}`)
    if (job.tags?.length) requirements.push(`Skills: ${job.tags.join(', ')}`)
    return {
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary ?? '',
      overview,
      responsibilities,
      requirements: requirements.length
        ? requirements
        : ['See job description for full requirements.'],
    }
  }

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

// Figure out which screen opened job details (drives back link + active nav).
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
  const jobsRev = useJobsRevision()

  const jobFromNav = location.state?.job
  const fallbackJob = useMemo(() => getAllJobs()[0] ?? SAMPLE_JOBS[0], [jobsRev])
  const job = jobFromNav ?? fallbackJob

  const openedFrom = useMemo(
    () => resolveSource(location, searchParams),
    [location.state, searchParams],
  )

  const detail = useMemo(() => buildDetails(job), [job])

  const [applyOpen, setApplyOpen] = useState(false)
  const [applyStep, setApplyStep] = useState('form')
  const [coverLetter, setCoverLetter] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [applyError, setApplyError] = useState('')

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

  const openApplyModal = () => {
    setApplyStep('form')
    setCoverLetter('')
    setLinkedinUrl('')
    setApplyError('')
    setApplyOpen(true)
  }

  const closeApplyModal = () => {
    setApplyOpen(false)
    setApplyStep('form')
    setApplyError('')
  }

  useEffect(() => {
    if (!applyOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeApplyModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyOpen])

  const submitApplication = async () => {
    const trimmed = coverLetter.trim()
    if (trimmed.length < 8) {
      setApplyError('Please add a short message (at least a few words).')
      return
    }
    setApplyError('')
    try {
      await addJobApplication({
        jobId: job?.id ?? 'unknown',
        jobTitle: detail.title,
        company: detail.company,
        location: detail.location,
        jobType: detail.type,
        coverLetter: trimmed,
        linkedinUrl: linkedinUrl.trim() || null,
      })
      setApplyStep('success')
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : 'Could not save application.')
    }
  }

  const m = DETAILS_CONFIG.applyModal

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
            <button type="button" className="jd-apply" onClick={openApplyModal}>
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

      {applyOpen ? (
        <div
          className="jd-modal-root"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeApplyModal()
          }}
        >
          <div className="jd-modal" role="dialog" aria-modal="true" aria-labelledby="apply-modal-title">
            {applyStep === 'form' ? (
              <>
                <h2 id="apply-modal-title">{m.title}</h2>
                <p className="jd-modal-sub">{m.subtitle}</p>
                <p className="jd-modal-job">
                  {m.jobLine}: <strong>{detail.title}</strong> — {detail.company}
                </p>

                <label className="jd-modal-field">
                  <span>{m.coverLabel}</span>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder={m.coverPlaceholder}
                    rows={5}
                  />
                </label>

                <label className="jd-modal-field">
                  <span>{m.linkedinLabel}</span>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder={m.linkedinPlaceholder}
                  />
                </label>

                {applyError ? (
                  <p className="jd-modal-error" role="alert">
                    {applyError}
                  </p>
                ) : null}

                <div className="jd-modal-actions">
                  <button type="button" className="jd-modal-cancel" onClick={closeApplyModal}>
                    {m.cancel}
                  </button>
                  <button type="button" className="jd-modal-submit" onClick={submitApplication}>
                    {m.submit}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="apply-modal-title">{m.successTitle}</h2>
                <p className="jd-modal-sub">{m.successBody}</p>
                <div className="jd-modal-actions jd-modal-actions-single">
                  <button type="button" className="jd-modal-submit" onClick={closeApplyModal}>
                    {m.close}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CandidateJobDetailsPage
