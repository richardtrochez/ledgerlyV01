import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { analizarFinanzas } from '../controllers/agentController.js'

const router = express.Router()

router.use(protect)

// GET /api/agent/analisis?year=2025
router.get('/analisis', analizarFinanzas)

export default router
