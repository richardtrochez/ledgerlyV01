import mongoose from 'mongoose'

const empresaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la empresa es requerido'],
    trim: true
},
  moneda: {
    type: String,
    enum: ['HNL', 'USD'],
    default: 'HNL',
    required: true
},
  anioFiscal: {
    type: Number,
    required: [true, 'El anio fiscal es requerido'],
    min: 2023,
    max: 2099
},
  activo: {
    type: Boolean,
    default: true
  }
}, {
timestamps: {
    createdAt: 'creadoEn',
    updatedAt: 'actualizadoEn'
}
})

const Empresa = mongoose.model('Empresa', empresaSchema)

export default Empresa
