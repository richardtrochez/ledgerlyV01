import mongoose from 'mongoose'

const cuentaContableSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El codigo de cuenta es requerido'],
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la cuenta es requerido'],
    trim: true
  },
  grupo: {
    type: String,
    required: [true, 'El grupo de la cuenta es requerido'],
    enum: ['ingreso', 'costo_directo', 'gasto_operativo', 'otros'],
    trim: true,
    index: true
  },
  subgrupo: {
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

cuentaContableSchema.index({ empresaId: 1, codigo: 1 }, { unique: true })
cuentaContableSchema.index({ empresaId: 1, grupo: 1 })

const CuentaContable = mongoose.model('CuentaContable', cuentaContableSchema)

export default CuentaContable
