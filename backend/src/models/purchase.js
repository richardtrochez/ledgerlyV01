import mongoose from 'mongoose'

const purchaseSchema = new mongoose.Schema({
  // Datos de la empresa y período
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    required: true
  },

  periodId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Period', 
    required: true
  },

  // Fechas
  fechaDocumento: { 
    type: Date, 
    required: true 
  },

  fechaContabilizacion: { 
    type: Date, 
    required: true 
  },

  // Datos del proveedor
  proveedor: { 
    type: String, 
    required: true, 
    trim: true 
  },

  rtnProveedor: { 
    type: String, 
    required: true, 
    trim: true 
  },

  // Documento de la factura
  CAI: { 
    type: String, 
    trim: true 
  },

  numeroFactura: { 
    type: String, 
    required: true, 
    trim: true 
  },

  descripcion: { 
    type: String, 
    required: true, 
    trim: true 
  },

  // ========== SUBTOTALES POR TASA DE ISV ==========
  
  // Exento de ISV
  subtotalExento: { 
    type: Number, 
    default: 0, 
    min: 0 
  },

  // Gravado al 15%
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

  // Gravado al 18%
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

  // ========== TOTALES CALCULADOS ==========

  // Total bruto (suma de subtotales)
  totalBruto: { 
    type: Number, 
    default: 0 
  },

  // Crédito fiscal (ISV15 + ISV18)
  creditoFiscal: { 
    type: Number, 
    default: 0 
  },

  // Gasto no deducible (marcado por contador si aplica)
  gastoNoDeducible: { 
    type: Number, 
    default: 0, 
    min: 0 
  },

  // ========== ESTADO Y AUDITORÍA ==========

  estado: { 
    type: String, 
    enum: ['borrador', 'registrada', 'cancelada'], 
    default: 'registrada' 
  },

  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  editadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }

}, { timestamps: true })

// ========== ÍNDICES ==========
purchaseSchema.index({ companyId: 1, periodId: 1 })
purchaseSchema.index({ companyId: 1, fechaDocumento: -1 })
purchaseSchema.index({ numeroFactura: 1, companyId: 1 })

// ========== PRE-SAVE: CALCULAR TOTALES ==========
purchaseSchema.pre('save', function(next) {
  // Total bruto = subtotales + ISV
  this.totalBruto = 
    (this.subtotalExento || 0) + 
    (this.subtotal15 || 0) + 
    (this.isv15 || 0) +
    (this.subtotal18 || 0) +
    (this.isv18 || 0)

  // Crédito fiscal = ISV15 + ISV18
  this.creditoFiscal = 
    (this.isv15 || 0) + 
    (this.isv18 || 0)

  next()
})

export default mongoose.model('Purchase', purchaseSchema)