/**
 * Script que recrea la base de datos con datos de demo para el modelo N:N.
 *
 * Escenarios que crea:
 *   - Empresa A: "Cafe El Buen Sabor"
 *   - Empresa B: "Panaderia La Espiga"
 *
 * Usuarios:
 *   - admin@ledgerly.com       -> admin global (sin empresas)
 *   - carlos@cafe.com          -> dueno solo de Cafe El Buen Sabor
 *   - maria@panaderia.com      -> duena solo de Panaderia La Espiga
 *   - contador@ledgerly.com    -> CONTADOR DE AMBAS EMPRESAS  <-- caso N:N estrella
 *
 * Todos los passwords: "password"
 *
 * ADVERTENCIA: este script BORRA las colecciones antes de recrear.
 * Solo usarlo en base de datos de demo.
 *
 * Uso:  node setup-demo-n-n.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

import Company from './src/models/Company.js'
import User from './src/models/user.js'
import CompanyMembership from './src/models/CompanyMembership.js'
import Period from './src/models/Period.js'
import Account from './src/models/Account.js'
import Transaction from './src/models/Transaction.js'
import Purchase from './src/models/purchase.js'
import CostClass from './src/models/CostClass.js'

dotenv.config()

const DB_URI = process.env.MONGODB_URI
if (!DB_URI) {
  console.error('Falta MONGODB_URI en el .env')
  process.exit(1)
}

// ------------------------------------------------------------------
// Datos comunes de cuentas
// ------------------------------------------------------------------
const cuentasCafe = [
  { code: '3000001', name: 'Cafe y Bebidas',    group: 'ingreso',         subgroup: 'Ventas' },
  { code: '3000002', name: 'Brunch',            group: 'ingreso',         subgroup: 'Ventas' },
  { code: '3000003', name: 'Platos Fuertes',    group: 'ingreso',         subgroup: 'Ventas' },
  { code: '5000001', name: 'Materia Prima',     group: 'costo_directo',   subgroup: 'Costos directos' },
  { code: '6000001', name: 'Energia Electrica', group: 'gasto_operativo', subgroup: 'Servicios' },
  { code: '6000002', name: 'Publicidad',        group: 'gasto_operativo', subgroup: 'Mercadeo' },
  { code: '6000003', name: 'Papeleria',         group: 'gasto_operativo', subgroup: 'Administracion' }
]

const cuentasPanaderia = [
  { code: '3000001', name: 'Venta de Pan',      group: 'ingreso',         subgroup: 'Ventas' },
  { code: '3000002', name: 'Venta de Pasteles', group: 'ingreso',         subgroup: 'Ventas' },
  { code: '5000001', name: 'Harina y Levadura', group: 'costo_directo',   subgroup: 'Costos directos' },
  { code: '5000002', name: 'Empaque',           group: 'costo_directo',   subgroup: 'Costos directos' },
  { code: '6000001', name: 'Alquiler Local',    group: 'gasto_operativo', subgroup: 'Servicios' },
  { code: '6000002', name: 'Salarios',          group: 'gasto_operativo', subgroup: 'Personal' }
]

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
async function limpiarBase() {
  console.log('\n Limpiando colecciones...')
  await Promise.all([
    CompanyMembership.deleteMany({}),
    Transaction.deleteMany({}),
    Purchase.deleteMany({}),
    Period.deleteMany({}),
    Account.deleteMany({}),
    CostClass.deleteMany({}),
    Company.deleteMany({}),
    User.deleteMany({})
  ])
  console.log('  Colecciones vacias')
}

async function crearUsuario({ name, email, role }) {
  // password: 'password' (se hashea en el pre-save del modelo)
  const user = await User.create({
    name, email, role, password: 'password', isActive: true, companyId: null
  })
  console.log(`  Usuario creado: ${email} (${role})`)
  return user
}

async function crearEmpresa({ name, ownerId }) {
  const company = await Company.create({
    name, ownerId, currency: 'HNL', fiscalYear: 2026, isActive: true
  })
  console.log(`  Empresa creada: ${name}`)
  return company
}

async function crearMembresia({ userId, companyId, role }) {
  const membership = await CompanyMembership.create({
    userId, companyId, role, isActive: true
  })
  return membership
}

async function crearCuentas(companyId, cuentas) {
  for (const c of cuentas) {
    await Account.create({ ...c, companyId, isActive: true })
  }
  console.log(`  ${cuentas.length} cuentas creadas`)
}

async function crearPeriodo(companyId, month, year) {
  return await Period.create({ companyId, month, year, status: 'abierto' })
}

async function crearTransacciones(companyId, periodId, movimientos) {
  for (const m of movimientos) {
    await Transaction.create({
      companyId,
      periodId,
      type: m.type,
      fecha: new Date(m.fecha),
      accountCode: m.accountCode,
      descripcion: m.descripcion,
      monto: m.monto
    })
  }
  console.log(`  ${movimientos.length} transacciones creadas`)
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  console.log(' Conectando a MongoDB...')
  await mongoose.connect(DB_URI)
  console.log(' Conectado')

  await limpiarBase()

  console.log('\n Creando usuarios...')
  const admin    = await crearUsuario({ name: 'Admin Ledgerly',   email: 'admin@ledgerly.com',    role: 'admin' })
  const carlos   = await crearUsuario({ name: 'Carlos Mendoza',   email: 'carlos@cafe.com',       role: 'dueno' })
  const maria    = await crearUsuario({ name: 'Maria Rodriguez',  email: 'maria@panaderia.com',   role: 'dueno' })
  const contador = await crearUsuario({ name: 'Contador Externo', email: 'contador@ledgerly.com', role: 'contador' })

  console.log('\n Creando empresas...')
  const cafe       = await crearEmpresa({ name: 'Cafe El Buen Sabor',    ownerId: carlos._id })
  const panaderia  = await crearEmpresa({ name: 'Panaderia La Espiga',   ownerId: maria._id })

  console.log('\n Creando membresias (relacion N:N)...')
  await crearMembresia({ userId: carlos._id,   companyId: cafe._id,      role: 'dueno' })
  await crearMembresia({ userId: maria._id,    companyId: panaderia._id, role: 'dueno' })
  // El contador tiene acceso a AMBAS empresas -> caso estrella
  await crearMembresia({ userId: contador._id, companyId: cafe._id,      role: 'contador' })
  await crearMembresia({ userId: contador._id, companyId: panaderia._id, role: 'contador' })
  console.log('  4 membresias creadas')

  // Actualizar companyId de cada usuario como "ultima empresa activa"
  await User.updateOne({ _id: carlos._id },   { $set: { companyId: cafe._id } })
  await User.updateOne({ _id: maria._id },    { $set: { companyId: panaderia._id } })
  await User.updateOne({ _id: contador._id }, { $set: { companyId: cafe._id } })

  console.log('\n Datos de Cafe El Buen Sabor:')
  await crearCuentas(cafe._id, cuentasCafe)
  const periodoCafe = await crearPeriodo(cafe._id, 7, 2026)
  await crearTransacciones(cafe._id, periodoCafe._id, [
    { type: 'ingreso', fecha: '2026-07-02', accountCode: '3000001', descripcion: 'Ventas del dia',           monto: 4500 },
    { type: 'ingreso', fecha: '2026-07-05', accountCode: '3000002', descripcion: 'Brunch familiar sabado',   monto: 3200 },
    { type: 'egreso',  fecha: '2026-07-03', accountCode: '5000001', descripcion: 'Compra de granos de cafe', monto: 1800 },
    { type: 'egreso',  fecha: '2026-07-01', accountCode: '6000001', descripcion: 'Recibo de luz de junio',   monto: 950 }
  ])

  console.log('\n Datos de Panaderia La Espiga:')
  await crearCuentas(panaderia._id, cuentasPanaderia)
  const periodoPanaderia = await crearPeriodo(panaderia._id, 7, 2026)
  await crearTransacciones(panaderia._id, periodoPanaderia._id, [
    { type: 'ingreso', fecha: '2026-07-01', accountCode: '3000001', descripcion: 'Venta de pan del dia',      monto: 2100 },
    { type: 'ingreso', fecha: '2026-07-06', accountCode: '3000002', descripcion: 'Pedido pasteles cumpleanos', monto: 1500 },
    { type: 'egreso',  fecha: '2026-07-02', accountCode: '5000001', descripcion: 'Compra harina 50 lb',       monto: 850 },
    { type: 'egreso',  fecha: '2026-07-04', accountCode: '6000002', descripcion: 'Salario panadero semanal',  monto: 2200 }
  ])

  console.log('\n Setup completado.')
  console.log('\n Credenciales de acceso (password = "password"):')
  console.log('   admin@ledgerly.com       -> admin, sin empresas')
  console.log('   carlos@cafe.com          -> dueno de Cafe El Buen Sabor')
  console.log('   maria@panaderia.com      -> duena de Panaderia La Espiga')
  console.log('   contador@ledgerly.com    -> CONTADOR DE AMBAS  (caso N:N)\n')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error(' Error:', err)
  process.exit(1)
})
