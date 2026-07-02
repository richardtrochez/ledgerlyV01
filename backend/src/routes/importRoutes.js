import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { bulkCreate } from '../controllers/importController.js'
import { importFromExcel, uploadExcel, downloadTemplate } from '../controllers/excelImportController.js'

const router = express.Router()

router.use(protect)

router.get('/template', downloadTemplate)
router.post('/excel', uploadExcel.single('file'), importFromExcel)
router.post('/excel/:companyId', uploadExcel.single('file'), importFromExcel)
router.post('/bulk-create', bulkCreate)

export default router
