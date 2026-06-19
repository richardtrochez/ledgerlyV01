import Purchase from '../models/purchase.js'
import Period from '../models/Period.js'

const COMPANY_ID = '000000000000000000000001'

/**
 * @desc    Obtener todas las compras de un período
 * @route   GET /api/purchases?periodId=...
 */
export const getPurchases = async (req, res) => {
  try {
    const { periodId } = req.query

    if (!periodId) {
      return res.status(400).json({
        success: false,
        message: 'periodId es requerido'
      })
    }

    const purchases = await Purchase.find({
      companyId: COMPANY_ID,
      periodId
    }).sort({ fechaDocumento: -1 })

    console.log(` Compras obtenidas: ${purchases.length}`)

    res.json({
      success: true,
      count: purchases.length,
      data: purchases
    })
  } catch (error) {
    console.error('Error al obtener compras:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener compras',
      error: error.message
    })
  }
}

/**
 * @desc    Obtener una compra por ID
 * @route   GET /api/purchases/:id
 */
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    res.json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('Error al obtener compra:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener compra',
      error: error.message
    })
  }
}

//creacion de compras

export const createPurchase = async (req, res) => {
  try {
    const {
      periodId,
      fechaDocumento,
      fechaContabilizacion,
      proveedor,
      rtnProveedor,
      numeroFactura,
      CAI,
      descripcion,
      subtotalExento,
      subtotal15,
      isv15,
      subtotal18,
      isv18,
      gastoNoDeducible
    } = req.body

    // ========== VALIDACIONES ==========
    if (!periodId || !fechaDocumento || !fechaContabilizacion || !proveedor || !rtnProveedor || !numeroFactura || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: periodId, fechaDocumento, fechaContabilizacion, proveedor, rtnProveedor, numeroFactura, descripcion'
      })
    }

    // Validar que el período existe
    const period = await Period.findById(periodId)
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Período no encontrado'
      })
    }

    // Validar que el período no esté cerrado
    if (period.status === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'El período está cerrado y no acepta nuevas transacciones'
      })
    }

    // Validar que al menos haya un subtotal
    const totalSubtotales = (parseFloat(subtotalExento) || 0) + 
                            (parseFloat(subtotal15) || 0) + 
                            (parseFloat(subtotal18) || 0)

    if (totalSubtotales <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar al menos un subtotal (exento, 15% o 18%)'
      })
    }

    // ========== CREAR COMPRA ==========
    const purchase = await Purchase.create({
      companyId: COMPANY_ID,
      periodId,
      fechaDocumento: new Date(fechaDocumento),
      fechaContabilizacion: new Date(fechaContabilizacion),
      proveedor,
      rtnProveedor,
      numeroFactura,
      CAI: CAI || '',
      descripcion,
      subtotalExento: parseFloat(subtotalExento) || 0,
      subtotal15: parseFloat(subtotal15) || 0,
      isv15: parseFloat(isv15) || 0,
      subtotal18: parseFloat(subtotal18) || 0,
      isv18: parseFloat(isv18) || 0,
      gastoNoDeducible: parseFloat(gastoNoDeducible) || 0,
      creadoPor: req.user?.id
    })

    console.log(`✅ Compra creada: ${purchase._id}`)

    res.status(201).json({
      success: true,
      message: 'Compra creada exitosamente',
      data: purchase
    })
  } catch (error) {
    console.error('Error al crear compra:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear compra',
      error: error.message
    })
  }
}

/**
 * @desc    Actualizar una compra
 * @route   PUT /api/purchases/:id
 */
export const updatePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id
    const updateData = req.body

    const purchase = await Purchase.findById(purchaseId)

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    // Actualizar campos del body
    const fields = [
      'fechaDocumento', 'fechaContabilizacion', 'proveedor', 'rtnProveedor',
      'CAI', 'numeroFactura', 'descripcion',
      'subtotalExento', 'subtotal15', 'isv15', 'subtotal18', 'isv18',
      'gastoNoDeducible', 'estado'
    ]
    fields.forEach(field => {
      if (updateData[field] !== undefined) purchase[field] = updateData[field]
    })

    purchase.editadoPor = req.user?.id

    // save() ejecuta el pre-save hook que recalcula totalBruto y creditoFiscal
    await purchase.save()

    console.log(`Compra actualizada: ${purchaseId}`)

    res.json({
      success: true,
      message: 'Compra actualizada exitosamente',
      data: purchase
    })
  } catch (error) {
    console.error('Error al actualizar compra:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar compra',
      error: error.message
    })
  }
}

/**
 * @desc    Eliminar una compra
 * @route   DELETE /api/purchases/:id
 */
export const deletePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id

    const purchase = await Purchase.findByIdAndDelete(purchaseId)

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      })
    }

    console.log(`✅ Compra eliminada: ${purchaseId}`)

    res.json({
      success: true,
      message: 'Compra eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar compra:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar compra',
      error: error.message
    })
  }
}

export default {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
}