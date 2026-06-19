import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    })

    console.log(`MongoDB conectado: ${conn.connection.host}`)
    console.log(` Base de datos: ${conn.connection.name}`)
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`)
    process.exit(1)
  }
}

// Evento de conexión
mongoose.connection.on('disconnected', () => {
  console.log('DB no tiene conexion')
})

mongoose.connection.on('error', (err) => {
  console.error(`Error en la base de datos: ${err.message}`)
})

export default connectDB
