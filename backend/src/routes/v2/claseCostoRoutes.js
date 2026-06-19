import express from 'express'
import {
  listarClasesCosto,
  obtenerClaseCostoPorId,
  crearClaseCosto,
  actualizarClaseCosto,
  desactivarClaseCosto
} from '../../controllers/v2/claseCostoController.js'

const router = express.Router()

router.get('/', listarClasesCosto)
router.get('/:id', obtenerClaseCostoPorId)
router.post('/', crearClaseCosto)
router.put('/:id', actualizarClaseCosto)
router.delete('/:id', desactivarClaseCosto)

export default router
