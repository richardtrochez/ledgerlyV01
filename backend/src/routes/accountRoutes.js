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



//patch cambio de estado de la cuenta a inactivo/activo

// routes/accountRoutes.js
//router.patch('/:id/toggle', protect, async (req, res) => {
  //try {
    //const account = await Account.findById(req.params.id)
    //if (!account) return res.status(404).json({ success: false })

    //account.isActive = !account.isActive  // Invierte el estado
    //await account.save()

    //res.json({ success: true, data: account })
  //} catch (error) {
    //res.status(500).json({ success: false, error: error.message })
  //}
//})



//patch para cambiar el estado de una cuenta ejercicio

router.patch('/:id/toggle',protect, async(req, res)=>{
    try{
        const account= await Account.findById(req.params.id)
        if (!account)
            return res.status(404).json({success:false})
            
        account.isActive=!account.isActive
        await account.save()
        res.json({success:true, data:account})

       }
   catch(error){
    res.status(500).json({success:false, error:error.message})

   } 




})





export default router