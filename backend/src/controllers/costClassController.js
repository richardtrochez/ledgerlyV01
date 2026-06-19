import CostClass from '../models/CostClass.js'

// Obtener todas las clases de costo de una empresa
export const getCostClasses = async (req, res) => {
  try {
    const { companyId } = req.query
    
    const query = companyId ? { companyId } : {}
    const costClasses = await CostClass.find(query)
      .sort({ name: 1 })
    
    res.json(costClasses)
  } catch (error) {
    console.error('Error al obtener clases de costo:', error)
    res.status(500).json({ 
      message: 'Error al obtener las clases de costo',
      error: error.message 
    })
  }
}

// Crear una nueva clase de costo
export const createCostClass = async (req, res) => {
  try {
    const { name, description, companyId } = req.body
    
    // Validar datos requeridos
    if (!name || !companyId) {
      return res.status(400).json({ 
        message: 'El nombre y companyId son requeridos' 
      })
    }
    
    // Verificar si ya existe una clase con ese nombre para esa empresa
    const existingClass = await CostClass.findOne({ name, companyId })
    if (existingClass) {
      return res.status(400).json({ 
        message: 'Ya existe una clase de costo con ese nombre' 
      })
    }
    
    const costClass = new CostClass({
      name,
      description,
      companyId
    })
    
    await costClass.save()
    
    res.status(201).json(costClass)
  } catch (error) {
    console.error('Error al crear clase de costo:', error)
    res.status(500).json({ 
      message: 'Error al crear la clase de costo',
      error: error.message 
    })
  }
}

// Actualizar una clase de costo
export const updateCostClass = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, isActive } = req.body
    
    const costClass = await CostClass.findById(id)
    
    if (!costClass) {
      return res.status(404).json({ 
        message: 'Clase de costo no encontrada' 
      })
    }
    
    // Actualizar campos
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

// Eliminar una clase de costo
export const deleteCostClass = async (req, res) => {
  try {
    const { id } = req.params
    
    const costClass = await CostClass.findByIdAndDelete(id)
    
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
