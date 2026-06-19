import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

import * as transactionController from '../controllers/transactionController.js'

const router = express.Router()



// Aplicar autenticación a todas las rutas
router.use(protect)

// GET - Obtener transacciones
router.get('/', transactionController.getTransactions)

// GET - Resumen de transacciones
router.get('/summary', transactionController.getTransactionsSummary)

// GET - Obtener una transacción por ID
router.get('/:id', transactionController.getTransaction)

// POST - Crear nueva transacción
router.post('/', transactionController.createTransaction)

// PUT - Actualizar transacción
router.put('/:id', transactionController.updateTransaction)

// DELETE - Eliminar transacción
router.delete('/:id', transactionController.deleteTransaction)



export default router