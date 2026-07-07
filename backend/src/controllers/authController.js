import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import CompanyMembership from '../models/CompanyMembership.js'

const generarToken = (userId, activeCompanyId = null) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno')
  }

  return jwt.sign(
    { id: userId, activeCompanyId: activeCompanyId ? String(activeCompanyId) : null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

async function obtenerEmpresasDelUsuario(userId) {
  const memberships = await CompanyMembership.find({ userId, isActive: true })
    .populate({
      path: 'companyId',
      match: { isActive: true },
      select: '_id name currency fiscalYear'
    })
    .lean()

  return memberships
    .filter(m => m.companyId)
    .map(m => ({
      _id: m.companyId._id,
      name: m.companyId.name,
      currency: m.companyId.currency,
      fiscalYear: m.companyId.fiscalYear,
      role: m.role
    }))
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' })
    }

    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' })
    }

    const passwordCorrecto = await user.comparePassword(password)
    if (!passwordCorrecto) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' })
    }

    if (user.role === 'admin') {
      return res.json({
        success: true,
        data: {
          token: generarToken(user._id),
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          availableCompanies: [],
          activeCompany: null
        }
      })
    }

    const availableCompanies = await obtenerEmpresasDelUsuario(user._id)
    if (availableCompanies.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Tu usuario no tiene empresas asignadas. Contacta al administrador.'
      })
    }

    let activeCompany = availableCompanies.find(c => String(c._id) === String(user.companyId))
    if (!activeCompany) {
      activeCompany = availableCompanies[0]
    }

    await User.updateOne({ _id: user._id }, { $set: { companyId: activeCompany._id } })

    res.json({
      success: true,
      data: {
        token: generarToken(user._id, activeCompany._id),
        user: { id: user._id, name: user.name, email: user.email, role: activeCompany.role },
        availableCompanies,
        activeCompany
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const switchCompany = async (req, res) => {
  try {
    const { companyId } = req.body

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'La empresa es requerida' })
    }

    const membership = await CompanyMembership.findOne({
      userId: req.user._id,
      companyId,
      isActive: true
    }).populate({
      path: 'companyId',
      match: { isActive: true },
      select: '_id name currency fiscalYear'
    })

    if (!membership || !membership.companyId) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a esa empresa' })
    }

    await User.updateOne({ _id: req.user._id }, { $set: { companyId } })

    const activeCompany = {
      _id: membership.companyId._id,
      name: membership.companyId.name,
      currency: membership.companyId.currency,
      fiscalYear: membership.companyId.fiscalYear,
      role: membership.role
    }

    res.json({
      success: true,
      data: {
        token: generarToken(req.user._id, activeCompany._id),
        user: { id: req.user._id, name: req.user.name, email: req.user.email, role: membership.role },
        activeCompany
      }
    })
  } catch (error) {
    console.error('Error en switchCompany:', error)
    res.status(500).json({ success: false, message: 'Error al cambiar de empresa' })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean()

    let availableCompanies = []
    let activeCompany = null

    if (user.role !== 'admin') {
      availableCompanies = await obtenerEmpresasDelUsuario(user._id)
      activeCompany = availableCompanies.find(c => String(c._id) === String(req.user.companyId)) || null
    }

    res.json({ success: true, data: { user, availableCompanies, activeCompany } })
  } catch (error) {
    console.error('Error en getMe:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyIds, companyId } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son requeridos' })
    }

    const assignedRole = role || 'dueno'
    let empresas = []

    if (Array.isArray(companyIds)) {
      empresas = companyIds
    } else if (companyIds) {
      empresas = [companyIds]
    } else if (companyId) {
      empresas = [companyId]
    }

    if (assignedRole !== 'admin' && empresas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes asignar al menos una empresa para contador o dueño'
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' })
    }

    const initialCompanyId = assignedRole !== 'admin' ? empresas[0] : null

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      companyId: initialCompanyId
    })

    if (assignedRole !== 'admin') {
      for (const cid of empresas) {
        await CompanyMembership.create({
          userId: user._id,
          companyId: cid,
          role: assignedRole,
          isActive: true
        })
      }
    }

    res.status(201).json({
      success: true,
      data: {
        token: generarToken(user._id, initialCompanyId),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    })
  } catch (error) {
    console.error('Error en register:', error)
    res.status(500).json({ success: false, message: 'Error al crear usuario' })
  }
}

export default { login, getMe, register, switchCompany }
