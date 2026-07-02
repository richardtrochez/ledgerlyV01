import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import * as purchaseController from '../controllers/purchaseController.js'

const router = express.Router()

router.use(protect)

router.get('/', purchaseController.getPurchases)
router.get('/:id', purchaseController.getPurchaseById)
router.post('/', purchaseController.createPurchase)
router.put('/:id', purchaseController.updatePurchase)
router.delete('/:id', purchaseController.deletePurchase)

export default router