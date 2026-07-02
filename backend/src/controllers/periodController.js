import Period from '../models/Period.js'

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
 * @desc  Obtener períodos de la empresa autenticada
 * @route GET /api/periods
 */
export const getPeriods = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    // companyId siempre desde req.user — nunca desde req.query
    const periods = await Period.find({ companyId })
      .sort({ year: -1, month: -1 })

    res.json({
      success: true,
      count: periods.length,
      data: periods
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener períodos'
    })
  }
}

/**
 * @desc  Crear período
 * @route POST /api/periods
 */
export const createPeriod = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { month, year } = req.body

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Mes y año son requeridos'
      })
    }

    // Verificar duplicado antes de intentar insertar
    const existing = await Period.findOne({ companyId, month, year })
    if (existing) {
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      return res.status(400).json({
        success: false,
        message: `Ya existe un período para ${meses[month - 1]} ${year}`
      })
    }

    // companyId desde req.user — no desde el body
    const period = await Period.create({ companyId, month, year })

    res.status(201).json({
      success: true,
      message: 'Período creado exitosamente',
      data: period
    })
  } catch (error) {
    // Fallback por si el índice único de MongoDB lo atrapa primero
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un período con ese mes y año'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Error al crear período'
    })
  }
}

/**
 * @desc  Cerrar período
 * @route PUT /api/periods/:id/close
 */
export const closePeriod = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    // findOne con companyId — no puedes cerrar períodos de otra empresa
    const period = await Period.findOne({
      _id: req.params.id,
      companyId
    })

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Período no encontrado'
      })
    }

    if (period.status === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'El período ya está cerrado'
      })
    }

    period.status   = 'cerrado'
    period.closedAt = new Date()
    period.closedBy = req.user._id  // ← auditoría: quién cerró el período

    await period.save()

    res.json({
      success: true,
      message: 'Período cerrado exitosamente',
      data: period
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar período'
    })
  }
}

export default { getPeriods, createPeriod, closePeriod }