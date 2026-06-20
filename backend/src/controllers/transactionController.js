import Transaction from '../models/Transaction.js'
import Period from '../models/Period.js'

// GET - Obtener transacciones por período
export const getTransactions = async (req, res) => {
  try {
    const { periodId, type } = req.query
    const companyId = req.user.companyId || '000000000000000000000001'

    let query = { companyId }

    if (periodId) {
      query.periodId = periodId
    }

    if (type) {
      query.type = type
    }

    const transactions = await Transaction.find(query)
      .populate('periodId', 'month year')
      .sort({ fecha: -1 })
      .lean()

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error('Error en getTransactions:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones',
      error: error.message
    })
  }
}

// GET - Obtener una transacción por ID
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('periodId')

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    res.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error en getTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacción',
      error: error.message
    })
  }
}

// POST - Crear nueva transacción
export const createTransaction = async (req, res) => {
  try {
    const { periodId, type, fecha, accountCode, descripcion, monto } = req.body
    const companyId = req.user.companyId || '000000000000000000000001'

    // Validaciones
    if (!periodId || !type || !fecha || !descripcion || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      })
    }

    if (!['ingreso', 'egreso'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de transacción inválido'
      })
    }

    if (type === 'ingreso' && !accountCode) {
      return res.status(400).json({
        success: false,
        message: 'Categoría de ingreso requerida'
      })
    }

    // Validar período abierto
    const period = await Period.findById(periodId)
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

    // Validar que monto sea positivo
    if (monto <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      })
    }

    // Crear transacción
    const transaction = new Transaction({
      companyId,
      periodId,
      type,
      fecha: new Date(fecha),
      accountCode: type === 'ingreso' ? accountCode : '',
      descripcion: descripcion.trim(),
      monto: parseFloat(monto).toFixed(2)
    })

    await transaction.save()

    // Populate para respuesta
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
      message: 'Error al crear transacción',
      error: error.message
    })
  }
}

// PUT - Actualizar transacción
export const updateTransaction = async (req, res) => {
  try {
    const { type, fecha, accountCode, descripcion, monto } = req.body
    const companyId = req.user.companyId?.toString() || '000000000000000000000001'

    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    // Validar que pertenezca a la misma empresa
    if (transaction.companyId.toString() !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta transacción'
      })
    }

    // Actualizar campos
    if (type) transaction.type = type
    if (fecha) transaction.fecha = new Date(fecha)
    if (accountCode && type === 'ingreso') transaction.accountCode = accountCode
    if (descripcion) transaction.descripcion = descripcion.trim()
    if (monto) transaction.monto = parseFloat(monto).toFixed(2)

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
      message: 'Error al actualizar transacción',
      error: error.message
    })
  }
}

// DELETE - Eliminar transacción
export const deleteTransaction = async (req, res) => {
  try {
    const companyId = req.user.companyId?.toString() || '000000000000000000000001'

    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      })
    }

    // Validar que pertenezca a la misma empresa
    if (transaction.companyId.toString() !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta transacción'
      })
    }

    await Transaction.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en deleteTransaction:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar transacción',
      error: error.message
    })
  }
}

// GET - Resumen por tipo y categoría
export const getTransactionsSummary = async (req, res) => {
  try {
    const { periodId } = req.query
    const companyId = req.user.companyId || '000000000000000000000001'

    const query = { companyId }
    if (periodId) {
      query.periodId = periodId
    }

    // Totales por tipo
    const byType = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$monto' },
          count: { $sum: 1 }
        }
      }
    ])

    // Totales por categoría (solo ingresos)
    const byCategory = await Transaction.aggregate([
      { $match: { ...query, type: 'ingreso' } },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$monto' },
          count: { $sum: 1 }
        }
      }
    ])

    const totalIngresos = byType.find(t => t._id === 'ingreso')?.total || 0
    const totalEgresos = byType.find(t => t._id === 'egreso')?.total || 0

    res.json({
      success: true,
      data: {
        byType,
        byCategory,
        totalIngresos,
        totalEgresos,
        neto: totalIngresos - totalEgresos
      }
    })
  } catch (error) {
    console.error('Error en getTransactionsSummary:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message
    })
  }
}