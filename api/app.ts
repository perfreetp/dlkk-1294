import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { initDatabase } from './db/index.js'
import { seedMockData } from './db/mockData.js'
import candidateRoutes from './routes/candidates.js'
import jobRoutes from './routes/jobs.js'
import matchRoutes from './routes/match.js'
import communicationRoutes from './routes/communications.js'
import templateRoutes from './routes/templates.js'
import exportRoutes from './routes/export.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

initDatabase()
seedMockData()

app.use('/api/candidates', candidateRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/communications', communicationRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/export', exportRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
