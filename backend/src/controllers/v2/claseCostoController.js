import ClaseCosto from '../../models/ClaseCosto.js'

// Lista las clases de costo de una empresa.
export const listarClasesCosto = async (req, res) => {
  try {
    const { empresaId } = req.query
    const filtro = empresaId ? { empresaId } : {}

    const clases = await ClaseCosto.find(filtro).sort({ nombre: 1 })

    res.json({
      success: true,
      total: clases.length,
      data: clases
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar las clases de costo',
      error: error.message
    })
  }
}

// Obtiene una clase de costo por su ID.
export const obtenerClaseCostoPorId = async (req, res) => {
  try {
    const clase = await ClaseCosto.findById(req.params.id)

    if (!clase) {
      return res.status(404).json({
        success: false,
        message: 'Clase de costo no encontrada'
      })
    }

    res.json({
      success: true,
      data: clase
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la clase de costo',
      error: error.message
    })
  }
}

// Crea una clase de costo.
export const crearClaseCosto = async (req, res) => {
  try {
    const { empresaId, nombre, descripcion } = req.body

    if (!empresaId || !nombre) {
      return res.status(400).json({
        success: false,
        message: 'La empresa y el nombre son requeridos'
      })
    }

    const clase = await ClaseCosto.create({
      empresaId,
      nombre,
      descripcion
    })

    res.status(201).json({
      success: true,
      message: 'Clase de costo creada exitosamente',
      data: clase
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una clase de costo con ese nombre para esta empresa'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear la clase de costo',
      error: error.message
    })
  }
}

// Actualiza una clase de costo.
export const actualizarClaseCosto = async (req, res) => {
  try {
    const { nombre, descripcion, activo } = req.body
    const clase = await ClaseCosto.findById(req.params.id)

    if (!clase) {
      return res.status(404).json({
        success: false,
        message: 'Clase de costo no encontrada'
      })
    }

    if (nombre !== undefined) clase.nombre = nombre
    if (descripcion !== undefined) clase.descripcion = descripcion
    if (activo !== undefined) clase.activo = activo

    await clase.save()

    res.json({
      success: true,
      message: 'Clase de costo actualizada exitosamente',
      data: clase
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la clase de costo',
      error: error.message
    })
  }
}

// Desactiva una clase de costo sin eliminarla.
export const desactivarClaseCosto = async (req, res) => {
  try {
    const clase = await ClaseCosto.findById(req.params.id)

    if (!clase) {
      return res.status(404).json({
        success: false,
        message: 'Clase de costo no encontrada'
      })
    }

    clase.activo = false
    await clase.save()

    res.json({
      success: true,
      message: 'Clase de costo desactivada correctamente',
      data: clase
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar la clase de costo',
      error: error.message
    })
  }
}
