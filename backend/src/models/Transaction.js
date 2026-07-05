import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    periodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Period',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['ingreso', 'egreso'],
      required: true,
      index: true
    },
    fecha: {
      type: Date,
      required: true,
      index: true
    },
    accountCode: {
      type: String,
      default: ''
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    monto: {
      type: Number,
      required: true,
      min: 0,
      set: (val) => Math.round(val * 100) / 100
    },

    categoria: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Pre-save: valida que el período esté abierto y resuelve la categoría
transactionSchema.pre('save', async function (next) {
  try {
    const Period = mongoose.model('Period')
    const period = await Period.findById(this.periodId)

    if (!period || period.status === 'cerrado') {
      throw new Error('No se puede registrar en un período cerrado')
    }

    if (this.type === 'ingreso' && this.accountCode) {
      const Account = mongoose.model('Account')
      const account = await Account.findOne({
        code: this.accountCode,
        companyId: this.companyId
      }).select('name subgroup').lean()

      this.categoria = account ? (account.subgroup || account.name) : null
    }

    next()
  } catch (error) {
    next(error)
  }
})

// Índices compuestos para búsquedas rápidas
transactionSchema.index({ companyId: 1, periodId: 1, type: 1 })
transactionSchema.index({ companyId: 1, fecha: 1 })
transactionSchema.index({ periodId: 1, type: 1 })

export default mongoose.model('Transaction', transactionSchema)