import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getIncomeStatement, getIncomeStatementPDF } from '../controllers/reportController.js'

const router = express.Router()

router.use(protect)

router.get('/income-statement/pdf', getIncomeStatementPDF)
router.get('/income-statement', getIncomeStatement)



export default router























