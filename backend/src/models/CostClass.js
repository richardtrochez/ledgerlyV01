import mongoose from 'mongoose'

const costClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la clase de costo es requerido'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
})

// Índice para búsquedas eficientes
costClassSchema.index({ companyId: 1, name: 1 }, { unique: true })

const CostClass = mongoose.model('CostClass', costClassSchema)

export default CostClass
