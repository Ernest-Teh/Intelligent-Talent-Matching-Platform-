import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../api'
import './CandidateProfilePage.css'

const CANDIDATE_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  title: 'Create Your Profile',
  subtitle: 'Tell us about yourself so we can match you with the right roles.',
  fields: [
    { id: 'fullName', label: 'Full Name', placeholder: 'Enter full name', type: 'text' },
    { id: 'email', label: 'Email', placeholder: 'Enter email', type: 'email' },
    { id: 'phone', label: 'Phone', placeholder: 'Enter phone', type: 'text' },
    { id: 'location', label: 'Location', placeholder: 'City, Country', type: 'text' },
  ],
  education: {
    title: 'Education',
    fields: [
      { id: 'school', label: 'School / University', placeholder: 'Enter institution' },
      { id: 'degree', label: 'Degree', placeholder: 'Enter degree' },
      { id: 'gradYear', label: 'Graduation Year', placeholder: 'YYYY' },
    ],
  },
  workPreference: {
    title: 'Work Preference',
    options: [
      { id: 'remote', label: 'Remote' },
      { id: 'hybrid', label: 'Hybrid' },
      { id: 'onsite', label: 'On-site' },
    ],
  },
  experience: {
    title: 'Work Experience',
    fields: [
      { id: 'jobTitle', label: 'Job Title', placeholder: 'Role title' },
      { id: 'company', label: 'Company', placeholder: 'Company name' },
      { id: 'years', label: 'Years', placeholder: 'e.g. 2' },
    ],
  },
  resume: {
    title: 'Resume',
    hint: 'Drag and drop or click to browse',
    accept: '.pdf,.doc,.docx',
  },
  actions: {
    saveDraft: 'Save Draft',
    saveContinue: 'Save and Continue',
  },
}

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  school: '',
  degree: '',
  gradYear: '',
  workPreference: '',
  jobTitle: '',
  company: '',
  years: '',
}

async function saveToBackend(kind, body) {
  const res = await fetch(`${API_BASE}/api/candidate-profile/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Save failed')
  }
}

function CandidateProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(initialForm)
  const [resumeFile, setResumeFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [feedback, setFeedback] = useState('')

  const themeVars = useMemo(
    () => ({
      '--cp-bg': '#F8FAFC',
      '--cp-surface': '#FFFFFF',
      '--cp-heading': '#1E293B',
      '--cp-body': '#64748B',
      '--cp-border': '#E2E8F0',
      '--cp-primary': '#2563EB',
    }),
    [],
  )

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const onFile = (fileList) => {
    const file = fileList?.[0]
    if (file) setResumeFile(file.name)
  }

  const buildPayload = (status) => ({
    ...form,
    status,
    resumeFileName: resumeFile || null,
  })

  const saveDraft = async () => {
    try {
      await saveToBackend('draft', buildPayload('draft'))
      setFeedback('Draft saved on server')
    } catch (e) {
      setFeedback(e.message)
    }
  }

  const saveAndContinue = async () => {
    try {
      await saveToBackend('profile', buildPayload('complete'))
      localStorage.setItem('talentmatch-session', 'signup')
      navigate('/candidate/dashboard')
    } catch (e) {
      setFeedback(e.message)
    }
  }

  return (
    <div className="candidate-profile-page" style={themeVars}>
      <header className="cp-header">
        <div className="cp-wrap">
          <button className="cp-brand" type="button" onClick={() => navigate('/')}>
            <span className="cp-brand-icon">{CANDIDATE_CONFIG.brand.glyph}</span>
            <span>{CANDIDATE_CONFIG.brand.name}</span>
          </button>
        </div>
      </header>

      <main className="cp-main">
        <div className="cp-wrap">
          <section className="cp-card">
            <h1>{CANDIDATE_CONFIG.title}</h1>
            <p className="cp-sub">{CANDIDATE_CONFIG.subtitle}</p>

            <div className="cp-grid">
              {CANDIDATE_CONFIG.fields.map((f) => (
                <label key={f.id} className="cp-field">
                  <span>{f.label}</span>
                  <input name={f.id} type={f.type} value={form[f.id]} onChange={onChange} placeholder={f.placeholder} />
                </label>
              ))}
            </div>

            <h2 className="cp-section-title">{CANDIDATE_CONFIG.education.title}</h2>
            <div className="cp-grid">
              {CANDIDATE_CONFIG.education.fields.map((f) => (
                <label key={f.id} className="cp-field">
                  <span>{f.label}</span>
                  <input name={f.id} value={form[f.id]} onChange={onChange} placeholder={f.placeholder} />
                </label>
              ))}
            </div>

            <h2 className="cp-section-title">{CANDIDATE_CONFIG.workPreference.title}</h2>
            <div className="cp-radio-row">
              {CANDIDATE_CONFIG.workPreference.options.map((opt) => (
                <label key={opt.id} className="cp-radio">
                  <input
                    type="radio"
                    name="workPreference"
                    value={opt.id}
                    checked={form.workPreference === opt.id}
                    onChange={onChange}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <h2 className="cp-section-title">{CANDIDATE_CONFIG.experience.title}</h2>
            <div className="cp-grid">
              {CANDIDATE_CONFIG.experience.fields.map((f) => (
                <label key={f.id} className="cp-field">
                  <span>{f.label}</span>
                  <input name={f.id} value={form[f.id]} onChange={onChange} placeholder={f.placeholder} />
                </label>
              ))}
            </div>

            <h2 className="cp-section-title">{CANDIDATE_CONFIG.resume.title}</h2>
            <div
              className={`cp-drop ${dragActive ? 'is-active' : ''}`}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                onFile(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              role="presentation"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={CANDIDATE_CONFIG.resume.accept}
                hidden
                onChange={(e) => onFile(e.target.files)}
              />
              <p>{resumeFile || CANDIDATE_CONFIG.resume.hint}</p>
            </div>

            <div className="cp-actions">
              <button type="button" className="cp-ghost" onClick={saveDraft}>
                {CANDIDATE_CONFIG.actions.saveDraft}
              </button>
              <button type="button" className="cp-primary" onClick={saveAndContinue}>
                {CANDIDATE_CONFIG.actions.saveContinue}
              </button>
            </div>

            <p className="cp-feedback" aria-live="polite">
              {feedback}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default CandidateProfilePage
