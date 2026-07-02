import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema({
  // Empresa y período
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'La compra debe pertenecer a una empresa']
  },
  periodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: [true, 'La compra debe pertenecer a un período']
  },

  // Fechas
  fechaDocumento: {
    type: Date,
    required: [true, 'La fecha del documento es requerida']
  },
  fechaContabilizacion: {
    type: Date,
    required: [true, 'La fecha de contabilización es requerida']
  },

  // Proveedor
  proveedor: {
    type: String,
    required: [true, 'El nombre del proveedor es requerido'],
    trim: true
  },
  rtnProveedor: {
    type: String,
    required: [true, 'El RTN del proveedor es requerido'],
    trim: true
  },

  // Documento
  CAI: {
    type: String,
    trim: true,
    default: ''
  },
  numeroFactura: {
    type: String,
    required: [true, 'El número de factura es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },

  // ── Bases imponibles (montos ANTES de ISV) ────────────────────────────────
  baseExenta: {
    type: Number,
    default: 0,
    min: 0
  },
  baseImponible15: {
    type: Number,
    default: 0,
    min: 0
  },
  baseImponible18: {
    type: Number,
    default: 0,
    min: 0
  },

  // ── ISV calculado por tasa ─────────────────────────────────────────────────
  isv15: {
    type: Number,
    default: 0,
    min: 0
  },
  isv18: {
    type: Number,
    default: 0,
    min: 0
  },

  // ── Totales calculados automáticamente en pre-save ─────────────────────────
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

  // ── Estado y auditoría ─────────────────────────────────────────────────────
  estado: {
    type: String,
    enum: ['borrador', 'registrada', 'cancelada'],
    default: 'registrada'
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  editadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
})

// ── Índices ────────────────────────────────────────────────────────────────
purchaseSchema.index({ companyId: 1, periodId: 1 })
purchaseSchema.index({ companyId: 1, fechaDocumento: -1 })
purchaseSchema.index({ numeroFactura: 1, companyId: 1 })

// ── Pre-save: calcular totales del lado del servidor ──────────────────────
purchaseSchema.pre('save', function (next) {
  // totalBruto = bases imponibles + ISV de cada tasa
  // baseImponible es ANTES de ISV, por eso se suman por separado
  this.totalBruto =
    (this.baseExenta      || 0) +
    (this.baseImponible15 || 0) +
    (this.isv15           || 0) +
    (this.baseImponible18 || 0) +
    (this.isv18           || 0)

  // creditoFiscal = ISV total recuperable
  this.creditoFiscal =
    (this.isv15 || 0) +
    (this.isv18 || 0)

  next()
})

export default mongoose.model('Purchase', purchaseSchema)