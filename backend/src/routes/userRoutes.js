import express from 'express'
import { protect, authorize } from '../middleware/authMiddleware.js'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addUserCompany,
  removeUserCompany
} from '../controllers/userController.js'

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

// Membresías (relación N:N usuario-empresa)
router.post('/:userId/companies', addUserCompany)
router.delete('/:userId/companies/:companyId', removeUserCompany)

export default router
