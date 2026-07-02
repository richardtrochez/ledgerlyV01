import PDFDocument from 'pdfkit'
import { buildIncomeStatementData } from '../helpers/reportBuilder.js'

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

const parseMonthParam = (val, fallback) => {
  const parsed = parseInt(val)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * @desc  Estado de Resultados JSON
 * @route GET /api/reports/income-statement
 */
export const getIncomeStatement = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const fiscalYear = parseInt(req.query.year) || new Date().getFullYear()
    const startMonth = parseMonthParam(req.query.fromMonth, 1)
    const endMonth   = parseMonthParam(req.query.toMonth, 12)

    if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Los meses deben estar entre 1 y 12'
      })
    }

    if (startMonth > endMonth) {
      return res.status(400).json({
        success: false,
        message: 'El mes inicial no puede ser mayor al mes final'
      })
    }

    // companyId desde req.user — no desde req.query
    const data = await buildIncomeStatementData({
      fiscalYear,
      startMonth,
      endMonth,
      companyId
    })

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error en getIncomeStatement:', error)
    res.status(500).json({
      success: false,
      message: 'Error al generar el Estado de Resultados'
    })
  }
}

/**
 * @desc  Estado de Resultados PDF
 * @route GET /api/reports/income-statement/pdf
 */
export const getIncomeStatementPDF = async (req, res) => {
  try {
    const companyId = getCompanyId(req, res)
    if (!companyId) return

    const fiscalYear = parseInt(req.query.year) || new Date().getFullYear()
    const startMonth = parseMonthParam(req.query.fromMonth, 1)
    const endMonth   = parseMonthParam(req.query.toMonth, 12)

    const data = await buildIncomeStatementData({
      fiscalYear,
      startMonth,
      endMonth,
      companyId
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition',
      `attachment; filename="estado-resultados-${fiscalYear}.pdf"`)

    const doc = new PDFDocument({ margin: 40, size: 'LETTER' })
    doc.pipe(res)

    const fmt  = (val) => `L ${Number(val || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`
    const BLUE  = '#1d4ed8'
    const GRAY  = '#6b7280'
    const LIGHT = '#f3f4f6'
    const BLACK = '#111827'
    const GREEN = '#059669'
    const RED   = '#dc2626'

    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const periodoLabel = startMonth === endMonth
      ? `${monthNames[startMonth - 1]} ${fiscalYear}`
      : `${monthNames[startMonth - 1]} – ${monthNames[endMonth - 1]} ${fiscalYear}`

    // ── Encabezado ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 70).fill(BLUE)
    doc.fillColor('white').fontSize(20).font('Helvetica-Bold').text('Ledgerly', 40, 18)
    doc.fontSize(11).font('Helvetica').text('Sistema de Gestión Financiera para MiPymes', 40, 42)
    doc.fontSize(10).text(`Período: ${periodoLabel}`, 40, 58)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-HN')}`, 400, 58, { align: 'right' })

    let y = 90

    doc.fillColor(BLACK).fontSize(14).font('Helvetica-Bold')
      .text('ESTADO DE RESULTADOS', 40, y, { align: 'center' })
    y += 25

    const months   = data.months || []
    const colWidth = months.length > 0 ? Math.min(80, (doc.page.width - 180) / months.length) : 80
    const labelCol = 160
    const startX   = 40

    // ── Cabecera de columnas ─────────────────────────────────────
    doc.rect(startX, y, doc.page.width - 80, 20).fill(BLUE)
    doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
    doc.text('Concepto', startX + 5, y + 6, { width: labelCol })
    months.forEach((m, i) => {
      doc.text(m.name.substring(0, 3).toUpperCase(),
        startX + labelCol + i * colWidth, y + 6,
        { width: colWidth, align: 'right' })
    })
    if (months.length > 1) {
      doc.text('TOTAL', startX + labelCol + months.length * colWidth, y + 6,
        { width: 70, align: 'right' })
    }
    y += 22

    // ── Secciones ────────────────────────────────────────────────
    const drawSection = (section, color) => {
      doc.rect(startX, y, doc.page.width - 80, 18).fill(color + '22')
      doc.fillColor(color).fontSize(9).font('Helvetica-Bold')
      doc.text(section.name, startX + 5, y + 5, { width: labelCol })
      y += 20

      section.costClasses.forEach((cc, rowIdx) => {
        if (y > doc.page.height - 80) { doc.addPage(); y = 40 }
        if (rowIdx % 2 === 0) doc.rect(startX, y, doc.page.width - 80, 16).fill(LIGHT)
        doc.fillColor(BLACK).fontSize(8).font('Helvetica')
        doc.text(`  ${cc.name}`, startX + 5, y + 4, { width: labelCol - 10 })
        cc.months.forEach((amt, i) => {
          doc.text(fmt(amt), startX + labelCol + i * colWidth, y + 4,
            { width: colWidth, align: 'right' })
        })
        if (months.length > 1) {
          doc.text(fmt(cc.total), startX + labelCol + months.length * colWidth, y + 4,
            { width: 70, align: 'right' })
        }
        y += 16
      })

      doc.rect(startX, y, doc.page.width - 80, 18).fill(color + '33')
      doc.fillColor(color).fontSize(9).font('Helvetica-Bold')
      doc.text(`Total ${section.name}`, startX + 5, y + 5, { width: labelCol })
      section.totals.forEach((amt, i) => {
        doc.text(fmt(amt), startX + labelCol + i * colWidth, y + 5,
          { width: colWidth, align: 'right' })
      })
      if (months.length > 1) {
        doc.text(fmt(section.grandTotal),
          startX + labelCol + months.length * colWidth, y + 5,
          { width: 70, align: 'right' })
      }
      y += 22
    }

    const drawSummaryRow = (label, values, grandTotal, color, bold = false) => {
      if (y > doc.page.height - 80) { doc.addPage(); y = 40 }
      doc.rect(startX, y, doc.page.width - 80, 18).fill(color)
      doc.fillColor(bold ? 'white' : BLACK).fontSize(9).font(bold ? 'Helvetica-Bold' : 'Helvetica')
      doc.text(label, startX + 5, y + 5, { width: labelCol })
      values.forEach((val, i) => {
        doc.fillColor(bold ? 'white' : (val >= 0 ? BLACK : RED))
        doc.text(fmt(val), startX + labelCol + i * colWidth, y + 5,
          { width: colWidth, align: 'right' })
      })
      if (months.length > 1) {
        const total = grandTotal ?? values.reduce((s, v) => s + v, 0)
        doc.fillColor(bold ? 'white' : (total >= 0 ? BLACK : RED))
        doc.text(fmt(total), startX + labelCol + months.length * colWidth, y + 5,
          { width: 70, align: 'right' })
      }
      y += 22
    }

    const colors = {
      ingreso:         GREEN,
      costo_directo:   '#d97706',
      gasto_operativo: '#dc2626',
      otros:           GRAY
    }
    ;(data.sections || []).forEach(section => {
      drawSection(section, colors[section.type] || GRAY)
      y += 4
    })

    y += 6
    const s = data.summary || {}
    if (s.margenBruto?.length > 0) {
      drawSummaryRow('MARGEN BRUTO', s.margenBruto,
        s.margenBruto.reduce((a, b) => a + b, 0), '#d1fae5')
    }
    if (s.utilidadOperativa?.length > 0) {
      drawSummaryRow('UTILIDAD OPERATIVA', s.utilidadOperativa,
        s.utilidadOperativa.reduce((a, b) => a + b, 0), BLUE, true)
    }

    // ── Pie de página ────────────────────────────────────────────
    doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill(BLUE)
    doc.fillColor('white').fontSize(8).font('Helvetica')
    doc.text('© 2026 Ledgerly — Sistema de Gestión Financiera para MiPymes',
      40, doc.page.height - 18, { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Error en getIncomeStatementPDF:', error)
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF'
    })
  }
}

export default { getIncomeStatement, getIncomeStatementPDF }