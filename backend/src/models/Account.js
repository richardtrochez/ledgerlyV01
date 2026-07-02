import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código de cuenta es requerido'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'El nombre de la cuenta es requerido'],
    trim: true
  },
  group: {
    type: String,
    required: true,
    enum: ['ingreso', 'costo_directo', 'gasto_operativo', 'otros'],
    index: true
  },
  subgroup: {
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

// Índice compuesto para búsquedas eficientes
accountSchema.index({ companyId: 1, code: 1 })
accountSchema.index({ companyId: 1, group: 1 })

const Account = mongoose.model('Account', accountSchema)

export default Account
