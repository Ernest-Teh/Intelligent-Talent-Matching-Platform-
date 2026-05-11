import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EMPLOYER_SEARCH_CANDIDATES } from '../data/employerSearchCandidates'
import {
  getEmployerCandidateShortlistIds,
  toggleEmployerCandidateShortlist,
} from '../lib/talentmatchStorage'
import './EmployerFindCandidatesPage.css'

const FIND_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  sidebarItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/employer/dashboard' },
    { id: 'create-job', label: 'Create Job', path: '/employer/create-job' },
    { id: 'find-candidates', label: 'Find Candidates', path: '/employer/find-candidates' },
  ],
  sidebarFooter: { id: 'logout', label: 'Logout' },
  title: 'Find Candidates',
  subtitle: 'Search and discover qualified talent for your team',
  searchPlaceholder: 'Search candidates by name, skills, or education...',
  searchButton: 'Search',
  skillsFilterPlaceholder: 'Filter by skills',
  educationLabel: 'Education',
  experienceLabel: 'Experience',
  educationOptions: [
    { value: 'all', label: 'All levels' },
    { value: "bachelor", label: "Bachelor's focus" },
    { value: 'master', label: "Master's focus" },
  ],
  experienceOptions: [
    { value: 'all', label: 'All experience' },
    { value: '1-3', label: '1–3 years' },
    { value: '4-5', label: '4–5 years' },
    { value: '6+', label: '6+ years' },
  ],
  matchLabel: 'Match:',
  shortlist: 'Shortlist',
  shortlisted: 'Shortlisted',
  viewProfile: 'View Profile',
  showingPrefix: 'Showing',
  showingSuffix: 'candidates',
  modalTitle: 'Candidate profile',
  close: 'Close',
  contact: 'Contact (demo)',
}

function matchesEducationFilter(candidate, value) {
  if (value === 'all') return true
  const ed = candidate.education.toLowerCase()
  if (value === 'bachelor') return ed.includes('bachelor')
  if (value === 'master') return ed.includes('master')
  return true
}

function matchesExperienceFilter(candidate, value) {
  if (value === 'all') return true
  const y = candidate.yearsExp
  if (value === '1-3') return y >= 1 && y <= 3
  if (value === '4-5') return y >= 4 && y <= 5
  if (value === '6+') return y >= 6
  return true
}

function applyFilters(candidates, query, skillText, education, experience) {
  const q = query.trim().toLowerCase()
  const sk = skillText.trim().toLowerCase()

  return candidates.filter((c) => {
    if (!matchesEducationFilter(c, education)) return false
    if (!matchesExperienceFilter(c, experience)) return false

    const blob = [
      c.name,
      c.education,
      c.experienceLabel,
      c.headline,
      ...(c.skills || []),
    ]
      .join(' ')
      .toLowerCase()

    if (q && !blob.includes(q)) return false

    if (sk) {
      const tokens = sk.split(/[,]+/).map((t) => t.trim()).filter(Boolean)
      const hay = [...c.skills, c.name, c.headline].join(' ').toLowerCase()
      const skillMatch = tokens.every((token) => hay.includes(token))
      if (!skillMatch) return false
    }

    return true
  })
}

function EmployerFindCandidatesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [skillText, setSkillText] = useState('')
  const [education, setEducation] = useState('all')
  const [experience, setExperience] = useState('all')
  const [feedback, setFeedback] = useState('')

  const [shortlistIds, setShortlistIds] = useState(getEmployerCandidateShortlistIds)
  const [profileCandidate, setProfileCandidate] = useState(null)

  useEffect(() => {
    setShortlistIds(getEmployerCandidateShortlistIds())
  }, [])

  useEffect(() => {
    if (!profileCandidate) return
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileCandidate(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [profileCandidate])

  const themeVars = useMemo(
    () => ({
      '--emp-white': '#FFFFFF',
      '--emp-page-bg': '#F8FAFC',
      '--emp-border': '#E2E8F0',
      '--emp-primary': '#2563EB',
      '--emp-heading': '#1E293B',
      '--emp-body': '#64748B',
      '--emp-chip-bg': '#EFF6FF',
      '--emp-match-bg': '#DCFCE7',
      '--emp-match-text': '#008236',
      '--emp-match-warn-bg': '#FFEDD5',
      '--emp-match-warn-text': '#C2410C',
    }),
    [],
  )

  const results = useMemo(
    () => applyFilters(EMPLOYER_SEARCH_CANDIDATES, query, skillText, education, experience),
    [query, skillText, education, experience],
  )

  const runSearch = useCallback(() => {
    setFeedback(`Found ${results.length} candidate${results.length === 1 ? '' : 's'}`)
  }, [results.length])

  const toggleShortlist = (id) => {
    const { next, added } = toggleEmployerCandidateShortlist(id)
    setShortlistIds(next)
    const name = EMPLOYER_SEARCH_CANDIDATES.find((c) => c.id === id)?.name ?? id
    setFeedback(added ? `Shortlisted ${name}` : `Removed ${name} from shortlist`)
  }

  const goSidebar = (item) => {
    if (item.id === 'logout') {
      navigate('/')
      return
    }
    if (item.path) navigate(item.path)
  }

  const matchTone = (match) => (match >= 80 ? 'good' : 'warn')

  return (
    <div className="employer-page employer-find-page" style={themeVars}>
      <aside className="employer-sidebar">
        <div className="employer-brand-wrap">
          <button className="employer-brand" type="button" onClick={() => navigate('/')}>
            <span className="employer-brand-icon">{FIND_CONFIG.brand.glyph}</span>
            <span className="employer-brand-text">{FIND_CONFIG.brand.name}</span>
          </button>
        </div>
        <nav className="employer-nav">
          {FIND_CONFIG.sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`employer-nav-item ${item.id === 'find-candidates' ? 'active' : ''}`}
              onClick={() => goSidebar(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="employer-nav-footer">
          <button type="button" className="employer-nav-item" onClick={() => goSidebar(FIND_CONFIG.sidebarFooter)}>
            {FIND_CONFIG.sidebarFooter.label}
          </button>
        </div>
      </aside>

      <main className="employer-main efc-main">
        <header className="efc-header">
          <h1>{FIND_CONFIG.title}</h1>
          <p>{FIND_CONFIG.subtitle}</p>
        </header>

        <section className="efc-toolbar">
          <div className="efc-search-row">
            <div className="efc-search-input-wrap">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                placeholder={FIND_CONFIG.searchPlaceholder}
                aria-label={FIND_CONFIG.searchPlaceholder}
              />
            </div>
            <button type="button" className="efc-search-btn" onClick={runSearch}>
              {FIND_CONFIG.searchButton}
            </button>
          </div>

          <div className="efc-filters-row">
            <input
              type="text"
              className="efc-skill-filter"
              value={skillText}
              onChange={(e) => setSkillText(e.target.value)}
              placeholder={FIND_CONFIG.skillsFilterPlaceholder}
              aria-label={FIND_CONFIG.skillsFilterPlaceholder}
            />
            <label className="efc-filter-select">
              <span className="visually-hidden">{FIND_CONFIG.educationLabel}</span>
              <select value={education} onChange={(e) => setEducation(e.target.value)}>
                {FIND_CONFIG.educationOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="efc-filter-select">
              <span className="visually-hidden">{FIND_CONFIG.experienceLabel}</span>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                {FIND_CONFIG.experienceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <p className="efc-count">
          {FIND_CONFIG.showingPrefix}{' '}
          <strong>{results.length}</strong> {FIND_CONFIG.showingSuffix}
        </p>

        <div className="efc-list">
          {results.map((c) => {
            const shortlisted = shortlistIds.includes(c.id)
            return (
              <article key={c.id} className="efc-card">
                <div className="efc-card-main">
                  <h3>{c.name}</h3>
                  <p className="efc-edu">{c.education}</p>
                  <p className="efc-exp">{c.experienceLabel}</p>
                  <div className="efc-skills">
                    {c.skills.map((s) => (
                      <span key={s} className="efc-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="efc-card-actions">
                  <div className="efc-match-row">
                    <span className="efc-match-label">{FIND_CONFIG.matchLabel}</span>
                    <span className={`efc-match-pill efc-match-${matchTone(c.match)}`}>{c.match}%</span>
                  </div>
                  <div className="efc-action-btns">
                    <button
                      type="button"
                      className={`efc-btn-shortlist ${shortlisted ? 'is-active' : ''}`}
                      onClick={() => toggleShortlist(c.id)}
                    >
                      {shortlisted ? FIND_CONFIG.shortlisted : FIND_CONFIG.shortlist}
                    </button>
                    <button type="button" className="efc-btn-profile" onClick={() => setProfileCandidate(c)}>
                      {FIND_CONFIG.viewProfile}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {results.length === 0 ? <p className="efc-empty">No candidates match these filters.</p> : null}

        <p className="employer-feedback" aria-live="polite">
          {feedback}
        </p>
      </main>

      {profileCandidate ? (
        <div
          className="efc-modal-root"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProfileCandidate(null)
          }}
        >
          <div className="efc-modal" role="dialog" aria-modal="true" aria-labelledby="efc-modal-title">
            <h2 id="efc-modal-title">{FIND_CONFIG.modalTitle}</h2>
            <p className="efc-modal-name">{profileCandidate.name}</p>
            <p className="efc-modal-meta">{profileCandidate.headline}</p>
            <p className="efc-modal-meta">{profileCandidate.location}</p>
            <p className="efc-modal-meta">{profileCandidate.email}</p>
            <hr className="efc-modal-divider" />
            <p className="efc-modal-body">{profileCandidate.summary}</p>
            <p className="efc-modal-small">{profileCandidate.education}</p>
            <p className="efc-modal-small">{profileCandidate.experienceLabel}</p>
            <div className="efc-modal-skills">
              {profileCandidate.skills.map((s) => (
                <span key={s} className="efc-chip">
                  {s}
                </span>
              ))}
            </div>
            <div className="efc-modal-actions">
              <button type="button" className="efc-btn-ghost" onClick={() => setFeedback(`Demo: emailed ${profileCandidate.name}`)}>
                {FIND_CONFIG.contact}
              </button>
              <button type="button" className="efc-btn-profile" onClick={() => setProfileCandidate(null)}>
                {FIND_CONFIG.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EmployerFindCandidatesPage
