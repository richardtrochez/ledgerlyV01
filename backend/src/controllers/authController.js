import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import Company from '../models/Company.js'

// Genera el token — sin fallback hardcodeado
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno')
  }
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * @desc  Login
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      })
    }

    // Buscar usuario activo
    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      })
    }

    // Verificar password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      })
    }

    // Obtener empresa solo si el usuario tiene companyId
    let company = null
    if (user.companyId) {
      company = await Company.findById(user.companyId).select('_id name')
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      data: {
        token,
        user: {
          id:        user._id,
          name:      user.name,
          email:     user.email,
          role:      user.role,
          companyId: user.companyId || null
        },
        company
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

/**
 * @desc  Obtener usuario autenticado
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

/**
 * @desc  Registrar usuario — solo admin
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyId } = req.body

    // Validar campos base
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      })
    }

    // Si el rol no es admin, companyId es obligatorio
    const assignedRole = role || 'dueno'
    if (assignedRole !== 'admin' && !companyId) {
      return res.status(400).json({
        success: false,
        message: 'companyId es requerido para roles contador y dueño'
      })
    }

    // Verificar que el email no exista
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      companyId: assignedRole !== 'admin' ? companyId : null
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id:        user._id,
          name:      user.name,
          email:     user.email,
          role:      user.role,
          companyId: user.companyId || null
        }
      }
    })
  } catch (error) {
    console.error('Error en register:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    })
  }
}

export default { login, getMe, register }
