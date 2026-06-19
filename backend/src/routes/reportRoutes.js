import express from 'express'
import { getIncomeStatement, getIncomeStatementPDF } from '../controllers/reportController.js'

const router = express.Router()

router.get('/income-statement/pdf', getIncomeStatementPDF)
router.get('/income-statement', getIncomeStatement)



export default router























