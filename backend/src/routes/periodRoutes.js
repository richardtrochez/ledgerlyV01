import express from 'express'
import { getPeriods, createPeriod,closePeriod } from '../controllers/periodController.js'

const router = express.Router()

router.get('/', getPeriods)
router.post('/', createPeriod)
router.put('/:id/close', closePeriod)

export default router
