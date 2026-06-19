import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import Company from '../models/Company.js'

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'ledgerly_demo_secret'
  return jwt.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

/**
 * @desc    Login
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('Intento de login', { email })

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      })
    }

    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      })
    }

    // Obtener la empresa del usuario
    const company = await Company.findById(user.companyId).select('_id name code')

    const token = generateToken(user._id)

    console.log('Login exitoso', { email, role: user.role, company: company?.name })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        },
        company: company || null
      }
    })
  } catch (error) {
    console.error('Error en login', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    console.log('Obteniendo usuario actual', { userId: req.user.id })
    
    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Error al obtener usuario actual', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * @desc    Crear usuario (solo admin)
 * @route   POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyId } = req.body

    console.log('Registro de nuevo usuario', { name, email, role })

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.warn('Registro fallido: email ya registrado', { email })
      return res.status(400).json({ success: false, message: 'El email ya está registrado' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'dueno',
      companyId: companyId || '000000000000000000000001'
    })

    const token = generateToken(user._id)

    console.log('Usuario creado exitosamente', { email, role: user.role })

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    })
  } catch (error) {
    console.error('Error en registro', error)
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message })
  }

}



export default { login, getMe, register }
