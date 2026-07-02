import express from 'express'
import AccountController from '../controllers/accountController.js'
import { getAccountsByGroup } from '../controllers/accountController.js'
import Account from '../models/Account.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/by-group', getAccountsByGroup)
router.get('/', AccountController.getAccounts)
router.get('/:id', AccountController.getAccountById)
router.post('/', AccountController.createAccount)
router.put('/:id', AccountController.updateAccount)
router.delete('/:id', AccountController.deleteAccount)

router.patch('/:id/toggle', async (req, res) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Tu usuario no tiene empresa asignada'
      })
    }

    const account = await Account.findOne({
      _id: req.params.id,
      companyId
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      })
    }

    account.isActive = !account.isActive
    await account.save()

    res.json({
      success: true,
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado de la cuenta',
      error: error.message
    })
  }
})

export default router
