import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getPeriods, createPeriod, closePeriod } from '../controllers/periodController.js'

const router = express.Router()

router.use(protect)

router.get('/', getPeriods)
router.post('/', createPeriod)
router.put('/:id', closePeriod)
router.put('/:id/close', closePeriod)

export default router
