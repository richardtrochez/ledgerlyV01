import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { 
  getCostClasses, 
  createCostClass, 
  updateCostClass, 
  deleteCostClass 
} from '../controllers/costClassController.js'

const router = express.Router()

router.use(protect)

// GET /api/cost-classes - Obtener todas las clases de costo
router.get('/', getCostClasses)

// POST /api/cost-classes - Crear nueva clase de costo
router.post('/', createCostClass)

// PUT /api/cost-classes/:id - Actualizar clase de costo
router.put('/:id', updateCostClass)

// DELETE /api/cost-classes/:id - Eliminar clase de costo
router.delete('/:id', deleteCostClass)

export default router
