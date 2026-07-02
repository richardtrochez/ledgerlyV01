import Transaction from '../models/Transaction.js'
import Account from '../models/Account.js'
import Period from '../models/Period.js'
import Purchase from '../models/purchase.js'
import mongoose from 'mongoose'

// ── Obtener períodos del rango ────────────────────────────────────────────────
async function fetchPeriods(fiscalYear, startMonth, endMonth, companyId) {
  return await Period.find({
    year:      fiscalYear,
    month:     { $gte: startMonth, $lte: endMonth },
    companyId: new mongoose.Types.ObjectId(companyId)
  }).sort({ month: 1 })
}

// ── Obtener cuentas activas de la empresa ─────────────────────────────────────
async function fetchAccounts(companyId) {
  return await Account.find({
    companyId: new mongoose.Types.ObjectId(companyId),
    isActive:  true
  })
}

// ── Obtener transacciones — con companyId como defensa en profundidad ─────────
async function fetchTransactions(periodIds, companyId) {
  return await Transaction.find({
    periodId:  { $in: periodIds },
    companyId: new mongoose.Types.ObjectId(companyId)  // ← segunda línea de defensa
  })
}

async function fetchPurchases(periodIds, companyId) {
  return await Purchase.find({
    periodId: { $in: periodIds },
    companyId: new mongoose.Types.ObjectId(companyId),
    estado: { $ne: 'cancelada' }
  })
}

// ── Construir mapa código → grupo/subgrupo ────────────────────────────────────
function buildAccountMapping(accounts) {
  const mapping = {}
  accounts.forEach(acc => {
    mapping[acc.code] = {
      group:    acc.group,
      subgroup: acc.subgroup || acc.name
    }
  })
  return mapping
}

// ── Agrupar transacciones por período y clase de costo ────────────────────────
function groupTransactionsByPeriodAndClass(transactions, accountMapping) {
  const grouped = {}

  transactions.forEach(tx => {
    const periodId   = tx.periodId.toString()
    const accountInfo = accountMapping[tx.accountCode]

    if (!accountInfo) {
      console.warn(`Cuenta no encontrada en mapping: ${tx.accountCode}`)
      return
    }

    const costClass = accountInfo.subgroup
    const group     = accountInfo.group

    if (!grouped[periodId])            grouped[periodId] = {}
    if (!grouped[periodId][costClass]) grouped[periodId][costClass] = { group, total: 0 }

    grouped[periodId][costClass].total += tx.monto
  })

  return grouped
}

// ── Construir secciones del EERR ──────────────────────────────────────────────
function addPurchasesToGroupedData(grouped, purchases) {
  purchases.forEach(purchase => {
    const periodId = purchase.periodId.toString()
    const costClass = 'Compras registradas'
    const totalCompra = Number(purchase.totalBruto || 0) ||
      Number(purchase.baseExenta || 0) +
      Number(purchase.baseImponible15 || 0) +
      Number(purchase.isv15 || 0) +
      Number(purchase.baseImponible18 || 0) +
      Number(purchase.isv18 || 0) +
      Number(purchase.gastoNoDeducible || 0)

    if (!grouped[periodId]) grouped[periodId] = {}
    if (!grouped[periodId][costClass]) {
      grouped[periodId][costClass] = { group: 'gasto_operativo', total: 0 }
    }

    grouped[periodId][costClass].total += totalCompra
  })

  return grouped
}

function buildSections(groupedData, periods) {
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  const monthsWithData = periods.map(p => ({
    month:    p.month,
    name:     monthNames[p.month - 1],
    periodId: p._id.toString()
  }))

  // Recolectar todas las clases de costo por grupo
  const costClassesByGroup = {
    ingreso:         new Set(),
    costo_directo:   new Set(),
    gasto_operativo: new Set(),
    otros:           new Set()
  }

  Object.values(groupedData).forEach(periodData => {
    Object.entries(periodData).forEach(([costClass, data]) => {
      if (costClassesByGroup[data.group]) {
        costClassesByGroup[data.group].add(costClass)
      }
    })
  })

  // Construir una sección por tipo
  const buildSection = (type, name) => {
    const classes = Array.from(costClassesByGroup[type] || []).map(className => {
      const monthlyData = monthsWithData.map(m =>
        groupedData[m.periodId]?.[className]?.total || 0
      )
      return {
        name:   className,
        months: monthlyData,
        total:  monthlyData.reduce((sum, val) => sum + val, 0)
      }
    })

    if (classes.length === 0) return null

    const totals = monthsWithData.map((_, idx) =>
      classes.reduce((sum, cc) => sum + cc.months[idx], 0)
    )

    return {
      name,
      type,
      costClasses: classes,
      totals,
      grandTotal: totals.reduce((sum, val) => sum + val, 0)
    }
  }

  const sections = [
    buildSection('ingreso',         'INGRESOS'),
    buildSection('costo_directo',   'COSTOS DIRECTOS'),
    buildSection('gasto_operativo', 'GASTOS OPERATIVOS'),
  ].filter(Boolean)  // elimina las secciones sin datos

  return { sections, monthsWithData }
}

// ── Calcular resumen financiero ───────────────────────────────────────────────
function calculateSummary(sections) {
  const totalIngresos = sections.find(s => s.type === 'ingreso')?.totals         || []
  const totalCostos   = sections.find(s => s.type === 'costo_directo')?.totals   || []
  const totalGastos   = sections.find(s => s.type === 'gasto_operativo')?.totals || []

  // Margen bruto por mes: ingresos - costos directos
  const margenBruto = totalIngresos.map((ing, idx) =>
    ing - (totalCostos[idx] || 0)
  )

  // Utilidad operativa por mes: margen bruto - gastos operativos
  const utilidadOperativa = margenBruto.map((mb, idx) =>
    mb - (totalGastos[idx] || 0)
  )

  return { totalIngresos, totalCostos, margenBruto, totalGastos, utilidadOperativa }
}

// ── Orquestador principal ─────────────────────────────────────────────────────
export async function buildIncomeStatementData({ fiscalYear, startMonth, endMonth, companyId }) {
  const periods = await fetchPeriods(fiscalYear, startMonth, endMonth, companyId)

  if (periods.length === 0) {
    return {
      year: fiscalYear, months: [], sections: [],
      summary: {
        totalIngresos: [], totalCostos: [],
        margenBruto: [], totalGastos: [], utilidadOperativa: []
      }
    }
  }

  const accounts     = await fetchAccounts(companyId)
  const periodIds    = periods.map(p => p._id)
  const transactions = await fetchTransactions(periodIds, companyId)  // ← pasa companyId
  const purchases    = await fetchPurchases(periodIds, companyId)

  const accountMapping = buildAccountMapping(accounts)
  const groupedData    = groupTransactionsByPeriodAndClass(transactions, accountMapping)
  addPurchasesToGroupedData(groupedData, purchases)
  const { sections, monthsWithData } = buildSections(groupedData, periods)
  const summary        = calculateSummary(sections)

  return { year: fiscalYear, months: monthsWithData, sections, summary }
}

export {
  fetchPeriods, fetchAccounts, fetchTransactions, fetchPurchases,
  buildAccountMapping, groupTransactionsByPeriodAndClass,
  addPurchasesToGroupedData, buildSections, calculateSummary
}
