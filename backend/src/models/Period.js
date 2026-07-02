import mongoose from 'mongoose'

const periodSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: [true, 'El mes es requerido'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'El año es requerido'],
    min: 2020,
    max: 2030
  },
  status: {
    type: String,
    enum: ['abierto', 'cerrado'],
    default: 'abierto'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'El período debe pertenecer a una empresa']
  },
  closedAt: {
    type: Date,
    default: null
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },  // ← activa virtuals en res.json()
  toObject: { virtuals: true }   // ← activa virtuals en .toObject()
})

// Previene duplicado de mes+año por empresa
periodSchema.index({ companyId: 1, month: 1, year: 1 }, { unique: true })

// Virtual: nombre legible del período
periodSchema.virtual('periodName').get(function () {
  const meses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ]
  return `${meses[this.month - 1]} ${this.year}`
})

export default mongoose.model('Period', periodSchema)