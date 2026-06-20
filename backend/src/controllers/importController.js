import Transaction from '../models/Transaction.js'
import Account from '../models/Account.js'
import Period from '../models/Period.js'
import Company from '../models/Company.js'
import {parseDate} from '../utils/dateParserBackend.js'

// 
const getOrCreatePeriod = async (date, companyId) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  let period = await Period.findOne({ year, month, companyId })
  if (!period) {
    period = await Period.create({ year, month, companyId, status: 'abierto' })
  }
  return period
}

export const bulkCreate = async (req, res) => {
  try {
    const { companyId, transactions } = req.body

    console.log('📥 Recibida petición de importación')
    console.log('Company ID:', companyId)
    console.log('Transacciones:', transactions ? transactions.length : 0)

    if (!companyId || !transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        message: 'companyId y transactions (array) son requeridos'
      })
    }

    const company = await Company.findOne({ code: companyId })
    if (!company) {
      return res.status(404).json({ success: false, message: `Empresa ${companyId} no encontrada` })
    }

    console.log('Empresa encontrada:', company.name)

    const results = { total: transactions.length, created: 0, errors: [] }

    for (let i = 0; i < transactions.length; i++) {
      try {
        const txData = transactions[i]
        console.log(`Procesando transacción ${i + 1}/${transactions.length}:`, txData)

        if (!txData.date || !txData.description || !txData.amount || !txData.accountCode) {
          results.errors.push({
            row: i + 1,
            data: txData,
            error: 'Faltan campos requeridos (date, description, amount, accountCode)'
          })
          continue
        }

        const parsedDate = parseDate(txData.date)
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          results.errors.push({ row: i + 1, data: txData, error: `Fecha inválida: ${txData.date}` })
          continue
        }

        const account = await Account.findOne({ code: String(txData.accountCode) })
        if (!account) {
          results.errors.push({ row: i + 1, data: txData, error: `Cuenta ${txData.accountCode} no encontrada` })
          continue
        }

        // ✅ FIX #8: usar la fecha de la transacción para determinar el periodo correcto
        const period = await getOrCreatePeriod(parsedDate, company._id)

        if (period.status === 'cerrado') {
          results.errors.push({
            row: i + 1,
            data: txData,
            error: `El periodo ${period.month}/${period.year} está cerrado y no acepta nuevas transacciones`
          })
          continue
        }

        const newTransaction = await Transaction.create({
          fecha: parsedDate,
          type: txData.type || (account.group === 'ingreso' ? 'ingreso' : 'egreso'),
          accountCode: String(txData.accountCode),
          monto: parseFloat(txData.amount),
          descripcion: txData.description,
          periodId: period._id,
          companyId: company._id
        })

        console.log('Transacción creada:', newTransaction._id)
        results.created++
      } catch (error) {
        console.error('Error en transacción:', error)
        results.errors.push({ row: i + 1, data: transactions[i], error: error.message })
      }
    }

    console.log('Resultado final:', results)

    res.json({
      success: true,
      message: `Importación completada: ${results.created} de ${results.total} transacciones creadas`,
      data: results
    })
  } catch (error) {
    console.error('Error en importación masiva:', error)
    res.status(500).json({ success: false, message: 'Error en importación masiva', error: error.message })
  }
}

export default { bulkCreate }
