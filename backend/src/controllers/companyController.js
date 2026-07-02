import Company from '../models/Company.js'

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
    res.json({
      success: true,
      count: companies.length,
      data: companies
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener empresas',
      error: error.message
    })
  }
}

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body)
    res.status(201).json({
      success: true,
      message: 'Empresa creada exitosamente',
      data: company
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear empresa',
      error: error.message
    })
  }
}