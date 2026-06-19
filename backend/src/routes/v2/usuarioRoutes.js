import express from 'express'
import {
  listarUsuarios,
  crearUsuario,
  loginUsuario,
  obtenerUsuarioPorId
} from '../../controllers/v2/usuarioController.js'

const router = express.Router()

router.get('/', listarUsuarios)
router.get('/:id', obtenerUsuarioPorId)
router.post('/', crearUsuario)
router.post('/login', loginUsuario)

export default router
