import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: 
  { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: 
  { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  password: 
  { type: String, 
    required: true, 
    minlength: 6 
  },
  role:
   { 
    type: String, 
    enum: ['admin', 'contador', 'dueno'], 
    default: 'contador' 
  },
  companyId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: false, 
    default: null
  },

  isActive: { 
            type: Boolean, 
            default: true 
            }
}, 


{ 
  timestamps: true 


})
  

// Hash para el password cuando se modifica.

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

//metodo para comparar password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}


export default mongoose.model('User', userSchema)
