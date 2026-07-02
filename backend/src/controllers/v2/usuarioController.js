import jwt from 'jsonwebtoken'
import Usuario from '../../models/Usuario.js'
import Empresa from '../../models/Empresa.js'

const crearToken = (usuarioId) => {
  return jwt.sign(
    { id: usuarioId },
    process.env.JWT_SECRET || 'ledgerly_secreto_temporal',
    { expiresIn: '7d' }
  )
}

// Lista usuarios. Permite filtrar por empresa.
export const listarUsuarios = async (req, res) => {
  try {
    const { empresaId } = req.query
    const filtro = empresaId ? { empresaId } : {}

    const usuarios = await Usuario.find(filtro)
      .select('-contrasena')
      .populate('empresaId', 'nombre moneda anioFiscal')
      .sort({ creadoEn: -1 })

    res.json({
      success: true,
      total: usuarios.length,
      data: usuarios
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar los usuarios',
      error: error.message
    })
  }
}

// Crea un usuario para una empresa.
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, telefono, contrasena, rol, empresaId } = req.body

    if (!nombre || !correo || !contrasena || !empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo, contrasena y empresa son requeridos'
      })
    }

    const empresa = await Empresa.findById(empresaId)
    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'La empresa no existe'
      })
    }

    const usuarioExiste = await Usuario.findOne({ correo })
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con ese correo'
      })
    }

    const usuario = await Usuario.create({
      nombre,
      correo,
      telefono,
      contrasena,
      rol,
      empresaId
    })

    const usuarioSeguro = usuario.toObject()
    delete usuarioSeguro.contrasena

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioSeguro
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: error.message
    })
  }
}

// Inicia sesion con correo y contrasena.
export const loginUsuario = async (req, res) => {
  try {
    const { correo, contrasena } = req.body

    if (!correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contrasena son requeridos'
      })
    }

    const usuario = await Usuario.findOne({ correo, activo: true })

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      })
    }

    const contrasenaCorrecta = await usuario.compararContrasena(contrasena)

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      })
    }

    const empresa = await Empresa.findById(usuario.empresaId).select('nombre moneda anioFiscal')
    const token = crearToken(usuario._id)

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
          empresaId: usuario.empresaId
        },
        empresa
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesion',
      error: error.message
    })
  }
}

// Obtiene un usuario por ID, sin mostrar contrasena.
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .select('-contrasena')
      .populate('empresaId', 'nombre moneda anioFiscal')

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      data: usuario
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    })
  }
}
