import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadJson,
  saveEmployerDraft,
  saveEmployerProfileComplete,
  STORAGE_KEYS,
} from '../lib/talentmatchStorage'
import './EmployerSignupPage.css'

// Strings and fields for employer signup — edit here, not scattered in the markup.
const EMPLOYER_SIGNUP_CONFIG = {
  brand: { name: 'TalentMatch', glyph: 'T' },
  title: 'Create Employer Profile',
  subtitle: 'Set up your company details to start hiring.',
  fields: [
    { id: 'fullName', label: 'Full Name', placeholder: 'Enter full name' },
    { id: 'workEmail', label: 'Work Email', placeholder: 'Enter work email' },
    { id: 'companyName', label: 'Company Name', placeholder: 'Enter company name' },
    { id: 'companyWebsite', label: 'Company Website', placeholder: 'Enter website URL' },
    { id: 'jobTitle', label: 'Your Job Title', placeholder: 'Enter your role' },
    { id: 'industry', label: 'Industry', placeholder: 'Enter industry' },
  ],
  companySize: ['1-10', '11-50', '51-200', '201-500', '500+'],
  hiringModes: ['Remote', 'Hybrid', 'On-site'],
  labels: {
    companySize: 'Company Size',
    hiringMode: 'Preferred Hiring Mode',
    companyDescription: 'Company Description',
  },
  placeholders: {
    companySize: 'Select company size',
    companyDescription: 'Briefly describe your company and hiring goals...',
  },
  actions: {
    continue: 'Continue',
    saveDraft: 'Save Draft',
  },
}

const initialForm = {
  fullName: '',
  workEmail: '',
  companyName: '',
  companyWebsite: '',
  jobTitle: '',
  industry: '',
  companySize: '',
  hiringMode: '',
  companyDescription: '',
}

function readStoredEmployerForm() {
  const draft = loadJson(STORAGE_KEYS.employerDraft)
  const complete = loadJson(STORAGE_KEYS.employerProfile)
  const source = draft ?? complete
  if (!source || typeof source !== 'object') return null

  const next = { ...initialForm }
  for (const key of Object.keys(initialForm)) {
    if (source[key] != null && source[key] !== '') {
      next[key] = String(source[key])
    }
  }
  return next
}

function EmployerSignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [feedback, setFeedback] = useState('Fill in employer details to continue')

  const themeVars = useMemo(
    () => ({
      '--employer-signup-bg': '#F8FAFC',
      '--employer-signup-surface': '#FFFFFF',
      '--employer-signup-heading': '#1E293B',
      '--employer-signup-body': '#64748B',
      '--employer-signup-primary': '#2563EB',
      '--employer-signup-border': '#E2E8F0',
    }),
    [],
  )

  useEffect(() => {
    const stored = readStoredEmployerForm()
    if (stored) setFormData(stored)
  }, [])

  const onFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onContinue = async () => {
    try {
      await saveEmployerProfileComplete(formData)
      localStorage.setItem('talentmatch-employer-session', 'signup')
      setFeedback('Employer profile saved. Redirecting…')
      navigate('/employer/dashboard')
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const onDraft = async () => {
    try {
      await saveEmployerDraft(formData)
      setFeedback('Draft saved (see /data/employer-profile-draft.json when using npm run dev)')
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <div className="employer-signup-page" style={themeVars}>
      <header className="employer-signup-header">
        <div className="employer-signup-wrap">
          <button className="employer-signup-brand" type="button" onClick={() => navigate('/')}>
            <span className="employer-signup-brand-icon">{EMPLOYER_SIGNUP_CONFIG.brand.glyph}</span>
            <span className="employer-signup-brand-text">{EMPLOYER_SIGNUP_CONFIG.brand.name}</span>
          </button>
        </div>
      </header>

      <main className="employer-signup-main">
        <div className="employer-signup-wrap">
          <section className="employer-signup-card">
            <h1>{EMPLOYER_SIGNUP_CONFIG.title}</h1>
            <p>{EMPLOYER_SIGNUP_CONFIG.subtitle}</p>

            <div className="employer-signup-grid">
              {EMPLOYER_SIGNUP_CONFIG.fields.map((field) => (
                <label key={field.id} className="employer-signup-field">
                  <span>{field.label}</span>
                  <input
                    name={field.id}
                    value={formData[field.id]}
                    onChange={onFieldChange}
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>

            <div className="employer-signup-grid">
              <label className="employer-signup-field">
                <span>{EMPLOYER_SIGNUP_CONFIG.labels.companySize}</span>
                <select name="companySize" value={formData.companySize} onChange={onFieldChange}>
                  <option value="">{EMPLOYER_SIGNUP_CONFIG.placeholders.companySize}</option>
                  {EMPLOYER_SIGNUP_CONFIG.companySize.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="employer-signup-field">
                <span>{EMPLOYER_SIGNUP_CONFIG.labels.hiringMode}</span>
                <div className="employer-signup-radio-group">
                  {EMPLOYER_SIGNUP_CONFIG.hiringModes.map((mode) => (
                    <label key={mode} className="employer-signup-radio-option">
                      <input
                        type="radio"
                        name="hiringMode"
                        value={mode}
                        checked={formData.hiringMode === mode}
                        onChange={onFieldChange}
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>

            <label className="employer-signup-field">
              <span>{EMPLOYER_SIGNUP_CONFIG.labels.companyDescription}</span>
              <textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={onFieldChange}
                placeholder={EMPLOYER_SIGNUP_CONFIG.placeholders.companyDescription}
              />
            </label>

            <div className="employer-signup-actions">
              <button type="button" className="primary" onClick={onContinue}>
                {EMPLOYER_SIGNUP_CONFIG.actions.continue}
              </button>
              <button type="button" className="ghost" onClick={onDraft}>
                {EMPLOYER_SIGNUP_CONFIG.actions.saveDraft}
              </button>
            </div>

            <p className="employer-signup-feedback" aria-live="polite">
              {feedback}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default EmployerSignupPage
