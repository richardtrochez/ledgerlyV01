import multer from 'multer'
import * as XLSX from 'xlsx'
import Transaction from '../models/Transaction.js'
import Account from '../models/Account.js'
import Period from '../models/Period.js'
import Company from '../models/Company.js'
import { parseDate } from '../utils/dateParserBackend.js'

// ─── Multer en memoria (no escribe al disco) ─────────────────────────────────
export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV'))
  },
  limits: { fileSize: 5 * 1024 * 1024 }
})

// ─── Helper: obtener o crear período ─────────────────────────────────────────
const getOrCreatePeriod = async (date, companyId) => {
  const year  = date.getFullYear()
  const month = date.getMonth() + 1
  let period = await Period.findOne({ year, month, companyId })
  if (!period) {
    period = await Period.create({ year, month, companyId, status: 'abierto' })
  }
  return period
}

// ─── Helper: normalizar nombre de columna ────────────────────────────────────
const col = (row, ...keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key]
    // búsqueda case-insensitive
    const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
    if (found && row[found] !== undefined && row[found] !== '') return row[found]
  }
  return ''
}

/**
 * @desc  Importar transacciones desde un archivo Excel / CSV
 * @route POST /api/imports/excel/:companyId
 */
export const importFromExcel = async (req, res) => {
  try {
    const { companyId } = req.params

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' })
    }

    // Buscar empresa por código o por _id
    const company = await Company.findOne({ code: companyId }) ?? await Company.findById(companyId).catch(() => null)
    if (!company) {
      return res.status(404).json({ success: false, message: `Empresa "${companyId}" no encontrada` })
    }

    // Parsear Excel desde el buffer en memoria
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true })
    const sheet    = workbook.Sheets[workbook.SheetNames[0]]
    const rows     = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'El archivo no contiene datos' })
    }

    const results = { total: rows.length, created: 0, errors: [] }

    for (let i = 0; i < rows.length; i++) {
      const row    = rows[i]
      const rowNum = i + 2 // fila 1 = encabezado

      try {
        const fecha       = col(row, 'fecha', 'date', 'Fecha', 'Date')
        const descripcion = col(row, 'descripcion', 'description', 'Descripcion')
        const montoRaw    = col(row, 'monto', 'amount', 'Monto', 'Amount')
        const tipo        = String(col(row, 'tipo', 'type', 'Tipo', 'Type') || 'ingreso').toLowerCase().trim()
        const accountCode = String(col(row, 'accountCode', 'cuenta', 'codigo', 'Cuenta', 'Codigo') || '').trim()

        // Validar campos obligatorios
        if (!fecha || !descripcion || !montoRaw) {
          results.errors.push({ fila: rowNum, error: 'Faltan campos requeridos: fecha, descripcion, monto' })
          continue
        }

        // Parsear fecha (soporta Date de xlsx, DD/MM/YYYY, YYYY-MM-DD)
        const parsedDate = parseDate(fecha instanceof Date ? fecha : String(fecha))
        if (!parsedDate) {
          results.errors.push({ fila: rowNum, error: `Fecha inválida: "${fecha}". Use DD/MM/YYYY` })
          continue
        }

        // Validar tipo
        if (!['ingreso', 'egreso'].includes(tipo)) {
          results.errors.push({ fila: rowNum, error: `Tipo inválido: "${tipo}". Debe ser ingreso o egreso` })
          continue
        }

        // Parsear monto (admite comas como separador de miles)
        const monto = parseFloat(String(montoRaw).replace(/,/g, ''))
        if (isNaN(monto) || monto <= 0) {
          results.errors.push({ fila: rowNum, error: `Monto inválido: "${montoRaw}"` })
          continue
        }

        // Validar cuenta contable para ingresos
        let resolvedCode = ''
        if (tipo === 'ingreso') {
          if (!accountCode) {
            results.errors.push({ fila: rowNum, error: 'accountCode es requerido para ingresos' })
            continue
          }
          const account = await Account.findOne({ code: accountCode, companyId: company._id })
          if (!account) {
            results.errors.push({ fila: rowNum, error: `Cuenta "${accountCode}" no encontrada` })
            continue
          }
          resolvedCode = accountCode
        }

        // Obtener o crear período automáticamente
        const period = await getOrCreatePeriod(parsedDate, company._id)
        if (period.status === 'cerrado') {
          results.errors.push({ fila: rowNum, error: `El período ${period.month}/${period.year} está cerrado` })
          continue
        }

        await Transaction.create({
          companyId: company._id,
          periodId:  period._id,
          type:       tipo,
          fecha:      parsedDate,
          accountCode: resolvedCode,
          descripcion: String(descripcion).trim(),
          monto
        })

        results.created++
      } catch (err) {
        results.errors.push({ fila: rowNum, error: err.message })
      }
    }

    console.log(`✅ Importación Excel: ${results.created}/${results.total} creadas — ${results.errors.length} errores`)

    res.json({
      success: true,
      message: `Importación completada: ${results.created} de ${results.total} transacciones creadas`,
      data: results
    })
  } catch (error) {
    console.error('❌ Error en importación Excel:', error)
    res.status(500).json({ success: false, message: 'Error al procesar el archivo', error: error.message })
  }
}

/**
 * @desc  Descargar plantilla Excel con instrucciones
 * @route GET /api/imports/template
 */
export const downloadTemplate = (req, res) => {
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Plantilla ────────────────────────────────────────────────────
  const headers  = ['fecha', 'descripcion', 'monto', 'tipo', 'accountCode']
  const ejemplos = [
    ['01/06/2025', 'Venta café americano',       850.00,  'ingreso', '001'],
    ['02/06/2025', 'Pago factura electricidad', 1200.00,  'egreso',  ''   ],
    ['03/06/2025', 'Venta brunch especial',       650.00,  'ingreso', '002'],
    ['04/06/2025', 'Compra insumos cocina',      3500.00,  'egreso',  ''   ],
  ]

  const wsTransacciones = XLSX.utils.aoa_to_sheet([headers, ...ejemplos])
  wsTransacciones['!cols'] = [
    { wch: 14 }, // fecha
    { wch: 38 }, // descripcion
    { wch: 12 }, // monto
    { wch: 10 }, // tipo
    { wch: 14 }, // accountCode
  ]
  XLSX.utils.book_append_sheet(wb, wsTransacciones, 'Transacciones')

  // ── Hoja 2: Instrucciones ─────────────────────────────────────────────────
  const instrucciones = [
    ['INSTRUCCIONES DE USO'],
    [''],
    ['COLUMNAS REQUERIDAS:'],
    ['fecha',       'Formato: DD/MM/YYYY o YYYY-MM-DD (ej. 01/06/2025)'],
    ['descripcion', 'Texto descriptivo de la transacción'],
    ['monto',       'Número positivo. Usar punto como decimal (ej. 1250.50)'],
    ['tipo',        'Escribir: ingreso  o  egreso  (en minúsculas)'],
    ['accountCode', 'Código de cuenta contable. Requerido SOLO para ingresos'],
    [''],
    ['NOTAS IMPORTANTES:'],
    ['• No modificar los nombres de las columnas (fila 1)'],
    ['• El sistema crea el período automáticamente si no existe'],
    ['• Los egresos no requieren accountCode (puede dejarse vacío)'],
    ['• Los montos con comas como miles también son aceptados (ej. 1,250.50)'],
    [''],
    ['TIPOS VÁLIDOS DE CUENTA (accountCode):'],
    ['001', 'Café y Bebidas'],
    ['002', 'Brunchs'],
    ['003', 'Platos Fuertes'],
  ]

  const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones)
  wsInstrucciones['!cols'] = [{ wch: 16 }, { wch: 55 }]
  XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="plantilla-importacion-ledgerly.xlsx"')
  res.send(buffer)
}

export default { uploadExcel, importFromExcel, downloadTemplate }
