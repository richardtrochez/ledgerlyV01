import Purchase from '../models/purchase.js'
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

const parseMoney = (value) => Number.parseFloat(value) || 0

const assertOpenPeriod = async (periodId, companyId, closedMessage) => {
  const period = await Period.findOne({ _id: periodId, companyId })
  if (!period) {
    return { status: 404, message: 'Periodo no encontrado' }
  }
  if (period.status === 'cerrado') {
    return { status: 400, message: closedMessage }
  }
  return null
}

export const getPurchases = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { periodId } = req.query
    if (!periodId) {
      return res.status(400).json({
        success: false,
        message: 'periodId es requerido'
      })
    }

    const purchases = await Purchase.find({ companyId, periodId })
      .sort({ fechaDocumento: -1 })
      .lean()

    res.json({
      success: true,
      count: purchases.length,
      data: purchases
    })
  } catch (error) {
    console.error('Error en getPurchases:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener compras'
    })
  }
}

export const getPurchaseById = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      companyId
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    res.json({ success: true, data: purchase })
  } catch (error) {
    console.error('Error en getPurchaseById:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener compra'
    })
  }
}

export const createPurchase = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const {
      periodId,
      fechaDocumento,
      fechaContabilizacion,
      proveedor,
      rtnProveedor,
      numeroFactura,
      CAI,
      descripcion,
      baseExenta,
      baseImponible15,
      isv15,
      baseImponible18,
      isv18,
      gastoNoDeducible
    } = req.body

    if (!periodId || !fechaDocumento || !fechaContabilizacion ||
        !proveedor || !rtnProveedor || !numeroFactura || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      })
    }

    const periodError = await assertOpenPeriod(
      periodId,
      companyId,
      'El periodo esta cerrado y no acepta nuevas compras'
    )
    if (periodError) {
      return res.status(periodError.status).json({
        success: false,
        message: periodError.message
      })
    }

    const totalBases =
      parseMoney(baseExenta) +
      parseMoney(baseImponible15) +
      parseMoney(baseImponible18)

    if (totalBases <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar al menos un monto'
      })
    }

    const purchase = await Purchase.create({
      companyId,
      periodId,
      fechaDocumento: new Date(fechaDocumento),
      fechaContabilizacion: new Date(fechaContabilizacion),
      proveedor,
      rtnProveedor,
      numeroFactura,
      CAI: CAI || '',
      descripcion,
      baseExenta: parseMoney(baseExenta),
      baseImponible15: parseMoney(baseImponible15),
      isv15: parseMoney(isv15),
      baseImponible18: parseMoney(baseImponible18),
      isv18: parseMoney(isv18),
      gastoNoDeducible: parseMoney(gastoNoDeducible),
      creadoPor: req.user._id
    })

    res.status(201).json({
      success: true,
      message: 'Compra registrada exitosamente',
      data: purchase
    })
  } catch (error) {
    console.error('Error en createPurchase:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear compra'
    })
  }
}

export const updatePurchase = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      companyId
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    const periodError = await assertOpenPeriod(
      purchase.periodId,
      companyId,
      'No se puede editar una compra en un periodo cerrado'
    )
    if (periodError) {
      return res.status(periodError.status).json({
        success: false,
        message: periodError.message
      })
    }

    const camposPermitidos = [
      'fechaDocumento',
      'fechaContabilizacion',
      'proveedor',
      'rtnProveedor',
      'CAI',
      'numeroFactura',
      'descripcion',
      'baseExenta',
      'baseImponible15',
      'isv15',
      'baseImponible18',
      'isv18',
      'gastoNoDeducible',
      'estado'
    ]

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        purchase[campo] = req.body[campo]
      }
    })

    purchase.editadoPor = req.user._id
    await purchase.save()

    res.json({
      success: true,
      message: 'Compra actualizada exitosamente',
      data: purchase
    })
  } catch (error) {
    console.error('Error en updatePurchase:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar compra'
    })
  }
}

export const deletePurchase = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      companyId
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    const periodError = await assertOpenPeriod(
      purchase.periodId,
      companyId,
      'No se puede eliminar una compra en un periodo cerrado'
    )
    if (periodError) {
      return res.status(periodError.status).json({
        success: false,
        message: periodError.message
      })
    }

    await Purchase.deleteOne({
      _id: req.params.id,
      companyId
    })

    res.json({
      success: true,
      message: 'Compra eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en deletePurchase:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar compra'
    })
  }
}
