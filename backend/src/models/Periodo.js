import mongoose from 'mongoose'

const periodoSchema = new mongoose.Schema({
  anio: {
    type: Number,
    required: [true, 'El anio es requerido'],
    min: 2023,
    max: 2099
  },
  mes: {
    type: Number,
    required: [true, 'El mes es requerido'],
    min: 1,
    max: 12
  },
  estado: {
    type: String,
    enum: ['abierto', 'cerrado'],
    default: 'abierto'
  },
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  },
  cerradoEn: {
    type: Date
  },
  cerradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: {
    createdAt: 'creadoEn',
    updatedAt: 'actualizadoEn'
  }
})

periodoSchema.index({ empresaId: 1, mes: 1, anio: 1 }, { unique: true })

periodoSchema.virtual('nombrePeriodo').get(function() {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return `${meses[this.mes - 1]} ${this.anio}`
})

const Periodo = mongoose.model('Periodo', periodoSchema)

export default Periodo
