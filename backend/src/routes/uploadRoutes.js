import express from 'express'
import { upload, uploadFiles, listPendingFiles } from '../controllers/uploadController.js'

const router = express.Router()

// POST /api/uploads/:companyId        → sube archivos a pending
router.post('/:companyId', upload.array('files', 10), uploadFiles)

// GET  /api/uploads/:companyId/pending → lista archivos pendientes
router.get('/:companyId/pending', listPendingFiles)

export default router
