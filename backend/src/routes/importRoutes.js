import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { bulkCreate } from '../controllers/importController.js'
import { importFromExcel, uploadExcel, downloadTemplate } from '../controllers/excelImportController.js'

const router = express.Router()

router.use(protect)

// GET  /api/imports/template              → descarga la plantilla Excel
router.get('/template', downloadTemplate)

// POST /api/imports/excel/:companyId      → sube y procesa un Excel directo
router.post('/excel/:companyId', uploadExcel.single('file'), importFromExcel)

// POST /api/imports/bulk-create           → importación por JSON (legacy/KNIME)
router.post('/bulk-create', bulkCreate)

export default router
