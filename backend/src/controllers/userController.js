import User from '../models/user.js'
import CompanyMembership from '../models/CompanyMembership.js'

// El admin ve todos los usuarios. Los demas solo ven usuarios de su empresa activa.
const getUserFilter = async (req) => {
  if (req.user?.role === 'admin') return {}
  if (!req.user?.companyId) return { _id: null }  // sin empresa activa = ve nada

  // Traer los userIds que tienen membresia en la empresa activa
  const memberships = await CompanyMembership.find({
    companyId: req.user.companyId,
    isActive: true
  }).select('userId').lean()

  const userIds = memberships.map(m => m.userId)
  return { _id: { $in: userIds } }
}

// Helper: enriquecer usuarios con sus empresas
async function enrichWithCompanies(users) {
  const userIds = users.map(u => u._id)
  const memberships = await CompanyMembership.find({
    userId: { $in: userIds }, isActive: true
  }).populate({ path: 'companyId', select: '_id name' }).lean()

  const byUserId = {}
  for (const m of memberships) {
    if (!m.companyId) continue
    if (!byUserId[m.userId]) byUserId[m.userId] = []
    byUserId[m.userId].push({
      _id: m.companyId._id, name: m.companyId.name, role: m.role
    })
  }

  return users.map(u => ({
    ...u,
    companies: byUserId[u._id] || []
  }))
}

export const getUsers = async (req, res) => {
  try {
    const filter = await getUserFilter(req)
    const users = await User.find(filter).select('-password').lean()
    const enriched = await enrichWithCompanies(users)

    res.json({ success: true, count: enriched.length, data: enriched })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const filter = await getUserFilter(req)
    const user = await User.findOne({ _id: req.params.id, ...filter }).select('-password').lean()

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    const [enriched] = await enrichWithCompanies([user])
    res.json({ success: true, data: enriched })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ success: false, message: 'Error al obtener usuario' })
  }
}

// Crear usuario con una o mas empresas (companyIds: array).
// Compatible hacia atras: si viene companyId (single), se convierte a array.
export const createUser = async (req, res) => {
  try {
    const { name, email, telefono, password, role, companyIds, companyId } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Nombre, email, contrasena y rol son requeridos' })
    }

    const validRoles = ['admin', 'contador', 'dueno']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol invalido. Debe ser: admin, contador, o dueno' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya esta registrado' })
    }

    // Resolver empresas asignadas
    let empresas = []
    if (Array.isArray(companyIds)) empresas = companyIds
    else if (companyIds) empresas = [companyIds]
    else if (companyId) empresas = [companyId]

    // Si el creador NO es admin, forzar la empresa activa
    if (req.user?.role !== 'admin' && req.user?.companyId) {
      empresas = [req.user.companyId]
    }

    if (role !== 'admin' && empresas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes asignar al menos una empresa para contador o dueno'
      })
    }

    const initialCompanyId = role !== 'admin' ? empresas[0] : null

    const user = await User.create({
      name, email, telefono, password, role,
      companyId: initialCompanyId, isActive: true
    })

    if (role !== 'admin') {
      for (const cid of empresas) {
        await CompanyMembership.create({
          userId: user._id, companyId: cid, role, isActive: true
        })
      }
    }

    const userResponse = user.toObject()
    delete userResponse.password
    const [enriched] = await enrichWithCompanies([userResponse])

    res.status(201).json({
      success: true, message: 'Usuario creado exitosamente', data: enriched
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { name, email, telefono, role, isActive } = req.body
    const userId = req.params.id

    if (role) {
      const validRoles = ['admin', 'contador', 'dueno']
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Rol invalido' })
      }
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'El email ya esta registrado' })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (telefono) updateData.telefono = telefono
    if (role) updateData.role = role
    if (typeof isActive !== 'undefined') updateData.isActive = isActive

    const filter = await getUserFilter(req)
    const user = await User.findOneAndUpdate(
      { _id: userId, ...filter }, updateData, { new: true, runValidators: true }
    ).select('-password').lean()

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    const [enriched] = await enrichWithCompanies([user])
    res.json({ success: true, message: 'Usuario actualizado', data: enriched })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    if (userId === req.user?._id?.toString()) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo' })
    }

    const filter = await getUserFilter(req)
    const user = await User.findOneAndDelete({ _id: userId, ...filter })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    // Tambien eliminar sus membresias
    await CompanyMembership.deleteMany({ userId })

    res.json({ success: true, message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' })
  }
}

// Agregar una empresa a un usuario (crear membresia)
export const addUserCompany = async (req, res) => {
  try {
    const { userId } = req.params
    const { companyId, role } = req.body

    if (!companyId || !role) {
      return res.status(400).json({ success: false, message: 'companyId y role son requeridos' })
    }

    if (!['contador', 'dueno'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol invalido para membresia' })
    }

    const existing = await CompanyMembership.findOne({ userId, companyId })
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ success: false, message: 'El usuario ya pertenece a esa empresa' })
      }
      // Reactivar si estaba inactiva
      existing.isActive = true
      existing.role = role
      await existing.save()
      return res.json({ success: true, message: 'Membresia reactivada', data: existing })
    }

    const membership = await CompanyMembership.create({
      userId, companyId, role, isActive: true
    })

    res.status(201).json({ success: true, message: 'Empresa asignada al usuario', data: membership })
  } catch (error) {
    console.error('Error al asignar empresa:', error)
    res.status(500).json({ success: false, message: 'Error al asignar empresa' })
  }
}

// Quitar una empresa a un usuario
export const removeUserCompany = async (req, res) => {
  try {
    const { userId, companyId } = req.params

    const membership = await CompanyMembership.findOneAndDelete({ userId, companyId })
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membresia no encontrada' })
    }

    // Si esa era la empresa activa del usuario, limpiar
    const user = await User.findById(userId)
    if (user && String(user.companyId) === String(companyId)) {
      const otra = await CompanyMembership.findOne({ userId, isActive: true })
      user.companyId = otra ? otra.companyId : null
      await user.save()
    }

    res.json({ success: true, message: 'Empresa removida del usuario' })
  } catch (error) {
    console.error('Error al remover empresa:', error)
    res.status(500).json({ success: false, message: 'Error al remover empresa' })
  }
}

export default {
  getUsers, getUserById, createUser, updateUser, deleteUser,
  addUserCompany, removeUserCompany
}
