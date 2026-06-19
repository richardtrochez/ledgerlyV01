import express from 'express'
import { protect, authorize } from '../middleware/authMiddleware.js'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js'

const router = express.Router()

/**
 * Todas estas rutas requieren autenticación y ser admin
 */
router.use(protect)
router.use(authorize('admin'))

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Admin only
 */
router.get('/', getUsers)

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Admin only
 */
router.get('/:id', getUserById)

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Admin only
 */
router.post('/', createUser)

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario
 * @access  Admin only
 */
router.put('/:id', updateUser)

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario
 * @access  Admin only
 */
router.delete('/:id', deleteUser)

export default router
