import express from 'express'
import { login, getMe, register, switchCompany } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'


const router = express.Router()

router.post('/login', login)
router.post('/register', protect, register)
router.post('/switch-company', protect, switchCompany)
router.get('/me', protect, getMe)



export default router
