import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del usuario es requerido'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo del usuario es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    default: '',
    trim: true
  },
  contrasena: {
    type: String,
    required: [true, 'La contrasena es requerida'],
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['admin', 'contador', 'dueno'],
    default: 'dueno'
  },
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'creadoEn',
    updatedAt: 'actualizadoEn'
  }
})

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next()

  const salt = await bcrypt.genSalt(10)
  this.contrasena = await bcrypt.hash(this.contrasena, salt)
  next()
})

usuarioSchema.methods.compararContrasena = async function(contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena)
}

const Usuario = mongoose.model('Usuario', usuarioSchema)

export default Usuario
