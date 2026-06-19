/**
 * Script para crear usuarios de prueba en MongoDB
 * Ejecutar con: node setup-users.js
 */

import mongoose from 'mongoose'
import User from './src/models/user.js'
import Company from './src/models/Company.js'
import dotenv from 'dotenv'

dotenv.config()

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ledgerly'
const COMPANY_ID = '000000000000000000000001'

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@ledgerly.com',
    password: 'password',
    role: 'admin'
  },
  {
    name: 'Contador User',
    email: 'contador@ledgerly.com',
    password: 'password',
    role: 'contador'
  },
  {
    name: 'Dueño User',
    email: 'dueno@ledgerly.com',
    password: 'password',
    role: 'dueno'
  }
]

async function setupUsers() {
  try {
    console.log('🔗 Conectando a MongoDB...')
    await mongoose.connect(DB_URI)
    console.log('✅ Conectado a MongoDB')

    // 1. Crear o verificar empresa
    console.log('\n📦 Verificando empresa...')
    let company = await Company.findById(COMPANY_ID)
    if (!company) {
      console.log('   Creando empresa...')
      company = await Company.create({
        _id: COMPANY_ID,
        code: 'DEMO',
        name: 'Empresa Demo Ledgerly',
        currency: 'HNL',
        fiscalYear: new Date().getFullYear()
      })
      console.log(`✅ Empresa creada: ${company.name}`)
    } else {
      console.log(`✅ Empresa existe: ${company.name}`)
    }

    // 2. Crear usuarios
    console.log('\n👥 Creando usuarios de prueba...')
    for (const userData of demoUsers) {
      try {
        // Verificar si existe
        let user = await User.findOne({ email: userData.email })
        
        if (user) {
          console.log(`⚠️  Usuario ${userData.email} ya existe`)
          
          // Verificar contraseña
          const isMatch = await user.comparePassword('password')
          if (isMatch) {
            console.log(`   ✅ Contraseña correcta`)
          } else {
            console.log(`   ❌ Contraseña incorrecta - actualizando...`)
            user.password = 'password'
            await user.save()
            console.log(`   ✅ Contraseña actualizada`)
          }
        } else {
          // Crear nuevo usuario
          user = await User.create({
            ...userData,
            companyId: COMPANY_ID,
            isActive: true
          })
          console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`)
        }
      } catch (error) {
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message)
      }
    }

    console.log('\n✨ Setup completado!')
    console.log('\n📝 Credenciales disponibles:')
    demoUsers.forEach(user => {
      console.log(`   ${user.email} / password (${user.role})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

setupUsers()
