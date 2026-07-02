import CuentaContable from '../../models/CuentaContable.js'

// Lista las cuentas contables de una empresa.
export const listarCuentas = async (req, res) => {
  try {
    const { empresaId, grupo } = req.query
    const filtro = {}

    if (empresaId) filtro.empresaId = empresaId
    if (grupo) filtro.grupo = grupo

    const cuentas = await CuentaContable.find(filtro).sort({ codigo: 1 })

    res.json({
      success: true,
      total: cuentas.length,
      data: cuentas
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar las cuentas contables',
      error: error.message
    })
  }
}

// Obtiene una cuenta contable por su ID.
export const obtenerCuentaPorId = async (req, res) => {
  try {
    const cuenta = await CuentaContable.findById(req.params.id)

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada'
      })
    }

    res.json({
      success: true,
      data: cuenta
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cuenta contable',
      error: error.message
    })
  }
}

// Crea una cuenta contable.
export const crearCuenta = async (req, res) => {
  try {
    const { empresaId, codigo, nombre, grupo, subgrupo } = req.body

    if (!empresaId || !codigo || !nombre || !grupo) {
      return res.status(400).json({
        success: false,
        message: 'La empresa, codigo, nombre y grupo son requeridos'
      })
    }

    const cuenta = await CuentaContable.create({
      empresaId,
      codigo,
      nombre,
      grupo,
      subgrupo
    })

    res.status(201).json({
      success: true,
      message: 'Cuenta contable creada exitosamente',
      data: cuenta
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con ese codigo para esta empresa'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear la cuenta contable',
      error: error.message
    })
  }
}

// Actualiza una cuenta contable.
export const actualizarCuenta = async (req, res) => {
  try {
    const { codigo, nombre, grupo, subgrupo, activo } = req.body
    const cuenta = await CuentaContable.findById(req.params.id)

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada'
      })
    }

    if (codigo !== undefined) cuenta.codigo = codigo
    if (nombre !== undefined) cuenta.nombre = nombre
    if (grupo !== undefined) cuenta.grupo = grupo
    if (subgrupo !== undefined) cuenta.subgrupo = subgrupo
    if (activo !== undefined) cuenta.activo = activo

    await cuenta.save()

    res.json({
      success: true,
      message: 'Cuenta contable actualizada exitosamente',
      data: cuenta
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cuenta contable',
      error: error.message
    })
  }
}

// Desactiva una cuenta contable sin eliminarla.
export const desactivarCuenta = async (req, res) => {
  try {
    const cuenta = await CuentaContable.findById(req.params.id)

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada'
      })
    }

    cuenta.activo = false
    await cuenta.save()

    res.json({
      success: true,
      message: 'Cuenta contable desactivada correctamente',
      data: cuenta
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar la cuenta contable',
      error: error.message
    })
  }
}
