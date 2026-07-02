import express from 'express'
import {
  listarCuentas,
  obtenerCuentaPorId,
  crearCuenta,
  actualizarCuenta,
  desactivarCuenta
} from '../../controllers/v2/cuentaContableController.js'

const router = express.Router()

router.get('/', listarCuentas)
router.get('/:id', obtenerCuentaPorId)
router.post('/', crearCuenta)
router.put('/:id', actualizarCuenta)
router.delete('/:id', desactivarCuenta)

export default router
