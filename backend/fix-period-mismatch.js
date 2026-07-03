/**
 * Script para auditar y (opcionalmente) corregir transacciones y compras
 * cuyo periodo no coincide con la fecha del registro.
 *
 * MODO SEGURO (por defecto): solo lee y lista los desajustes, NO modifica nada.
 * MODO CORRECCION: reasigna cada registro al periodo correcto (creándolo si no existe).
 *
 * Como usar:
 *   1. Auditar primero (recomendado):    node fix-period-mismatch.js
 *   2. Corregir tras revisar el listado: node fix-period-mismatch.js --fix
 *
 * Ubicacion sugerida: en la carpeta backend1/ del proyecto
 * Requisitos: el .env con MONGODB_URI en la misma carpeta.
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Period from './src/models/Period.js'
import Transaction from './src/models/Transaction.js'
import Purchase from './src/models/purchase.js'

dotenv.config()

const FIX_MODE = process.argv.includes('--fix')
const DB_URI = process.env.MONGODB_URI

if (!DB_URI) {
  console.error('❌ No se encontro MONGODB_URI en el .env')
  process.exit(1)
}

const meses = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

async function getOrCreatePeriod(year, month, companyId) {
  let period = await Period.findOne({ year, month, companyId })
  if (!period && FIX_MODE) {
    period = await Period.create({ year, month, companyId, status: 'abierto' })
    console.log(`   + Periodo creado: ${meses[month]} ${year}`)
  }
  return period
}

async function auditarTransacciones() {
  console.log('\n=== TRANSACCIONES ===')
  const txs = await Transaction.find({}).populate('periodId').lean()

  let desajustes = 0
  let corregidos = 0

  for (const tx of txs) {
    if (!tx.periodId || !tx.fecha) continue

    const fecha = new Date(tx.fecha)
    const fechaYear = fecha.getFullYear()
    const fechaMonth = fecha.getMonth() + 1

    const periodYear = tx.periodId.year
    const periodMonth = tx.periodId.month

    if (fechaYear === periodYear && fechaMonth === periodMonth) continue

    desajustes++
    console.log(`\n  ⚠ Transaccion ${tx._id}`)
    console.log(`     descripcion: ${tx.descripcion}`)
    console.log(`     fecha real:   ${fecha.toISOString().split('T')[0]}`)
    console.log(`     periodo actual: ${meses[periodMonth]} ${periodYear}`)
    console.log(`     periodo esperado: ${meses[fechaMonth]} ${fechaYear}`)

    if (FIX_MODE) {
      const correcto = await getOrCreatePeriod(fechaYear, fechaMonth, tx.companyId)
      if (correcto) {
        await Transaction.updateOne({ _id: tx._id }, { $set: { periodId: correcto._id } })
        corregidos++
        console.log(`     ✓ Corregido -> ${meses[fechaMonth]} ${fechaYear}`)
      }
    }
  }

  console.log(`\n  Total transacciones desajustadas: ${desajustes}`)
  if (FIX_MODE) console.log(`  Total corregidas: ${corregidos}`)
}

async function auditarCompras() {
  console.log('\n=== COMPRAS ===')
  const purchases = await Purchase.find({}).populate('periodId').lean()

  let desajustes = 0
  let corregidos = 0

  for (const p of purchases) {
    if (!p.periodId || !p.fechaDocumento) continue

    const fecha = new Date(p.fechaDocumento)
    const fechaYear = fecha.getFullYear()
    const fechaMonth = fecha.getMonth() + 1

    const periodYear = p.periodId.year
    const periodMonth = p.periodId.month

    if (fechaYear === periodYear && fechaMonth === periodMonth) continue

    desajustes++
    console.log(`\n  ⚠ Compra ${p._id}`)
    console.log(`     proveedor: ${p.proveedor} - factura ${p.numeroFactura}`)
    console.log(`     fecha documento: ${fecha.toISOString().split('T')[0]}`)
    console.log(`     periodo actual: ${meses[periodMonth]} ${periodYear}`)
    console.log(`     periodo esperado: ${meses[fechaMonth]} ${fechaYear}`)

    if (FIX_MODE) {
      const correcto = await getOrCreatePeriod(fechaYear, fechaMonth, p.companyId)
      if (correcto) {
        await Purchase.updateOne({ _id: p._id }, { $set: { periodId: correcto._id } })
        corregidos++
        console.log(`     ✓ Corregido -> ${meses[fechaMonth]} ${fechaYear}`)
      }
    }
  }

  console.log(`\n  Total compras desajustadas: ${desajustes}`)
  if (FIX_MODE) console.log(`  Total corregidas: ${corregidos}`)
}

async function main() {
  console.log(`\n${FIX_MODE ? '🔧 MODO CORRECCION' : '🔍 MODO SOLO LECTURA'}`)
  console.log('Conectando a MongoDB...')

  await mongoose.connect(DB_URI)
  console.log('✓ Conectado')

  await auditarTransacciones()
  await auditarCompras()

  await mongoose.disconnect()
  console.log('\n✓ Listo\n')

  if (!FIX_MODE) {
    console.log('Para corregir los desajustes listados, corre:')
    console.log('   node fix-period-mismatch.js --fix\n')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
