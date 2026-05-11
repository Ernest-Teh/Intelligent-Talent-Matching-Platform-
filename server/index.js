import cors from 'cors'
import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = Number(process.env.PORT) || 4000

const dataDir = path.resolve(__dirname, '../data')
const draftPath = path.resolve(dataDir, 'candidate-profile-draft.json')
const profilePath = path.resolve(dataDir, 'candidate-profile.json')
const employerDraftPath = path.resolve(dataDir, 'employer-profile-draft.json')
const employerProfilePath = path.resolve(dataDir, 'employer-profile.json')

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

const candidatePaths = {
  draft: draftPath,
  profile: profilePath,
}

const employerPaths = {
  draft: employerDraftPath,
  profile: employerProfilePath,
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/candidate-profile/:kind', async (req, res) => {
  try {
    const { kind } = req.params
    const destination = candidatePaths[kind]
    if (!destination) {
      return res.status(400).json({ message: 'Invalid save kind' })
    }
    await ensureDataDir()
    const payload = { ...req.body, serverSavedAt: new Date().toISOString() }
    await fs.writeFile(destination, JSON.stringify(payload, null, 2), 'utf8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err?.message ?? 'Save failed' })
  }
})

app.post('/api/employer-profile/:kind', async (req, res) => {
  try {
    const { kind } = req.params
    const destination = employerPaths[kind]
    if (!destination) {
      return res.status(400).json({ message: 'Invalid save kind' })
    }
    await ensureDataDir()
    const payload = { ...req.body, serverSavedAt: new Date().toISOString() }
    await fs.writeFile(destination, JSON.stringify(payload, null, 2), 'utf8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err?.message ?? 'Save failed' })
  }
})

async function main() {
  await ensureDataDir()
  app.listen(port, () => {
    console.log(`TalentMatch API listening on http://localhost:${port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
