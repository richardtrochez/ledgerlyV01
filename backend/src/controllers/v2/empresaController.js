import Empresa from '../../models/Empresa.js'

// Lista todas las empresas registradas.
export const listarEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.find().sort({ creadoEn: -1 })

    res.json({
      success: true,
      total: empresas.length,
      data: empresas
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar las empresas',
      error: error.message
    })
  }
}

// Obtiene una empresa por su ID.
export const obtenerEmpresaPorId = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id)

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      })
    }

    res.json({
      success: true,
      data: empresa
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la empresa',
      error: error.message
    })
  }
}

// Crea una empresa nueva.
export const crearEmpresa = async (req, res) => {
  try {
    const { nombre, moneda, anioFiscal } = req.body

    if (!nombre || !anioFiscal) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el anio fiscal son requeridos'
      })
    }

    const empresa = await Empresa.create({
      nombre,
      moneda,
      anioFiscal
    })  

    res.status(201).json({
      success: true,
      message: 'Empresa creada exitosamente',
      data: empresa
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la empresa',
      error: error.message
    })
  }
}

// Actualiza los datos de una empresa.
export const actualizarEmpresa = async (req, res) => {
  try {
    const { nombre, moneda, anioFiscal, activo } = req.body
    
    const empresa = await Empresa.findById(req.params.id)

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      })
    }

    if (nombre !== undefined) empresa.nombre = nombre
    if (moneda !== undefined) empresa.moneda = moneda
    if (anioFiscal !== undefined) empresa.anioFiscal = anioFiscal
    if (activo !== undefined) empresa.activo = activo

    await empresa.save()

    res.json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      data: empresa
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al modificar la empresa',
      error: error.message
    })
  }
}

// Desactiva una empresa sin borrarla de la base de datos.
export const desactivarEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id)

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada'
      })
    }

    empresa.activo = false
    await empresa.save() 

    res.json({
      success: true,
      message: 'Empresa desactivada correctamente',
      data: empresa
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar empresa',
      error: error.message
    })
  }
}
