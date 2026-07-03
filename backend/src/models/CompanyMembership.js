import mongoose from 'mongoose'

const companyMembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'La empresa es requerida']
  },
  // Un mismo usuario puede tener roles distintos en distintas empresas.
  // Ej: dueno de su empresa personal, contador de otra.
  role: {
    type: String,
    enum: ['contador', 'dueno'],
    required: [true, 'El rol es requerido']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Un usuario no puede estar dos veces en la misma empresa
companyMembershipSchema.index({ userId: 1, companyId: 1 }, { unique: true })

// Para consultas rapidas al hacer login (que empresas tiene el usuario)
companyMembershipSchema.index({ userId: 1, isActive: 1 })

export default mongoose.model('CompanyMembership', companyMembershipSchema)
