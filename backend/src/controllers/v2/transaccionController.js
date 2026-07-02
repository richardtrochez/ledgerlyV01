import Transaccion from '../../models/Transaccion.js'
import CuentaContable from '../../models/CuentaContable.js'
import Periodo from '../../models/Periodo.js'
import mongoose from 'mongoose'

// Lista transacciones. Permite filtrar por empresa, periodo y tipo.
export const listarTransacciones = async (req, res) => {
  try {
    const { empresaId, periodoId, tipo } = req.query
    const filtro = {}

    if (empresaId) filtro.empresaId = empresaId
    if (periodoId) filtro.periodoId = periodoId
    if (tipo) filtro.tipo = tipo

    const transacciones = await Transaccion.find(filtro)
      .populate('periodoId', 'mes anio estado')
      .populate('claseCostoId', 'nombre')
      .sort({ fecha: -1 })

    res.json({
      success: true,
      total: transacciones.length,
      data: transacciones
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar las transacciones',
      error: error.message
    })
  }
}

// Obtiene una transaccion por su ID.
export const obtenerTransaccionPorId = async (req, res) => {
  try {
    const transaccion = await Transaccion.findById(req.params.id)
      .populate('periodoId', 'mes anio estado')
      .populate('claseCostoId', 'nombre')

    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transaccion no encontrada'
      })
    }

    res.json({
      success: true,
      data: transaccion
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la transaccion',
      error: error.message
    })
  }
}

// Crea una transaccion financiera.
export const crearTransaccion = async (req, res) => {
  try {
    const {
      empresaId,
      periodoId,
      tipo,
      fecha,
      codigoCuenta,
      descripcion,
      monto,
      claseCostoId,
      creadoPor
    } = req.body

    if (!empresaId || !periodoId || !tipo || !fecha || !codigoCuenta || !descripcion || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Empresa, periodo, tipo, fecha, cuenta, descripcion y monto son requeridos'
      })
    }

    if (!['ingreso', 'egreso'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser ingreso o egreso'
      })
    }

    const cuenta = await CuentaContable.findOne({
      empresaId,
      codigo: codigoCuenta,
      activo: true
    })

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'La cuenta contable no existe o esta inactiva'
      })
    }

    const periodo = await Periodo.findOne({
      _id: periodoId,
      empresaId
    })

    if (!periodo) {
      return res.status(404).json({
        success: false,
        message: 'El periodo no existe para esta empresa'
      })
    }

    if (periodo.estado === 'cerrado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede registrar en un periodo cerrado'
      })
    }

    const transaccion = await Transaccion.create({
      empresaId,
      periodoId,
      tipo,
      fecha,
      codigoCuenta,
      descripcion,
      monto,
      claseCostoId: claseCostoId || null,
      creadoPor: creadoPor || null
    })

    res.status(201).json({
      success: true,
      message: 'Transaccion creada exitosamente',
      data: transaccion
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la transaccion',
      error: error.message
    })
  }
}

// Actualiza una transaccion.
export const actualizarTransaccion = async (req, res) => {
  try {
    const {
      tipo,
      fecha,
      codigoCuenta,
      descripcion,
      monto,
      claseCostoId,
      editadoPor
    } = req.body

    const transaccion = await Transaccion.findById(req.params.id)

    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transaccion no encontrada'
      })
    }

    if (codigoCuenta !== undefined) {
      const cuenta = await CuentaContable.findOne({
        empresaId: transaccion.empresaId,
        codigo: codigoCuenta,
        activo: true
      })

      if (!cuenta) {
        return res.status(404).json({
          success: false,
          message: 'La cuenta contable no existe o esta inactiva'
        })
      }

      transaccion.codigoCuenta = codigoCuenta
    }

    if (tipo !== undefined) transaccion.tipo = tipo
    if (fecha !== undefined) transaccion.fecha = fecha
    if (descripcion !== undefined) transaccion.descripcion = descripcion
    if (monto !== undefined) transaccion.monto = monto
    if (claseCostoId !== undefined) transaccion.claseCostoId = claseCostoId || null
    if (editadoPor !== undefined) transaccion.editadoPor = editadoPor || null

    await transaccion.save()

    res.json({
      success: true,
      message: 'Transaccion actualizada exitosamente',
      data: transaccion
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la transaccion',
      error: error.message
    })
  }
}

// Elimina una transaccion.
export const eliminarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findById(req.params.id)

    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transaccion no encontrada'
      })
    }

    await transaccion.deleteOne()

    res.json({
      success: true,
      message: 'Transaccion eliminada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la transaccion',
      error: error.message
    })
  }
}

// Calcula un resumen financiero simple.
export const obtenerResumenTransacciones = async (req, res) => {
  try {
    const { empresaId, periodoId } = req.query

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'La empresa es requerida'
      })
    }

    const filtro = {
      empresaId: new mongoose.Types.ObjectId(empresaId)
    }

    if (periodoId) {
      filtro.periodoId = new mongoose.Types.ObjectId(periodoId)
    }

    const resumen = await Transaccion.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      }
    ])

    const ingresos = resumen.find(item => item._id === 'ingreso')
    const egresos = resumen.find(item => item._id === 'egreso')
    const totalIngresos = ingresos?.total || 0
    const totalEgresos = egresos?.total || 0

    res.json({
      success: true,
      data: {
        totalIngresos,
        totalEgresos,
        utilidad: totalIngresos - totalEgresos,
        cantidadIngresos: ingresos?.cantidad || 0,
        cantidadEgresos: egresos?.cantidad || 0
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen de transacciones',
      error: error.message
    })
  }
}
