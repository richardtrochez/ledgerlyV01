import Period from '../models/Period.js'
import Transaction from '../models/Transaction.js'
import Purchase from '../models/purchase.js'

const getCompanyId = (req, res) => {
  const companyId = req.user?.companyId
  if (!companyId) {
    res.status(403).json({ success: false, message: 'Tu usuario no tiene empresa asignada' })
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

// Agrega totales de un conjunto de transacciones + compras
function calcularTotales(transactions, purchases) {
  const ingresos = transactions.filter(tx => tx.type === 'ingreso')
  const egresos = transactions.filter(tx => tx.type === 'egreso')

  const totalIngresos = ingresos.reduce((s, tx) => s + (tx.monto || 0), 0)
  const totalEgresos = egresos.reduce((s, tx) => s + (tx.monto || 0), 0)
  const totalCompras = purchases.reduce((s, p) => s + getPurchaseTotal(p), 0)
  const utilidadNeta = totalIngresos - totalEgresos - totalCompras

  return {
    totalIngresos,
    totalEgresos,
    totalCompras,
    utilidadNeta,
    cantidadIngresos: ingresos.length,
    cantidadEgresos: egresos.length,
    cantidadCompras: purchases.length
  }
}

// Variacion porcentual entre dos valores. Devuelve null si no hay base para comparar.
function calcularVariacion(actual, anterior) {
  if (anterior === null || anterior === undefined) return null
  if (anterior === 0) {
    if (actual === 0) return { valor: 0, direccion: 'igual' }
    return { valor: null, direccion: actual > 0 ? 'sube' : 'baja', sinBase: true }
  }
  const cambio = ((actual - anterior) / Math.abs(anterior)) * 100
  return {
    valor: Number(cambio.toFixed(1)),
    direccion: cambio > 0.05 ? 'sube' : (cambio < -0.05 ? 'baja' : 'igual')
  }
}

// Nombres de meses en espanol para los labels de comparacion
const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const year = Number(req.query.year) || new Date().getFullYear()

    // Traer TODOS los periodos de la empresa (necesitamos historicos para comparar)
    const allPeriods = await Period.find({ companyId }).lean()
    const periodsThisYear = allPeriods.filter(p => p.year === year)
    const periodIdsThisYear = periodsThisYear.map(p => p._id)

    const transactionsYear = await Transaction.find({
      companyId,
      periodId: { $in: periodIdsThisYear }
    }).lean()

    const purchasesYear = await Purchase.find({
      companyId,
      periodId: { $in: periodIdsThisYear },
      estado: { $ne: 'cancelada' }
    }).lean()

    // Totales del ANO completo
    const totalesYear = calcularTotales(transactionsYear, purchasesYear)

    // ------- Comparacion mes actual vs mes anterior -------
    // "Mes actual" = ultimo periodo (mas reciente) que tenga transacciones o compras.
    // Si no hay ninguno, ambos quedan null y no habra comparacion.
    const periodsOrdenados = [...allPeriods].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    // Encuentro el periodo mas reciente que tenga datos
    let currentPeriod = null
    let previousPeriod = null

    for (const p of periodsOrdenados) {
      const tieneDatos =
        transactionsYear.some(t => String(t.periodId) === String(p._id)) ||
        purchasesYear.some(pu => String(pu.periodId) === String(p._id))
      if (tieneDatos && !currentPeriod) {
        currentPeriod = p
      } else if (currentPeriod && !previousPeriod) {
        // El siguiente en el orden (mas antiguo) es el anterior
        previousPeriod = p
        break
      }
    }
    // Fallback: si no encontro anteriores por datos, usa el previo cronologico
    if (currentPeriod && !previousPeriod) {
      const idx = periodsOrdenados.findIndex(p => String(p._id) === String(currentPeriod._id))
      previousPeriod = periodsOrdenados[idx + 1] || null
    }

    // Calcular totales de cada periodo
    let totalesCurrent = null
    let totalesPrev = null

    if (currentPeriod) {
      const txCur = transactionsYear.filter(t => String(t.periodId) === String(currentPeriod._id))
      const puCur = purchasesYear.filter(p => String(p.periodId) === String(currentPeriod._id))
      totalesCurrent = calcularTotales(txCur, puCur)
    }

    if (previousPeriod) {
      // El periodo anterior puede ser de OTRO ano, hay que traer sus datos separadamente
      const txPrev = await Transaction.find({ companyId, periodId: previousPeriod._id }).lean()
      const puPrev = await Purchase.find({
        companyId, periodId: previousPeriod._id, estado: { $ne: 'cancelada' }
      }).lean()
      totalesPrev = calcularTotales(txPrev, puPrev)
    }

    // Variaciones (null si no hay periodo anterior)
    const variacion = totalesPrev ? {
      ingresos:     calcularVariacion(totalesCurrent.totalIngresos,  totalesPrev.totalIngresos),
      egresos:      calcularVariacion(totalesCurrent.totalEgresos,   totalesPrev.totalEgresos),
      compras:      calcularVariacion(totalesCurrent.totalCompras,   totalesPrev.totalCompras),
      utilidadNeta: calcularVariacion(totalesCurrent.utilidadNeta,   totalesPrev.utilidadNeta),
      etiqueta:     MESES[previousPeriod.month] + (previousPeriod.year !== currentPeriod.year ? ' ' + previousPeriod.year : '')
    } : null

    // ------- Indicadores de rendimiento (basados en el ano) -------
    // Aproximaciones funcionales (no hay separacion estricta costo directo vs operativo):
    //   Margen bruto     = (Ingresos - Compras) / Ingresos  (compras como aprox de costo)
    //   Margen operativo = (Ingresos - Compras - Egresos) / Ingresos
    //   Ratio gasto/ingresos = (Egresos + Compras) / Ingresos
    const ingresosBase = totalesYear.totalIngresos
    const indicadores = {
      margenBruto: {
        valor: ingresosBase > 0 ? ((ingresosBase - totalesYear.totalCompras) / ingresosBase) * 100 : 0,
        umbral: 30,        // meta minima recomendada
        direccion: 'mayor' // "mayor umbral es mejor"
      },
      margenOperativo: {
        valor: ingresosBase > 0 ? ((ingresosBase - totalesYear.totalCompras - totalesYear.totalEgresos) / ingresosBase) * 100 : 0,
        umbral: 10,
        direccion: 'mayor'
      },
      ratioGastoIngresos: {
        valor: ingresosBase > 0 ? ((totalesYear.totalEgresos + totalesYear.totalCompras) / ingresosBase) * 100 : 0,
        umbral: 100,
        direccion: 'menor'  // "menor umbral es mejor"
      }
    }

    // ------- Ultimas transacciones y compras (misma logica que antes) -------
    const ultimasTransacciones = [...transactionsYear]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(tx => ({
        _id: tx._id,
        fecha: tx.fecha,
        type: tx.type,
        descripcion: tx.descripcion,
        monto: tx.monto
      }))

    const ultimasCompras = [...purchasesYear]
      .sort((a, b) => new Date(b.fechaDocumento) - new Date(a.fechaDocumento))
      .slice(0, 3)
      .map(p => ({
        _id: p._id,
        fechaDocumento: p.fechaDocumento,
        proveedor: p.proveedor,
        numeroFactura: p.numeroFactura,
        totalBruto: getPurchaseTotal(p)
      }))

    // ------- Respuesta -------
    // Mantiene los campos antiguos por retro-compatibilidad,
    // y agrega variacion + indicadores + comparacion de periodo.
    res.json({
      success: true,
      data: {
        year,
        ...totalesYear,

        // Datos del periodo mas reciente (para la fila principal de KPIs)
        periodoActualNombre: currentPeriod
          ? `${MESES[currentPeriod.month].charAt(0).toUpperCase() + MESES[currentPeriod.month].slice(1)} ${currentPeriod.year}`
          : null,
        totalesPeriodoActual: totalesCurrent,
        summaryAnterior: totalesPrev,
        variacion,

        // Indicadores de rendimiento (barras de progreso en el UI)
        indicadores,

        // Metadata
        periodosRegistrados: periodsThisYear.length,
        periodosAbiertos: periodsThisYear.filter(p => p.status === 'abierto').length,
        periodoActual: currentPeriod
          ? { month: currentPeriod.month, year: currentPeriod.year, status: currentPeriod.status }
          : null,

        ultimasTransacciones,
        ultimasCompras
      }
    })
  } catch (error) {
    console.error('Error en getDashboardSummary:', error)
    res.status(500).json({ success: false, message: 'Error al obtener resumen del dashboard' })
  }
}

export default { getDashboardSummary }
