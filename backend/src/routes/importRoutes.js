import express from 'express'
import { bulkCreate } from '../controllers/importController.js'

const router = express.Router()

// Importación masiva desde KNIME
router.post('/bulk-create', bulkCreate)

export default router