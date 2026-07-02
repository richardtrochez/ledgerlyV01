import Account from '../models/Account.js'

const getCompanyId = (req, res) => {
  const companyId = req.user?.companyId
  if (!companyId) {
    res.status(403).json({
      success: false,
      message: 'Tu usuario no tiene empresa asignada'
    })
    return null
  }
  return companyId
}

/**
 * @desc  Obtener cuentas de la empresa
 * @route GET /api/accounts
 */
export const getAccounts = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { group, isActive } = req.query
    const filter = { companyId }

    if (group)    filter.group    = group
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
      message: 'Error al obtener cuentas'
    })
  }
}

/**
 * @desc  Obtener cuenta por ID
 * @route GET /api/accounts/:id
 */
export const getAccountById = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

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

    res.json({ success: true, data: account })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuenta'
    })
  }
}

/**
 * @desc  Obtener cuentas por grupo
 * @route GET /api/accounts/by-group?groups=ingreso,gasto_operativo
 */
export const getAccountsByGroup = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { groups } = req.query
    const groupArray = groups ? groups.split(',') : []

    if (groupArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar al menos un grupo'
      })
    }

    const accounts = await Account.find({
      companyId,                    // ← desde req.user, no hardcodeado
      group: { $in: groupArray },
      isActive: true
    }).sort({ code: 1 })

    res.json({ success: true, data: accounts })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cuentas por grupo'
    })
  }
}

/**
 * @desc  Crear cuenta
 * @route POST /api/accounts
 */
export const createAccount = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const account = await Account.create({
      ...req.body,
      companyId  // ← siempre desde el servidor
    })

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: account
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear cuenta'
    })
  }
}

/**
 * @desc  Actualizar cuenta
 * @route PUT /api/accounts/:id
 */
export const updateAccount = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, companyId },  // ← seguridad por empresa
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
      message: 'Error al actualizar cuenta'
    })
  }
}

/**
 * @desc  Eliminar cuenta
 * @route DELETE /api/accounts/:id
 */
export const deleteAccount = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      companyId  // ← operación atómica y segura
    })

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cuenta'
    })
  }
}

export default {
  getAccounts,
  getAccountById,
  getAccountsByGroup,
  createAccount,
  updateAccount,
  deleteAccount
}