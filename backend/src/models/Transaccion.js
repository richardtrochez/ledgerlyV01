import mongoose from 'mongoose'

const transaccionSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true
  },
  periodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo',
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['ingreso', 'egreso'],
    required: true,
    index: true
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  codigoCuenta: {
    type: String,
    required: [true, 'El codigo de cuenta es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripcion es requerida'],
    trim: true
  },
  monto: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto debe ser mayor a 0'],
    set: (valor) => Math.round(valor * 100) / 100
  },
  claseCostoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClaseCosto',
    default: null
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  editadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: {
    createdAt: 'creadoEn',
    updatedAt: 'actualizadoEn'
  }
})

transaccionSchema.pre('save', async function(next) {
  try {
    const Periodo = mongoose.model('Periodo')
    const periodo = await Periodo.findById(this.periodoId)

    if (!periodo) {
      throw new Error('El periodo no existe')
    }

    if (periodo.estado === 'cerrado') {
      throw new Error('No se puede registrar una transaccion en un periodo cerrado')
    }

    next()
  } catch (error) {
    next(error)
  }
})

transaccionSchema.index({ empresaId: 1, periodoId: 1, tipo: 1 })
transaccionSchema.index({ empresaId: 1, fecha: -1 })
transaccionSchema.index({ periodoId: 1, tipo: 1 })
transaccionSchema.index({ empresaId: 1, codigoCuenta: 1 })

const Transaccion = mongoose.model('Transaccion', transaccionSchema)

export default Transaccion