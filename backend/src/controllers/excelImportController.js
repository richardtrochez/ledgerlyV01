import multer from 'multer'
import * as XLSX from 'xlsx'
import Transaction from '../models/Transaction.js'
import Account from '../models/Account.js'
import Period from '../models/Period.js'
import { parseDate } from '../utils/dateParserBackend.js'

export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (allowed.includes(file.mimetype)) {
      cb(null, true)
      return
    }

    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV'))
  },
  limits: { fileSize: 5 * 1024 * 1024 }
})

const getOrCreatePeriod = async (date, companyId) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  let period = await Period.findOne({ year, month, companyId })
  if (!period) {
    period = await Period.create({ year, month, companyId, status: 'abierto' })
  }

  return period
}

const col = (row, ...keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key]

    const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
    if (found && row[found] !== undefined && row[found] !== '') return row[found]
  }

  return ''
}

export const importFromExcel = async (req, res) => {
  try {
    const companyId = req.user?.companyId

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Tu usuario no tiene empresa asignada'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibio ningun archivo'
      })
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El archivo no contiene datos'
      })
    }

    const results = { total: rows.length, created: 0, errors: [] }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      try {
        const fecha = col(row, 'fecha', 'date', 'Fecha', 'Date')
        const descripcion = col(row, 'descripcion', 'description', 'Descripcion')
        const montoRaw = col(row, 'monto', 'amount', 'Monto', 'Amount')
        const tipo = String(col(row, 'tipo', 'type', 'Tipo', 'Type') || 'ingreso').toLowerCase().trim()
        const accountCode = String(col(row, 'accountCode', 'cuenta', 'codigo', 'Cuenta', 'Codigo') || '').trim()

        if (!fecha || !descripcion || !montoRaw) {
          results.errors.push({ fila: rowNum, error: 'Faltan campos requeridos: fecha, descripcion, monto' })
          continue
        }

        const parsedDate = parseDate(fecha instanceof Date ? fecha : String(fecha))
        if (!parsedDate) {
          results.errors.push({ fila: rowNum, error: `Fecha invalida: "${fecha}". Use DD/MM/YYYY` })
          continue
        }

        if (!['ingreso', 'egreso'].includes(tipo)) {
          results.errors.push({ fila: rowNum, error: `Tipo invalido: "${tipo}". Debe ser ingreso o egreso` })
          continue
        }

        const monto = parseFloat(String(montoRaw).replace(/,/g, ''))
        if (Number.isNaN(monto) || monto <= 0) {
          results.errors.push({ fila: rowNum, error: `Monto invalido: "${montoRaw}"` })
          continue
        }

        let resolvedCode = ''
        if (tipo === 'ingreso') {
          if (!accountCode) {
            results.errors.push({ fila: rowNum, error: 'accountCode es requerido para ingresos' })
            continue
          }

          const account = await Account.findOne({ code: accountCode, companyId })
          if (!account) {
            results.errors.push({ fila: rowNum, error: `Cuenta "${accountCode}" no encontrada` })
            continue
          }

          resolvedCode = accountCode
        }

        const period = await getOrCreatePeriod(parsedDate, companyId)
        if (period.status === 'cerrado') {
          results.errors.push({ fila: rowNum, error: `El periodo ${period.month}/${period.year} esta cerrado` })
          continue
        }

        await Transaction.create({
          companyId,
          periodId: period._id,
          type: tipo,
          fecha: parsedDate,
          accountCode: resolvedCode,
          descripcion: String(descripcion).trim(),
          monto
        })

        results.created++
      } catch (err) {
        results.errors.push({ fila: rowNum, error: err.message })
      }
    }

    res.json({
      success: true,
      message: `Importacion completada: ${results.created} de ${results.total} transacciones creadas`,
      data: results
    })
  } catch (error) {
    console.error('Error en importacion Excel:', error)
    res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo',
      error: error.message
    })
  }
}

export const downloadTemplate = (req, res) => {
  const wb = XLSX.utils.book_new()

  const headers = ['fecha', 'descripcion', 'monto', 'tipo', 'accountCode']
  const examples = [
    ['01/06/2025', 'Venta cafe americano', 850.00, 'ingreso', '001'],
    ['02/06/2025', 'Pago factura electricidad', 1200.00, 'egreso', ''],
    ['03/06/2025', 'Venta brunch especial', 650.00, 'ingreso', '002'],
    ['04/06/2025', 'Compra insumos cocina', 3500.00, 'egreso', '']
  ]

  const wsTransactions = XLSX.utils.aoa_to_sheet([headers, ...examples])
  wsTransactions['!cols'] = [
    { wch: 14 },
    { wch: 38 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 }
  ]
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transacciones')

  const instructions = [
    ['INSTRUCCIONES DE USO'],
    [''],
    ['COLUMNAS REQUERIDAS:'],
    ['fecha', 'Formato: DD/MM/YYYY o YYYY-MM-DD (ej. 01/06/2025)'],
    ['descripcion', 'Texto descriptivo de la transaccion'],
    ['monto', 'Numero positivo. Usar punto como decimal (ej. 1250.50)'],
    ['tipo', 'Escribir: ingreso o egreso (en minusculas)'],
    ['accountCode', 'Codigo de cuenta contable. Requerido SOLO para ingresos'],
    [''],
    ['NOTAS IMPORTANTES:'],
    ['- No modificar los nombres de las columnas (fila 1)'],
    ['- El sistema crea el periodo automaticamente si no existe'],
    ['- Los egresos no requieren accountCode (puede dejarse vacio)'],
    ['- Los montos con comas como miles tambien son aceptados (ej. 1,250.50)'],
    [''],
    ['TIPOS VALIDOS DE CUENTA (accountCode):'],
    ['001', 'Cafe y Bebidas'],
    ['002', 'Brunchs'],
    ['003', 'Platos Fuertes']
  ]

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
  wsInstructions['!cols'] = [{ wch: 16 }, { wch: 55 }]
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="plantilla-importacion-ledgerly.xlsx"')
  res.send(buffer)
}

export default { uploadExcel, importFromExcel, downloadTemplate }
