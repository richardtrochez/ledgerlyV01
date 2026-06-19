import express from 'express'

import { 
  listarEmpresas, 
  obtenerEmpresaPorId,
  crearEmpresa,
  actualizarEmpresa,
  desactivarEmpresa
} from '../../controllers/v2/empresaController.js'

const router = express.Router()

router.get('/', listarEmpresas)
router.get('/:id', obtenerEmpresaPorId)
router.post('/', crearEmpresa)
router.put('/:id', actualizarEmpresa)
router.delete('/:id', desactivarEmpresa)

export default router
