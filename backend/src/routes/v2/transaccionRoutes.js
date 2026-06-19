import express from 'express'
import {
  listarTransacciones,
  obtenerTransaccionPorId,
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
  obtenerResumenTransacciones
} from '../../controllers/v2/transaccionController.js'

const router = express.Router()

router.get('/', listarTransacciones)
router.get('/resumen', obtenerResumenTransacciones)
router.get('/:id', obtenerTransaccionPorId)
router.post('/', crearTransaccion)
router.put('/:id', actualizarTransaccion)
router.delete('/:id', eliminarTransaccion)

export default router
