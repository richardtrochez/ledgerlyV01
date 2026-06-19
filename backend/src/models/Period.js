import mongoose from 'mongoose'

const periodSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
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
    required: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

// Índice único para evitar duplicados de mes/año por empresa
periodSchema.index({ companyId: 1, month: 1, year: 1 }, { unique: true })

// Método virtual para obtener el nombre del periodo
periodSchema.virtual('periodName').get(function() {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[this.month - 1]} ${this.year}`
})

const Period = mongoose.model('Period', periodSchema)

export default Period
