import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import CompanyMembership from '../models/CompanyMembership.js'


export const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado, token requerido' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' })
    }

    // La empresa activa viene EN EL TOKEN, no en la base de datos.
    // Esto es lo que permite N:N: cambiar de empresa = reemitir el token con otro activeCompanyId.
    const activeCompanyId = decoded.activeCompanyId || null

    // Validar que el usuario aun tenga membresia activa en esa empresa (por seguridad,
    // por si el admin le quito acceso despues de emitir el token)
    if (activeCompanyId && user.role !== 'admin') {
      const membership = await CompanyMembership.findOne({
        userId: user._id,
        companyId: activeCompanyId,
        isActive: true
      })
      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Tu acceso a esta empresa fue revocado. Inicia sesion de nuevo.'
        })
      }
    }

    // Sustituimos companyId del usuario por la empresa activa del token.
    // Los controladores siguen leyendo req.user.companyId como siempre.
    const userObj = user.toObject()
    userObj.companyId = activeCompanyId
    req.user = userObj

    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalido o expirado' })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para esta accion' })
    }
    next()
  }
}
