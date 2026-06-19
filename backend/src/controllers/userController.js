import User from '../models/user.js'

const COMPANY_ID = '000000000000000000000001'

/**
 * @desc    Obtener todos los usuarios de la empresa
 * @route   GET /api/users
 * @access  Admin only
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: COMPANY_ID }).select('-password')

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

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Admin only
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

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

/**
 * @desc    Crear un nuevo usuario
 * @route   POST /api/users
 * @access  Admin only
 */
export const createUser = async (req, res) => {
  try {
    const { name, email,telefono, password, role, companyId } = req.body

    // Validar campos requeridos
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contraseña y rol son requeridos'
      })
    }

    // Validar que el email no exista
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
    }

    // Validar rol
    const validRoles = ['admin', 'contador', 'dueno']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser: admin, contador, o dueno'
      })
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      telefono,
      password,
      role,
      companyId: companyId || COMPANY_ID,
      isActive: true
    })

    // Retornar sin contraseña
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

/**
 * @desc    Actualizar un usuario
 * @route   PUT /api/users/:id
 * @access  Admin only
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email,telefono, role, isActive } = req.body
    const userId = req.params.id

    // Validar rol si se proporciona
    if (role) {
      const validRoles = ['admin', 'contador', 'dueno']
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser: admin, contador, o dueno'
        })
      }
    }

    // Si el email cambia, verificar que no exista
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        })
      }
    }

    // Actualizar usuario
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (typeof isActive !== 'undefined') updateData.isActive = isActive

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password')

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

/**
 * @desc    Eliminar un usuario
 * @route   DELETE /api/users/:id
 * @access  Admin only
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    // No permitir eliminar al usuario actual
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      })
    }

    const user = await User.findByIdAndDelete(userId)

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
