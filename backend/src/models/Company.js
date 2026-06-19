import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
  },
  currency: {
    type: String,
    enum: ['HNL', 'USD'],
    default: 'HNL',
    required: true
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

const Company = mongoose.model('Company', companySchema)

export default Company
