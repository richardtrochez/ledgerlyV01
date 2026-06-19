import Account from '../models/Account.js'

// @desc    Obtener todas las cuentas
// @route   GET /api/accounts
export const getAccounts = async (req, res) => {
  try {
    const { group, isActive } = req.query

    const filter = {}
    if (group) filter.group = group
    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const accounts = await Account.find(filter).sort({ code: 1 })

    res.json({
      success: true, 
      count: accounts.length,
      data: accounts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas',
      error: error.message
    })
  }
}

// @desc    Obtener una cuenta por ID
// @route   GET /api/accounts/:id
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      })
    }

    res.json({
      success: true,
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cuenta',
      error: error.message
    })
  }
}

// @desc    Crear una cuenta
// @route   POST /api/accounts

export const createAccount = async (req, res) => {
  try {
    const account = await Account.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear cuenta',
      error: error.message
    })
  }
}

// @desc    Actualizar una cuenta
// @route   PUT /api/accounts/:id
export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Cuenta actualizada exitosamente',
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cuenta',
      error: error.message
    })
  }
}

export const getAccountsByGroup = async (req, res) => {
  try {
    const { groups } = req.query
    const groupArray = groups ? groups.split(',') : []
    
    const accounts = await Account.find({
      companyId: '000000000000000000000001',
      group: { $in: groupArray },
      isActive: true
    }).sort({ code: 1 })

    res.json({
      success: true,
      data: accounts
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas',
      error: error.message
    })
  }
}

// @desc    Eliminar una cuenta

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id)

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cuenta',
      error: error.message
    })
  }
}

export default { 
  getAccounts, 
  getAccountById,
  createAccount, 
  updateAccount, 
  deleteAccount 
}
