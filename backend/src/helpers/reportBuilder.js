/**
 * Report Builder Helper - Simplificado
 * 
 * Funciones para construir Estados de Resultados
 * 
 * Uso:
 * import { buildIncomeStatementData } from '../helpers/reportBuilder.js'
 * const data = await buildIncomeStatementData({ fiscalYear, startMonth, endMonth, companyId })
 */

import Transaction from '../models/Transaction.js'
import Account from '../models/Account.js'
import Period from '../models/Period.js'
import mongoose from 'mongoose'

// ═════════════════════════════════════════════════════════
// FETCH FUNCTIONS
// ═════════════════════════════════════════════════════════

async function fetchPeriods(fiscalYear, startMonth, endMonth, companyId) {
  const periods = await Period.find({
    year: fiscalYear,
    month: { $gte: startMonth, $lte: endMonth },
    companyId: new mongoose.Types.ObjectId(companyId)
  }).sort({ month: 1 })
  
  console.log(`✅ Períodos obtenidos: ${periods.length}`)
  return periods
}

async function fetchAccounts(companyId) {
  const accounts = await Account.find({
    companyId: new mongoose.Types.ObjectId(companyId),
    isActive: true
  })
  
  console.log(`✅ Cuentas obtenidas: ${accounts.length}`)
  return accounts
}

async function fetchTransactions(periodIds) {
  const transactions = await Transaction.find({
    periodId: { $in: periodIds }
  })
  
  console.log(`✅ Transacciones obtenidas: ${transactions.length}`)
  return transactions
}

// ═════════════════════════════════════════════════════════
// MAPPING & GROUPING
// ═════════════════════════════════════════════════════════

function buildAccountMapping(accounts) {
  const mapping = {}
  
  accounts.forEach(acc => {
    mapping[acc.code] = {
      group: acc.group,
      subgroup: acc.subgroup || acc.name
    }
  })
  
  console.log(`✅ Account mapping creado con ${Object.keys(mapping).length} cuentas`)
  return mapping
}

function groupTransactionsByPeriodAndClass(transactions, accountMapping) {
  const grouped = {}
  let skippedCount = 0

  transactions.forEach(tx => {
    const periodId = tx.periodId.toString()
    const accountInfo = accountMapping[tx.accountCode]

    if (!accountInfo) {
      console.warn(`⚠️ Cuenta no encontrada: ${tx.accountCode}`)
      skippedCount++
      return
    }

    const costClass = accountInfo.subgroup
    const group = accountInfo.group

    if (!grouped[periodId]) {
      grouped[periodId] = {}
    }
    if (!grouped[periodId][costClass]) {
      grouped[periodId][costClass] = { group, total: 0 }
    }

    grouped[periodId][costClass].total += tx.monto
  })

  console.log(`✅ Agrupación completada - Períodos: ${Object.keys(grouped).length}`)
  return grouped
}

// ═════════════════════════════════════════════════════════
// SECTIONS BUILDER
// ═════════════════════════════════════════════════════════

function buildSections(groupedData, periods, accountMapping) {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const monthsWithData = periods.map(p => ({
    month: p.month,
    name: monthNames[p.month - 1],
    periodId: p._id.toString()
  }))

  const costClassesByGroup = {
    ingreso: new Set(),
    costo_directo: new Set(),
    gasto_operativo: new Set(),
    otros: new Set()
  }

  Object.values(groupedData).forEach(periodData => {
    Object.entries(periodData).forEach(([costClass, data]) => {
      if (costClassesByGroup[data.group]) {
        costClassesByGroup[data.group].add(costClass)
      }
    })
  })

  const buildSection = (type, name) => {
    const classesForType = costClassesByGroup[type]
    
    if (classesForType.size === 0) {
      return null
    }

    const classes = Array.from(classesForType).map(className => {
      const monthlyData = monthsWithData.map(m =>
        groupedData[m.periodId]?.[className]?.total || 0
      )

      return {
        name: className,
        months: monthlyData,
        total: monthlyData.reduce((sum, val) => sum + val, 0)
      }
    })

    const totals = monthsWithData.map((m, idx) =>
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
    buildSection('ingreso', 'INGRESOS'),
    buildSection('costo_directo', 'COSTOS DIRECTOS'),
    buildSection('gasto_operativo', 'GASTOS OPERATIVOS'),
  ].filter(Boolean)

  console.log(`✅ Secciones construidas: ${sections.length}`)
  return { sections, monthsWithData }
}

// ═════════════════════════════════════════════════════════
// SUMMARY CALCULATOR
// ═════════════════════════════════════════════════════════

function calculateSummary(sections) {
  const totalIngresos = sections.find(s => s.type === 'ingreso')?.totals || []
  const totalCostos = sections.find(s => s.type === 'costo_directo')?.totals || []
  const totalGastos = sections.find(s => s.type === 'gasto_operativo')?.totals || []

  const margenBruto = totalIngresos.map((ing, idx) =>
    ing - (totalCostos[idx] || 0)
  )

  const utilidadOperativa = margenBruto.map((mb, idx) =>
    mb - (totalGastos[idx] || 0)
  )

  console.log('✅ Resumen calculado')

  return {
    totalIngresos,
    totalCostos,
    margenBruto,
    totalGastos,
    utilidadOperativa
  }
}

// ═════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═════════════════════════════════════════════════════════

export async function buildIncomeStatementData({
  fiscalYear,
  startMonth,
  endMonth,
  companyId
}) {
  try {
    console.log(`\n📊 Construyendo Estado de Resultados - Año: ${fiscalYear}`)

    const periods = await fetchPeriods(fiscalYear, startMonth, endMonth, companyId)

    if (periods.length === 0) {
      console.warn('⚠️ No hay períodos para el rango especificado')
      return {
        year: fiscalYear,
        months: [],
        sections: [],
        summary: {
          totalIngresos: [],
          totalCostos: [],
          margenBruto: [],
          totalGastos: [],
          utilidadOperativa: []
        }
      }
    }

    const accounts = await fetchAccounts(companyId)
    const periodIds = periods.map(p => p._id)
    const transactions = await fetchTransactions(periodIds)

    const accountMapping = buildAccountMapping(accounts)
    const groupedData = groupTransactionsByPeriodAndClass(transactions, accountMapping)
    const { sections, monthsWithData } = buildSections(groupedData, periods, accountMapping)
    const summary = calculateSummary(sections)

    console.log(`✅ Estado de Resultados construido exitosamente\n`)

    return {
      year: fiscalYear,
      months: monthsWithData,
      sections,
      summary
    }
  } catch (error) {
    console.error('❌ Error construyendo Estado de Resultados:', error.message)
    console.error(error)
    throw error
  }
}

export {
  fetchPeriods,
  fetchAccounts,
  fetchTransactions,
  buildAccountMapping,
  groupTransactionsByPeriodAndClass,
  buildSections,
  calculateSummary
}

export default {
  buildIncomeStatementData,
  fetchPeriods,
  fetchAccounts,
  fetchTransactions,
  buildAccountMapping,
  groupTransactionsByPeriodAndClass,
  buildSections,
  calculateSummary
}