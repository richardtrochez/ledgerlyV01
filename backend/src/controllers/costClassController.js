import CostClass from '../models/CostClass.js'

const getCompanyId = (req, res) => {
  const companyId = req.user?.companyId
  if (!companyId) {
    res.status(403).json({
      success: false,
      message: 'Tu usuario no tiene empresa asignada'
    })
    return null
  }
  return companyId
}

export const getCostClasses = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const costClasses = await CostClass.find({ companyId }).sort({ name: 1 })
    res.json(costClasses)
  } catch (error) {
    console.error('Error al obtener clases de costo:', error)
    res.status(500).json({
      message: 'Error al obtener las clases de costo',
      error: error.message
    })
  }
}

export const createCostClass = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'El nombre es requerido'
      })
    }

    const existingClass = await CostClass.findOne({ name, companyId })
    if (existingClass) {
      return res.status(400).json({
        message: 'Ya existe una clase de costo con ese nombre'
      })
    }

    const costClass = await CostClass.create({
      name,
      description,
      companyId
    })

    res.status(201).json(costClass)
  } catch (error) {
    console.error('Error al crear clase de costo:', error)
    res.status(500).json({
      message: 'Error al crear la clase de costo',
      error: error.message
    })
  }
}

export const updateCostClass = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { id } = req.params
    const { name, description, isActive } = req.body

    const costClass = await CostClass.findOne({ _id: id, companyId })

    if (!costClass) {
      return res.status(404).json({
        message: 'Clase de costo no encontrada'
      })
    }

    if (name) costClass.name = name
    if (description !== undefined) costClass.description = description
    if (isActive !== undefined) costClass.isActive = isActive

    await costClass.save()

    res.json(costClass)
  } catch (error) {
    console.error('Error al actualizar clase de costo:', error)
    res.status(500).json({
      message: 'Error al actualizar la clase de costo',
      error: error.message
    })
  }
}

export const deleteCostClass = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const { id } = req.params

    const costClass = await CostClass.findOneAndDelete({ _id: id, companyId })

    if (!costClass) {
      return res.status(404).json({
        message: 'Clase de costo no encontrada'
      })
    }

    res.json({
      message: 'Clase de costo eliminada exitosamente',
      costClass
    })
  } catch (error) {
    console.error('Error al eliminar clase de costo:', error)
    res.status(500).json({
      message: 'Error al eliminar la clase de costo',
      error: error.message
    })
  }
}
