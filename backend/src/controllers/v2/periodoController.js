import Periodo from '../../models/Periodo.js'

// Lista los periodos de una empresa.
export const listarPeriodos = async (req, res) => {
  try {
    const { empresaId } = req.query
    const filtro = empresaId ? { empresaId } : {}

    const periodos = await Periodo.find(filtro).sort({ anio: -1, mes: -1 })

    res.json({
      success: true,
      total: periodos.length,
      data: periodos
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar los periodos',
      error: error.message
    })
  }
}

// Obtiene un periodo por su ID.
export const obtenerPeriodoPorId = async (req, res) => {
  try {
    const periodo = await Periodo.findById(req.params.id)

    if (!periodo) {
      return res.status(404).json({
        success: false,
        message: 'Periodo no encontrado'
      })
    }

    res.json({
      success: true,
      data: periodo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el periodo',
      error: error.message
    })
  }
}

// Crea un periodo contable para una empresa.
export const crearPeriodo = async (req, res) => {
  try {
    const { empresaId, mes, anio } = req.body

    if (!empresaId || !mes || !anio) {
      return res.status(400).json({
        success: false,
        message: 'La empresa, el mes y el anio son requeridos'
      })
    }

    const periodo = await Periodo.create({
      empresaId,
      mes,
      anio
    })

    res.status(201).json({
      success: true,
      message: 'Periodo creado exitosamente',
      data: periodo
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un periodo con ese mes y anio para esta empresa'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el periodo',
      error: error.message
    })
  }
}

// Cierra un periodo para evitar nuevos registros.
export const cerrarPeriodo = async (req, res) => {
  try {
    const periodo = await Periodo.findById(req.params.id)

    if (!periodo) {
      return res.status(404).json({
        success: false,
        message: 'Periodo no encontrado'
      })
    }

    if (periodo.estado === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'El periodo ya esta cerrado'
      })
    }

    periodo.estado = 'cerrado'
    periodo.cerradoEn = new Date()
    periodo.cerradoPor = req.body.cerradoPor || null

    await periodo.save()

    res.json({
      success: true,
      message: 'Periodo cerrado exitosamente',
      data: periodo
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar el periodo',
      error: error.message
    })
  }
}
