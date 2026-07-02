import Transaction from '../models/Transaction.js'
import Period from '../models/Period.js'
import mongoose from 'mongoose'

// ── Utilidad interna ──────────────────────────────────────────────────────────
// Extrae y valida el companyId del usuario autenticado
const getCompanyId = (req, res) => {
  const companyId = req.user?.companyId
  if (!companyId) {
    res.status(403).json({
      success: false,
      message: 'Tu usuario no tiene empresa asignada'
    })
    return null
  }
  return companyId
}

/**
 * @desc  Obtener transacciones por período
 * @route GET /api/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { periodId, type } = req.query
    const query = { companyId }

    if (periodId) query.periodId = periodId
    if (type)     query.type     = type

    const transactions = await Transaction.find(query)
      .populate('periodId', 'month year')
      .sort({ fecha: -1 })
      .lean()

    res.json({
      success: true,
      count: transactions.length,
      data:  transactions
    })
  } catch (error) {
    console.error('Error en getTransactions:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones'
    })
  }
}

/**
 * @desc  Obtener una transacción por ID
 * @route GET /api/transactions/:id
 */
export const getTransaction = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const transaction = await Transaction.findOne({
      _id:       req.params.id,
      companyId  // ← garantiza que solo puedes ver transacciones de tu empresa
    }).populate('periodId', 'month year')

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    res.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error en getTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacción'
    })
  }
}

/**
 * @desc  Crear nueva transacción
 * @route POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { periodId, type, fecha, accountCode, descripcion, monto } = req.body

    // Validar campos requeridos
    if (!periodId || !type || !fecha || !descripcion || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: periodId, type, fecha, descripcion, monto'
      })
    }

    if (!['ingreso', 'egreso'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type debe ser ingreso o egreso'
      })
    }

    if (parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      })
    }

    // Validar período abierto y que pertenezca a la misma empresa
    const period = await Period.findOne({ _id: periodId, companyId })
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Período no encontrado'
      })
    }

    if (period.status === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede registrar en un período cerrado'
      })
    }

    const transaction = await Transaction.create({
      companyId,
      periodId,
      type,
      fecha:       new Date(fecha),
      accountCode: type === 'ingreso' ? accountCode : '',
      descripcion: descripcion.trim(),
      monto:       parseFloat(monto)
    })

    await transaction.populate('periodId', 'month year')

    res.status(201).json({
      success: true,
      message: `${type === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado exitosamente`,
      data: transaction
    })
  } catch (error) {
    console.error('Error en createTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear transacción'
    })
  }
}

/**
 * @desc  Actualizar transacción
 * @route PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    // findOne con companyId garantiza que no puedes editar transacciones de otra empresa
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      companyId
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    const { type, fecha, accountCode, descripcion, monto } = req.body

    if (type)       transaction.type       = type
    if (fecha)      transaction.fecha      = new Date(fecha)
    if (descripcion) transaction.descripcion = descripcion.trim()
    if (monto)      transaction.monto      = parseFloat(monto)
    if (accountCode && transaction.type === 'ingreso') {
      transaction.accountCode = accountCode
    }

    await transaction.save()

    res.json({
      success: true,
      message: 'Transacción actualizada exitosamente',
      data: transaction
    })
  } catch (error) {
    console.error('Error en updateTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar transacción'
    })
  }
}

/**
 * @desc  Eliminar transacción
 * @route DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      companyId  // ← solo elimina si pertenece a tu empresa
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en deleteTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar transacción'
    })
  }
}

/**
 * @desc  Resumen financiero por período
 * @route GET /api/transactions/summary
 */
export const getTransactionsSummary = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { periodId } = req.query
    const query = { companyId: new mongoose.Types.ObjectId(companyId) }
    if (periodId) query.periodId = new mongoose.Types.ObjectId(periodId)

    const byType = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id:   '$type',
          total: { $sum: '$monto' },
          count: { $sum: 1 }
        }
      }
    ])

    const totalIngresos = byType.find(t => t._id === 'ingreso')?.total || 0
    const totalEgresos  = byType.find(t => t._id === 'egreso')?.total  || 0

    res.json({
      success: true,
      data: {
        totalIngresos,
        totalEgresos,
        neto:             totalIngresos - totalEgresos,
        cantidadIngresos: byType.find(t => t._id === 'ingreso')?.count || 0,
        cantidadEgresos:  byType.find(t => t._id === 'egreso')?.count  || 0
      }
    })
  } catch (error) {
    console.error('Error en getTransactionsSummary:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen'
    })
  }
}