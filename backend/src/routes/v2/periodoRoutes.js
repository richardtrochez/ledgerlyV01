import express from 'express'
import {
  listarPeriodos,
  obtenerPeriodoPorId,
  crearPeriodo,
  cerrarPeriodo
} from '../../controllers/v2/periodoController.js'

const router = express.Router()

router.get('/', listarPeriodos)
router.get('/:id', obtenerPeriodoPorId)
router.post('/', crearPeriodo)
router.patch('/:id/cerrar', cerrarPeriodo)

export default router
