import User from '../models/user.js'

const getUserFilter = (req) => {
  return req.user?.companyId ? { companyId: req.user.companyId } : {}
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(getUserFilter(req)).select('-password')

    res.json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      ...getUserFilter(req)
    }).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, telefono, password, role, companyId } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contrasena y rol son requeridos'
      })
    }

    const validRoles = ['admin', 'contador', 'dueno']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol invalido. Debe ser: admin, contador, o dueno'
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya esta registrado'
      })
    }

    const targetCompanyId = req.user?.companyId || companyId || null
    if (role !== 'admin' && !targetCompanyId) {
      return res.status(400).json({
        success: false,
        message: 'Debe asignar una empresa para usuarios contador o dueno'
      })
    }

    const user = await User.create({
      name,
      email,
      telefono,
      password,
      role,
      companyId: role === 'admin' ? null : targetCompanyId,
      isActive: true
    })

    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { name, email, telefono, role, isActive } = req.body
    const userId = req.params.id

    if (role) {
      const validRoles = ['admin', 'contador', 'dueno']
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol invalido. Debe ser: admin, contador, o dueno'
        })
      }
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya esta registrado'
        })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (telefono) updateData.telefono = telefono
    if (role) updateData.role = role
    if (typeof isActive !== 'undefined') updateData.isActive = isActive

    const user = await User.findOneAndUpdate(
      { _id: userId, ...getUserFilter(req) },
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    if (userId === req.user?._id?.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      })
    }

    const user = await User.findOneAndDelete({
      _id: userId,
      ...getUserFilter(req)
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    })
  }
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
