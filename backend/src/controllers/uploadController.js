import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Configuración de carpetas ────────────────────────────────────────────────
const getCompanyPendingDir = (companyId) => {
  const dir = path.join(__dirname, `../../../uploads/${companyId}/pending`)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

// ─── Multer: guarda en /uploads/{companyId}/pending/ ─────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.params.companyId || req.body.companyId || 'test1'
    cb(null, getCompanyPendingDir(companyId))
  },
  filename: (req, file, cb) => {
    // Conserva nombre original + timestamp para evitar colisiones
    const timestamp = Date.now()
    const original = file.originalname.replace(/\s+/g, '_')
    cb(null, `${timestamp}_${original}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                           // .xls
    'text/csv'                                                             // .csv
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB máximo
})

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * @desc  Subir uno o varios archivos a la carpeta pending de una empresa
 * @route POST /api/uploads/:companyId
 */
export const uploadFiles = async (req, res) => {
  try {
    const { companyId } = req.params

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' })
    }

    const uploaded = req.files.map(f => ({
      originalName: f.originalname,
      savedAs: f.filename,
      size: f.size,
      path: f.path
    }))

    console.log(`📁 ${uploaded.length} archivo(s) guardados en pending de ${companyId}:`)
    uploaded.forEach(f => console.log(`   → ${f.savedAs}`))

    return res.json({
      success: true,
      message: `${uploaded.length} archivo(s) listos para procesar con KNIME`,
      files: uploaded
    })
  } catch (error) {
    console.error('❌ Error en upload:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * @desc  Listar archivos pendientes de una empresa
 * @route GET /api/uploads/:companyId/pending
 */
export const listPendingFiles = async (req, res) => {
  try {
    const { companyId } = req.params
    const dir = getCompanyPendingDir(companyId)
    const files = fs.readdirSync(dir).map(name => ({
      name,
      size: fs.statSync(path.join(dir, name)).size,
      uploaded: new Date(parseInt(name.split('_')[0])).toLocaleString('es-HN')
    }))
    res.json({ success: true, files })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export default { upload, uploadFiles, listPendingFiles }
