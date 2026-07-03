import Period from '../models/Period.js'
import Transaction from '../models/Transaction.js'
import Purchase from '../models/purchase.js'

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

const getPurchaseTotal = (purchase) => {
  if (purchase.totalBruto) return purchase.totalBruto

  return (
    (purchase.baseExenta || 0) +
    (purchase.baseImponible15 || 0) +
    (purchase.isv15 || 0) +
    (purchase.baseImponible18 || 0) +
    (purchase.isv18 || 0) +
    (purchase.gastoNoDeducible || 0)
  )
}

export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const year = Number(req.query.year) || new Date().getFullYear()

    const periods = await Period.find({ companyId, year }).lean()
    const periodIds = periods.map(period => period._id)

    const transactions = await Transaction.find({
      companyId,
      periodId: { $in: periodIds }
    }).lean()

    const purchases = await Purchase.find({
      companyId,
      periodId: { $in: periodIds },
      estado: { $ne: 'cancelada' }
    }).lean()

    const ingresos = transactions.filter(tx => tx.type === 'ingreso')
    const egresos = transactions.filter(tx => tx.type === 'egreso')

    const totalIngresos = ingresos.reduce((sum, tx) => sum + (tx.monto || 0), 0)
    const totalEgresos = egresos.reduce((sum, tx) => sum + (tx.monto || 0), 0)
    const totalCompras = purchases.reduce((sum, purchase) => sum + getPurchaseTotal(purchase), 0)
    const utilidadNeta = totalIngresos - totalEgresos - totalCompras

    // Periodo del mes en curso (si existe)
    const currentMonth = new Date().getMonth() + 1
    const currentPeriod = periods.find(p => p.month === currentMonth) || null

    // Cuántos periodos abiertos hay en total en el año
    const periodosAbiertos = periods.filter(p => p.status === 'abierto').length

    // Últimas 5 transacciones (más recientes primero)
    const ultimasTransacciones = [...transactions]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(tx => ({
        _id: tx._id,
        fecha: tx.fecha,
        type: tx.type,
        descripcion: tx.descripcion,
        monto: tx.monto
      }))

    // Últimas 3 compras (más recientes primero)
    const ultimasCompras = [...purchases]
      .sort((a, b) => new Date(b.fechaDocumento) - new Date(a.fechaDocumento))
      .slice(0, 3)
      .map(p => ({
        _id: p._id,
        fechaDocumento: p.fechaDocumento,
        proveedor: p.proveedor,
        numeroFactura: p.numeroFactura,
        totalBruto: getPurchaseTotal(p)
      }))

    res.json({
      success: true,
      data: {
        year,
        totalIngresos,
        totalEgresos,
        totalCompras,
        utilidadNeta,
        periodosRegistrados: periods.length,
        periodosAbiertos,
        cantidadIngresos: ingresos.length,
        cantidadEgresos: egresos.length,
        cantidadCompras: purchases.length,
        periodoActual: currentPeriod
          ? { month: currentPeriod.month, year: currentPeriod.year, status: currentPeriod.status }
          : null,
        ultimasTransacciones,
        ultimasCompras
      }
    })
  } catch (error) {
    console.error('Error en getDashboardSummary:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del dashboard'
    })
  }
}

export default { getDashboardSummary }
