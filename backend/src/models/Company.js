import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
  },
  // Contador o admin que gestiona esta empresa
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La empresa debe tener un propietario asignado']
  },
  currency: {
    type: String,
    enum: ['HNL', 'USD'],
    default: 'HNL'
  },
  fiscalYear: {
    type: Number,
    required: [true, 'El año fiscal es requerido'],
    min: 2020,
    max: 2030
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Company', companySchema)