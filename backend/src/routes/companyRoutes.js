import express from 'express'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { getCompanies, createCompany } from '../controllers/companyController.js'

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.get('/', getCompanies)
router.post('/', createCompany)

export default router
