import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './src/config/database.js'


//  IMPORTAR RUTAS (SIN DUPLICADOS)
import companyRoutes from './src/routes/companyRoutes.js'
import transactionRoutes from './src/routes/transactionRoutes.js'
import accountRoutes from './src/routes/accountRoutes.js'
import periodRoutes from './src/routes/periodRoutes.js'
import costClassRoutes from './src/routes/costClassRoutes.js'
import reportRoutes from './src/routes/reportRoutes.js'
import importRoutes from './src/routes/importRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import purchaseRoutes from './src/routes/purchaseRoutes.js'
import agentRoutes from './src/routes/agentRoutes.js'
import empresaV2Routes from './src/routes/v2/empresaRoutes.js'
import periodoV2Routes from './src/routes/v2/periodoRoutes.js'
import cuentaContableV2Routes from './src/routes/v2/cuentaContableRoutes.js'
import claseCostoV2Routes from './src/routes/v2/claseCostoRoutes.js'
import transaccionV2Routes from './src/routes/v2/transaccionRoutes.js'
import usuarioV2Routes from './src/routes/v2/usuarioRoutes.js'




// Crear aplicación Express
const app = express()

// Conectar a MongoDB
connectDB()

//  MIDDLEWARE
app.use(helmet()) // Seguridad
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json()) // Parse JSON
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded
app.use(morgan('dev')) // Logging

//  RUTA DE BIENVENIDA
app.get('/', (req, res) => {
  res.json({
    message: 'Ledgerly ON',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      companies: '/api/companies',
      Transaction: '/api/Transaction',
      accounts: '/api/accounts',
      periods: '/api/periods',
      costClasses: '/api/cost-classes',
      reports: '/api/reports',
      auth: '/api/auth',
      users: '/api/users (admin only)'
    }
  })
})

//  RUTAS DE LA API
app.use('/api/companies', companyRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/periods', periodRoutes)
app.use('/api/cost-classes', costClassRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/imports', importRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/v2/empresas', empresaV2Routes)
app.use('/api/v2/periodos', periodoV2Routes)
app.use('/api/v2/cuentas-contables', cuentaContableV2Routes)
app.use('/api/v2/clases-costo', claseCostoV2Routes)
app.use('/api/v2/transacciones', transaccionV2Routes)
app.use('/api/v2/usuarios', usuarioV2Routes)

// MANEJO DE RUTAS NO ENCONTRADAS
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  })
})

// MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})






// INICIAR SERVIDOR
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`\n Servidor ON en puerto ${PORT}`)
  console.log(` ENV ON: ${process.env.NODE_ENV}`)
  console.log(` CORS ON: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
 
})
