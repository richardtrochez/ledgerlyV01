import Period from '../models/Period.js'

export const getPeriods = async (req, res) => {
  try {
    const { companyId } = req.query
    const filter = companyId ? { companyId } : {}

    const periods = await Period.find(filter).sort({ year: -1, month: -1 })

    res.json({ success: true, count: periods.length, data: periods })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener periodos', error: error.message })
  }
}

export const createPeriod = async (req, res) => {
  try {
     console.log('Body recibido:', req.body)
    const { month, year, companyId } = req.body

    
    const existing = await Period.findOne({ month, year, companyId })
    if (existing) {
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      return res.status(400).json({
        success: false,
        message: `Ya existe un periodo para ${meses[month - 1]} ${year}`
      })
    }

    const period = await Period.create(req.body)

    res.status(201).json({ success: true, message: 'Periodo creado exitosamente', data: period })
  } catch (error) {
    console.error('Error en createPeriod:', error)
    // Atrapar el error de índice único de Mongo como fallback
    if (error.code === 11000) {
      
      return res.status(400).json({ success: false, message: 'Ya existe un periodo con ese mes, año y empresa' })
    }
    res.status(500).json({ success: false, message: 'Error al crear periodo', error: error.message })
  }
}






export const closePeriod = async (req, res) => {
  try {
    const period = await Period.findById(req.params.id)
    if (!period) {
      return res.status(404).json({ success: false, message: 'Periodo no encontrado' })
    }
    if (period.status === 'cerrado') {
      return res.status(400).json({ success: false, message: 'El periodo ya está cerrado' })
    }

    period.status = 'cerrado'
    period.closedAt = new Date()
    await period.save()

    res.json({ success: true, message: 'Periodo cerrado exitosamente', data: period })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cerrar periodo', error: error.message })
  }
}

export default { getPeriods, createPeriod, closePeriod }
