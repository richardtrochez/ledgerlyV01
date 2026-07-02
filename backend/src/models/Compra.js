import mongoose from 'mongoose'

const compraSchema = new mongoose.Schema({
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
  fechaDocumento: {
    type: Date,
    required: [true, 'La fecha del documento es requerida']
  },
  fechaContabilizacion: {
    type: Date,
    required: [true, 'La fecha de contabilizacion es requerida']
  },
  proveedor: {
    type: String,
    required: [true, 'El proveedor es requerido'],
    trim: true
  },
  rtnProveedor: {
    type: String,
    required: [true, 'El RTN del proveedor es requerido'],
    trim: true
  },
  cai: {
    type: String,
    trim: true,
    default: ''
  },
  numeroFactura: {
    type: String,
    required: [true, 'El numero de factura es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripcion es requerida'],
    trim: true
  },
  subtotalExento: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal15: {
    type: Number,
    default: 0,
    min: 0
  },
  isv15: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal18: {
    type: Number,
    default: 0,
    min: 0
  },
  isv18: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBruto: {
    type: Number,
    default: 0
  },
  creditoFiscal: {
    type: Number,
    default: 0
  },
  gastoNoDeducible: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['borrador', 'registrada', 'cancelada'],
    default: 'registrada'
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

compraSchema.pre('save', function(next) {
  this.totalBruto =
    (this.subtotalExento || 0) +
    (this.subtotal15 || 0) +
    (this.isv15 || 0) +
    (this.subtotal18 || 0) +
    (this.isv18 || 0)

  this.creditoFiscal = (this.isv15 || 0) + (this.isv18 || 0)

  next()
})

compraSchema.index({ empresaId: 1, periodoId: 1 })
compraSchema.index({ empresaId: 1, fechaDocumento: -1 })
compraSchema.index({ empresaId: 1, numeroFactura: 1 })

const Compra = mongoose.model('Compra', compraSchema)

export default Compra
