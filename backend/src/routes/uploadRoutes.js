import express from 'express'
import { upload, uploadFiles, listPendingFiles } from '../controllers/uploadController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST /api/uploads -> sube archivos a pending de la empresa activa
router.post('/', protect, upload.array('files', 10), uploadFiles)

// GET /api/uploads/pending -> lista archivos pendientes de la empresa activa
router.get('/pending', protect, listPendingFiles)

// Compatibilidad con URLs antiguas: companyId se ignora y se usa el token.
router.post('/:companyId', protect, upload.array('files', 10), uploadFiles)
router.get('/:companyId/pending', protect, listPendingFiles)

export default router
