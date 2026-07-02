import mongoose from 'mongoose'
import dotenv from 'dotenv'

import Company from './src/models/Company.js'
import User from './src/models/user.js'
import Period from './src/models/Period.js'
import Account from './src/models/Account.js'
import Transaction from './src/models/Transaction.js'
import Purchase from './src/models/purchase.js'

dotenv.config()

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ledgerly'
const COMPANY_ID = '000000000000000000000001'
const YEAR = 2026
const MONTH = 6

const demoUsers = [
  { name: 'Admin User', email: 'admin@ledgerly.com', password: 'password', role: 'admin' },
  { name: 'Contador User', email: 'contador@ledgerly.com', password: 'password', role: 'contador' },
  { name: 'Dueno User', email: 'dueno@ledgerly.com', password: 'password', role: 'dueno' }
]

const demoAccounts = [
  { code: '3000001', name: 'Cafe y Bebidas', group: 'ingreso', subgroup: 'Ventas' },
  { code: '3000002', name: 'Ventas de Brunch', group: 'ingreso', subgroup: 'Ventas' },
  { code: '3000003', name: 'Platos Fuertes', group: 'ingreso', subgroup: 'Ventas' },
  { code: '5000001', name: 'Materia Prima', group: 'costo_directo', subgroup: 'Costos directos' },
  { code: '6000001', name: 'Energia Electrica', group: 'gasto_operativo', subgroup: 'Servicios' },
  { code: '6000002', name: 'Publicidad', group: 'gasto_operativo', subgroup: 'Mercadeo' },
  { code: '6000003', name: 'Papeleria', group: 'gasto_operativo', subgroup: 'Administracion' }
]

const demoTransactions = [
  { type: 'ingreso', fecha: '2026-06-03', accountCode: '3000001', descripcion: 'Ventas de cafe y bebidas', monto: 4200 },
  { type: 'ingreso', fecha: '2026-06-08', accountCode: '3000002', descripcion: 'Ventas de brunch familiar', monto: 3600 },
  { type: 'ingreso', fecha: '2026-06-14', accountCode: '3000003', descripcion: 'Ventas de platos fuertes', monto: 5100 },
  { type: 'egreso', fecha: '2026-06-05', accountCode: '5000001', descripcion: 'Compra de ingredientes', monto: 1800 },
  { type: 'egreso', fecha: '2026-06-11', accountCode: '6000001', descripcion: 'Pago energia electrica', monto: 950 },
  { type: 'egreso', fecha: '2026-06-16', accountCode: '6000002', descripcion: 'Publicidad en redes sociales', monto: 650 },
  { type: 'egreso', fecha: '2026-06-18', accountCode: '6000003', descripcion: 'Papeleria administrativa', monto: 280 }
]

const demoPurchases = [
  {
    fechaDocumento: '2026-06-04',
    proveedor: 'Distribuidora La Central',
    rtnProveedor: '08011999000123',
    numeroFactura: '001-001-01-00001234',
    descripcion: 'Compra de insumos de cocina',
    subtotalExento: 0,
    subtotal15: 1800,
    isv15: 270,
    subtotal18: 0,
    isv18: 0
  },
  {
    fechaDocumento: '2026-06-10',
    proveedor: 'Energia Honduras',
    rtnProveedor: '08011998000456',
    numeroFactura: '002-002-01-00004567',
    descripcion: 'Servicio de energia electrica',
    subtotalExento: 950,
    subtotal15: 0,
    isv15: 0,
    subtotal18: 0,
    isv18: 0
  },
  {
    fechaDocumento: '2026-06-15',
    proveedor: 'Marketing Local HN',
    rtnProveedor: '08012001000789',
    numeroFactura: '003-003-01-00007890',
    descripcion: 'Publicidad digital',
    subtotalExento: 0,
    subtotal15: 650,
    isv15: 97.5,
    subtotal18: 0,
    isv18: 0
  }
]

async function upsertCompany() {
  return Company.findByIdAndUpdate(
    COMPANY_ID,
    {
      _id: COMPANY_ID,
      name: 'Cafe El Buen Sabor',
      currency: 'HNL',
      fiscalYear: YEAR,
      isActive: true
    },
    { upsert: true, new: true, runValidators: true }
  )
}

async function upsertUsers() {
  for (const userData of demoUsers) {
    let user = await User.findOne({ email: userData.email })

    if (!user) {
      await User.create({ ...userData, companyId: COMPANY_ID, isActive: true })
      continue
    }

    user.name = userData.name
    user.role = userData.role
    user.companyId = COMPANY_ID
    user.isActive = true

    const passwordWorks = await user.comparePassword('password')
    if (!passwordWorks) user.password = 'password'

    await user.save()
  }
}

async function upsertPeriod() {
  return Period.findOneAndUpdate(
    { companyId: COMPANY_ID, month: MONTH, year: YEAR },
    { companyId: COMPANY_ID, month: MONTH, year: YEAR, status: 'abierto' },
    { upsert: true, new: true, runValidators: true }
  )
}

async function upsertAccounts() {
  for (const account of demoAccounts) {
    await Account.findOneAndUpdate(
      { companyId: COMPANY_ID, code: account.code },
      { ...account, companyId: COMPANY_ID, isActive: true },
      { upsert: true, new: true, runValidators: true }
    )
  }
}

async function resetTransactions(periodId) {
  await Transaction.deleteMany({ companyId: COMPANY_ID, periodId })

  await Transaction.insertMany(
    demoTransactions.map(tx => ({
      ...tx,
      companyId: COMPANY_ID,
      periodId,
      fecha: new Date(tx.fecha)
    }))
  )
}

async function resetPurchases(periodId) {
  await Purchase.deleteMany({ companyId: COMPANY_ID, periodId })

  for (const purchase of demoPurchases) {
    await Purchase.create({
      ...purchase,
      companyId: COMPANY_ID,
      periodId,
      fechaDocumento: new Date(purchase.fechaDocumento),
      fechaContabilizacion: new Date(purchase.fechaDocumento),
      gastoNoDeducible: 0
    })
  }
}

async function setupDemoData() {
  try {
    console.log('Conectando a MongoDB Atlas...')
    await mongoose.connect(DB_URI)
    console.log('Conexion lista')

    const company = await upsertCompany()
    await upsertUsers()
    const period = await upsertPeriod()
    await upsertAccounts()
    await resetTransactions(period._id)
    await resetPurchases(period._id)

    console.log('\nDatos demo listos')
    console.log(`Empresa: ${company.name}`)
    console.log(`Periodo: ${MONTH}/${YEAR}`)
    console.log('Login: contador@ledgerly.com / password')
    console.log('\nPuedes abrir el frontend y entrar al dashboard.')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error preparando datos demo:', error.message)
    process.exit(1)
  }
}

setupDemoData()
