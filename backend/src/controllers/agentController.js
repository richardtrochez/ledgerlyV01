import Groq from 'groq-sdk'
import Transaction from '../models/Transaction.js'
import Purchase from '../models/purchase.js'
import Period from '../models/Period.js'
import Account from '../models/Account.js'
import mongoose from 'mongoose'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const fmt   = (n) => `L ${Number(n || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`

// ─── Recolectar datos de UN período específico ────────────────────────────────
async function recolectarPeriodo(period, companyId) {
  const accounts = await Account.find({ companyId, isActive: true }).lean()
  const accountMap = {}
  accounts.forEach(a => { accountMap[a.code] = a.name })

  const transactions = await Transaction.find({ companyId, periodId: period._id }).lean()
  const purchases    = await Purchase.find({ companyId, periodId: period._id }).lean()

  const totalIngresos    = transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0)
  const totalEgresos     = transactions.filter(t => t.type === 'egreso').reduce((s, t) => s + (t.monto || 0), 0)
  const totalCompras     = purchases.reduce((s, p) => s + (p.totalBruto || 0), 0)
  const totalCreditoFiscal = purchases.reduce((s, p) => s + (p.creditoFiscal || 0), 0)

  const ingresosPorCuenta = {}
  transactions.filter(t => t.type === 'ingreso').forEach(t => {
    const nombre = accountMap[t.accountCode] || t.accountCode || 'Sin categoría'
    ingresosPorCuenta[nombre] = (ingresosPorCuenta[nombre] || 0) + (t.monto || 0)
  })

  const porProveedor = {}
  purchases.forEach(p => {
    porProveedor[p.proveedor] = (porProveedor[p.proveedor] || 0) + (p.totalBruto || 0)
  })
  const topProveedores = Object.entries(porProveedor).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return {
    mes: MESES[period.month - 1],
    year: period.year,
    month: period.month,
    status: period.status,
    totalIngresos,
    totalEgresos,
    totalCompras,
    totalCreditoFiscal,
    margenBruto:  totalIngresos - totalCompras,
    utilidadNeta: totalIngresos - totalEgresos - totalCompras,
    ingresosPorCuenta,
    topProveedores,
    cantTransacciones: transactions.length,
    cantCompras: purchases.length
  }
}

// ─── Recolectar datos de un AÑO completo ─────────────────────────────────────
async function recolectarAnio(companyId, year) {
  const periods  = await Period.find({ companyId, year }).sort({ month: 1 })
  if (periods.length === 0) return null

  const periodIds    = periods.map(p => p._id)
  const transactions = await Transaction.find({ companyId, periodId: { $in: periodIds } }).lean()
  const purchases    = await Purchase.find({ companyId, periodId: { $in: periodIds } }).lean()
  const accounts     = await Account.find({ companyId, isActive: true }).lean()
  const accountMap   = {}
  accounts.forEach(a => { accountMap[a.code] = a.name })

  const totalIngresos      = transactions.filter(t => t.type === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0)
  const totalEgresos       = transactions.filter(t => t.type === 'egreso').reduce((s, t) => s + (t.monto || 0), 0)
  const totalCompras       = purchases.reduce((s, p) => s + (p.totalBruto || 0), 0)
  const totalCreditoFiscal = purchases.reduce((s, p) => s + (p.creditoFiscal || 0), 0)

  const ingresosPorCuenta = {}
  transactions.filter(t => t.type === 'ingreso').forEach(t => {
    const nombre = accountMap[t.accountCode] || t.accountCode || 'Sin categoría'
    ingresosPorCuenta[nombre] = (ingresosPorCuenta[nombre] || 0) + (t.monto || 0)
  })

  const porProveedor = {}
  purchases.forEach(p => {
    porProveedor[p.proveedor] = (porProveedor[p.proveedor] || 0) + (p.totalBruto || 0)
  })
  const topProveedores = Object.entries(porProveedor).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const resumenMensual = periods.map(p => {
    const txP   = transactions.filter(t => t.periodId.toString() === p._id.toString())
    const ing   = txP.filter(t => t.type === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0)
    const egr   = txP.filter(t => t.type === 'egreso').reduce((s, t) => s + (t.monto || 0), 0)
    const comp  = purchases.filter(pu => pu.periodId.toString() === p._id.toString()).reduce((s, pu) => s + (pu.totalBruto || 0), 0)
    return { mes: MESES[p.month - 1], ingresos: ing, egresos: egr, compras: comp, neto: ing - egr - comp }
  })

  return {
    year,
    periodos: periods.length,
    totalIngresos,
    totalEgresos,
    totalCompras,
    totalCreditoFiscal,
    margenBruto:  totalIngresos - totalCompras,
    utilidadNeta: totalIngresos - totalEgresos - totalCompras,
    ingresosPorCuenta,
    topProveedores,
    resumenMensual,
    cantTransacciones: transactions.length,
    cantCompras: purchases.length
  }
}

// ─── Calcular variación porcentual ────────────────────────────────────────────
function variacion(actual, anterior) {
  if (!anterior || anterior === 0) return null
  return ((actual - anterior) / Math.abs(anterior) * 100).toFixed(1)
}

function fmtVariacion(pct) {
  if (pct === null) return 'sin dato anterior'
  const signo = pct >= 0 ? '▲' : '▼'
  return `${signo} ${Math.abs(pct)}% vs mes anterior`
}

// ─── Prompt para período específico con comparativa ───────────────────────────
function construirPromptPeriodo(actual, anterior) {
  const ingVar  = variacion(actual.totalIngresos, anterior?.totalIngresos)
  const compVar = variacion(actual.totalCompras,  anterior?.totalCompras)
  const netoVar = variacion(actual.utilidadNeta,  anterior?.utilidadNeta)

  const ingresosCuenta = Object.entries(actual.ingresosPorCuenta)
    .map(([n, t]) => `  • ${n}: ${fmt(t)}`).join('\n') || '  • Sin datos'

  const proveedores = actual.topProveedores
    .map(([n, t]) => `  • ${n}: ${fmt(t)}`).join('\n') || '  • Sin datos'

  const comparativa = anterior
    ? `COMPARATIVA CON ${MESES[anterior.month - 1].toUpperCase()} ${anterior.year}:
• Ingresos:     ${fmt(anterior.totalIngresos)} → ${fmt(actual.totalIngresos)}  (${fmtVariacion(ingVar)})
• Compras:      ${fmt(anterior.totalCompras)}  → ${fmt(actual.totalCompras)}   (${fmtVariacion(compVar)})
• Utilidad:     ${fmt(anterior.utilidadNeta)}  → ${fmt(actual.utilidadNeta)}   (${fmtVariacion(netoVar)})`
    : 'COMPARATIVA: No hay período anterior registrado para comparar.'

  return `Eres un asesor financiero experto en MiPymes de Honduras. Analiza los datos del período indicado y da un diagnóstico claro, práctico y en español.

═══════════════════════════════════════
PERÍODO ANALIZADO: ${actual.mes.toUpperCase()} ${actual.year}
Estado del período: ${actual.status}
Transacciones: ${actual.cantTransacciones} | Facturas de compra: ${actual.cantCompras}
═══════════════════════════════════════

CIFRAS DEL MES:
• Ingresos totales:    ${fmt(actual.totalIngresos)}
• Egresos operativos: ${fmt(actual.totalEgresos)}
• Total compras:       ${fmt(actual.totalCompras)}
• Crédito fiscal ISV:  ${fmt(actual.totalCreditoFiscal)}
• Margen bruto:        ${fmt(actual.margenBruto)}
• Utilidad neta:       ${fmt(actual.utilidadNeta)}

INGRESOS POR CATEGORÍA:
${ingresosCuenta}

TOP PROVEEDORES:
${proveedores}

${comparativa}

═══════════════════════════════════════
Responde EXACTAMENTE con estas 4 secciones:

1. DIAGNÓSTICO GENERAL (2-3 oraciones sobre cómo le fue al negocio este mes)

2. PUNTOS POSITIVOS (máximo 3 bullets)

3. RIESGOS IDENTIFICADOS (máximo 3 bullets, menciona la comparativa si hay cambios importantes)

4. RECOMENDACIONES (3 acciones concretas para el próximo mes)

Lenguaje sencillo. El dueño del negocio no es contador.`
}

// ─── Prompt para análisis anual ───────────────────────────────────────────────
function construirPromptAnio(datos) {
  const ingresosCuenta = Object.entries(datos.ingresosPorCuenta)
    .map(([n, t]) => `  • ${n}: ${fmt(t)}`).join('\n') || '  • Sin datos'

  const proveedores = datos.topProveedores
    .map(([n, t]) => `  • ${n}: ${fmt(t)}`).join('\n') || '  • Sin datos'

  const mensual = datos.resumenMensual
    .map(m => `  ${m.mes}: Ing ${fmt(m.ingresos)} | Egr ${fmt(m.egresos)} | Comp ${fmt(m.compras)} | Neto ${fmt(m.neto)}`)
    .join('\n')

  return `Eres un asesor financiero experto en MiPymes de Honduras. Analiza el año completo y da un diagnóstico claro, práctico y en español.

═══════════════════════════════════════
ANÁLISIS ANUAL — AÑO ${datos.year}
Períodos registrados: ${datos.periodos} de 12
═══════════════════════════════════════

CIFRAS ANUALES:
• Ingresos totales:    ${fmt(datos.totalIngresos)}
• Egresos operativos: ${fmt(datos.totalEgresos)}
• Total compras:       ${fmt(datos.totalCompras)}
• Crédito fiscal ISV:  ${fmt(datos.totalCreditoFiscal)}
• Margen bruto:        ${fmt(datos.margenBruto)}
• Utilidad neta:       ${fmt(datos.utilidadNeta)}

INGRESOS POR CATEGORÍA:
${ingresosCuenta}

TOP PROVEEDORES:
${proveedores}

EVOLUCIÓN MENSUAL:
${mensual}

═══════════════════════════════════════
Responde EXACTAMENTE con estas 4 secciones:

1. DIAGNÓSTICO GENERAL (2-3 oraciones sobre la salud financiera del año)

2. PUNTOS POSITIVOS (máximo 3 bullets)

3. RIESGOS IDENTIFICADOS (máximo 3 bullets con explicación breve)

4. RECOMENDACIONES (3 acciones concretas y específicas)

Lenguaje sencillo. El dueño del negocio no es contador.`
}

// ─── Controlador principal ────────────────────────────────────────────────────
export const analizarFinanzas = async (req, res) => {
  try {
    const companyId = req.user?.companyId?.toString()
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Tu usuario no tiene empresa asignada'
      })
    }

    const { year: yearParam, periodId } = req.query
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'GROQ_API_KEY no configurada en el servidor' })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    let prompt, resumen, etiqueta

    if (periodId) {
      // ── Modo período específico ──────────────────────────────────────────
      const period = await Period.findById(periodId)
      if (!period) {
        return res.status(404).json({ success: false, message: 'Período no encontrado' })
      }

      // Buscar período anterior (mes anterior)
      const mesAnterior  = period.month === 1 ? 12 : period.month - 1
      const anioAnterior = period.month === 1 ? period.year - 1 : period.year
      const periodAnterior = await Period.findOne({ companyId, month: mesAnterior, year: anioAnterior })

      const [datosActual, datosAnterior] = await Promise.all([
        recolectarPeriodo(period, companyId),
        periodAnterior ? recolectarPeriodo(periodAnterior, companyId) : Promise.resolve(null)
      ])

      prompt   = construirPromptPeriodo(datosActual, datosAnterior)
      etiqueta = `${datosActual.mes} ${datosActual.year}`
      resumen  = {
        totalIngresos:  datosActual.totalIngresos,
        totalEgresos:   datosActual.totalEgresos,
        totalCompras:   datosActual.totalCompras,
        margenBruto:    datosActual.margenBruto,
        utilidadNeta:   datosActual.utilidadNeta,
        creditoFiscal:  datosActual.totalCreditoFiscal,
        comparativa: datosAnterior ? {
          mes:           `${MESES[datosAnterior.month - 1]} ${datosAnterior.year}`,
          totalIngresos: datosAnterior.totalIngresos,
          totalCompras:  datosAnterior.totalCompras,
          utilidadNeta:  datosAnterior.utilidadNeta,
          varIngresos:   variacion(datosActual.totalIngresos, datosAnterior.totalIngresos),
          varCompras:    variacion(datosActual.totalCompras,  datosAnterior.totalCompras),
          varUtilidad:   variacion(datosActual.utilidadNeta,  datosAnterior.utilidadNeta)
        } : null
      }

    } else {
      // ── Modo anual ───────────────────────────────────────────────────────
      const datos = await recolectarAnio(companyId, year)
      if (!datos) {
        return res.status(404).json({ success: false, message: `No hay datos registrados para el año ${year}` })
      }

      prompt   = construirPromptAnio(datos)
      etiqueta = `Año ${year}`
      resumen  = {
        totalIngresos: datos.totalIngresos,
        totalEgresos:  datos.totalEgresos,
        totalCompras:  datos.totalCompras,
        margenBruto:   datos.margenBruto,
        utilidadNeta:  datos.utilidadNeta,
        creditoFiscal: datos.totalCreditoFiscal,
        comparativa:   null
      }
    }

    // ── Llamar a Groq ────────────────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200
    })
    const analisis = completion.choices[0]?.message?.content || 'Sin respuesta del modelo'
    res.json({
      success: true,
      data: { etiqueta, year, resumen, analisis }
    })

  } catch (error) {
    console.error('❌ Error en análisis IA:', error)
    res.status(500).json({ success: false, message: 'Error al generar el análisis', error: error.message })
  }
}

export default { analizarFinanzas }
