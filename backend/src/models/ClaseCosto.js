import mongoose from 'mongoose'

const claseCostoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la clase de costo es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  },
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'creadoEn',
    updatedAt: 'actualizadoEn'
  }
})

claseCostoSchema.index({ empresaId: 1, nombre: 1 }, { unique: true })

const ClaseCosto = mongoose.model('ClaseCosto', claseCostoSchema)

export default ClaseCosto
