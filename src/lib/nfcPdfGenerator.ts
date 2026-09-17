import jsPDF from 'jspdf'
import QRCodeStyling from 'qr-code-styling'

interface NfcCard {
  id: string
  card_token: string
  status: string
  plan_duration_days: number
}

interface NfcBatch {
  id: string
  batch_name: string
  qr_style?: {
    dotsColor?: string
    cornersColor?: string
    dotsStyle?: any
    cornersStyle?: any
  }
  nfc_cards: NfcCard[]
}

// Convertir imagen pública a Base64 para jsPDF
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('No se pudo cargar el logo para PDF:', err)
    return null
  }
}

// Generar imagen DataURL de QR de alta resolución con qr-code-styling
async function generateQrDataUrl(
  url: string, 
  qrStyle?: { dotsColor?: string; cornersColor?: string; dotsStyle?: any; cornersStyle?: any }
): Promise<string> {
  const qr = new QRCodeStyling({
    width: 600,
    height: 600,
    data: url,
    dotsOptions: {
      color: qrStyle?.dotsColor || '#000000',
      type: qrStyle?.dotsStyle || 'rounded'
    },
    cornersSquareOptions: {
      color: qrStyle?.cornersColor || '#000000',
      type: qrStyle?.cornersStyle || 'extra-rounded'
    },
    cornersDotOptions: {
      color: qrStyle?.cornersColor || '#000000'
    },
    backgroundOptions: {
      color: '#ffffff'
    }
  })

  // Obtener raw blob
  const rawBlob = await qr.getRawData('png')
  if (!rawBlob) return ''

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(rawBlob as Blob)
  })
}

/**
 * Genera y descarga un PDF en tamaño A4 con las tarjetas listas para imprimir en vinil adhesivo
 * Tamaño estándar de tarjeta CR80: 85.6 mm x 53.98 mm (usamos 85.6 x 54 mm)
 * En una hoja A4 (210 x 297 mm), caben 8 tarjetas por página (2 columnas x 4 filas)
 * con márgenes laterales de 13.4mm y espaciado cómodo con guías de corte.
 */
export async function generateNfcCardsSheetPdf(
  batch: NfcBatch, 
  baseUrl: string,
  onProgress?: (current: number, total: number) => void
) {
  // Dimensiones estándar A4 (mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const cardW = 85.6
  const cardH = 54.0
  const marginX = 13.4
  const marginY = 22.0
  const gapX = 11.0
  const gapY = 8.5
  const cardsPerPage = 8

  // Cargar el isotipo / logo OmniTag para fondo negro en base64
  const logoDataUrl = await getBase64ImageFromUrl('/logo-dark.png')

  const totalCards = batch.nfc_cards.length
  
  for (let index = 0; index < totalCards; index++) {
    const card = batch.nfc_cards[index]
    if (onProgress) onProgress(index + 1, totalCards)

    const pageCardIndex = index % cardsPerPage
    
    // Si no es la primera tarjeta y es el inicio de una página nueva
    if (index > 0 && pageCardIndex === 0) {
      doc.addPage('a4', 'portrait')
    }

    const col = pageCardIndex % 2
    const row = Math.floor(pageCardIndex / 2)

    const x = marginX + col * (cardW + gapX)
    const y = marginY + row * (cardH + gapY)

    // Si es la primera tarjeta de la página, dibujamos encabezado técnico fuera del área de corte
    if (pageCardIndex === 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(140, 140, 140)
      doc.text(
        'OMNITAG TECH - PLANTILLA DE IMPRESION VINIL CR80 (85.6 x 54 mm) | LOTE: ' + batch.batch_name.toUpperCase(),
        marginX,
        12
      )
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      const curPage = Math.floor(index / cardsPerPage) + 1
      const totPages = Math.ceil(totalCards / cardsPerPage)
      doc.text(
        'Hoja ' + curPage + ' de ' + totPages + ' - Imprimir en Escala 100% (Sin Ajustar / Tamano Real)',
        marginX,
        16
      )
    }

    // 1. Marcas / Guías de corte externas (Crop Marks finas)
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.15)
    const markLen = 3
    // Arriba-Izquierda
    doc.line(x - markLen, y, x, y)
    doc.line(x, y - markLen, x, y)
    // Arriba-Derecha
    doc.line(x + cardW, y, x + cardW + markLen, y)
    doc.line(x + cardW, y - markLen, x + cardW, y)
    // Abajo-Izquierda
    doc.line(x - markLen, y + cardH, x, y + cardH)
    doc.line(x, y + cardH, x, y + cardH + markLen)
    // Abajo-Derecha
    doc.line(x + cardW, y + cardH, x + cardW + markLen, y + cardH)
    doc.line(x + cardW, y + cardH, x + cardW, y + cardH + markLen)

    // 2. Fondo Negro Mate Elegante de la Tarjeta con bordes redondeados (radio 3.18mm)
    doc.setFillColor(15, 15, 18)
    doc.roundedRect(x, y, cardW, cardH, 3.18, 3.18, 'F')

    // Borde muy sutil para delimitar en corte
    doc.setDrawColor(45, 45, 52)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, cardW, cardH, 3.18, 3.18, 'D')

    // 3. Destello de Acento Tecnológico (Línea morada superior)
    doc.setFillColor(139, 92, 246)
    doc.rect(x + 12, y, cardW - 24, 0.7, 'F')

    // 4. Logo OmniTag / Isotipo en la izquierda
    const logoX = x + 7
    const logoY = y + 7
    const logoSize = 14

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize)
      } catch (e) {
        doc.setFillColor(0, 0, 0)
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, 'F')
      }
    }

    // 5. Textos de Marca (OmniTag)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('OMNITAG', logoX + logoSize + 3, logoY + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(168, 168, 180)
    doc.text('SMART BUSINESS CARD', logoX + logoSize + 3, logoY + 11.5)

    // Indicador NFC Contactless Iconográfico
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(167, 139, 250) // Morado suave tecnológico
    doc.text('((( NFC CONTACTLESS )))', logoX, y + 30)

    // Instrucción sutil y elegante
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(140, 140, 155)
    doc.text('Acerca tu teléfono a la tarjeta', logoX, y + 36)
    doc.text('o escanea el código QR directo', logoX, y + 39.5)

    // 6. CÓDIGO QR HD ENMARCADO (Lado derecho de la tarjeta)
    const cardFullUrl = baseUrl + '/t/' + card.card_token
    const qrDataUrl = await generateQrDataUrl(cardFullUrl, batch.qr_style)

    const qrContainerX = x + cardW - 35
    const qrContainerY = y + 8.5
    const qrContainerSize = 28

    // Marco blanco elegante con bordes redondeados para el QR
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 2.5, 2.5, 'F')

    // Estampado de la imagen del código QR
    if (qrDataUrl) {
      doc.addImage(
        qrDataUrl, 
        'PNG', 
        qrContainerX + 1.2, 
        qrContainerY + 1.2, 
        qrContainerSize - 2.4, 
        qrContainerSize - 2.4
      )
    }

    // 7. IDENTIFICADOR DISCRETO DE LA TARJETA (Debajo del QR, centrado y sobrio)
    doc.setFont('courier', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(180, 180, 195) // Gris plata elegante y discreto
    const textWidth = doc.getTextWidth(card.card_token)
    const tokenCenterX = qrContainerX + (qrContainerSize - textWidth) / 2
    doc.text(card.card_token, tokenCenterX, qrContainerY + qrContainerSize + 5.5)
  }

  // Descargar el archivo PDF automáticamente
  const cleanName = batch.batch_name.replace(/\s+/g, '_')
  const filename = 'Plantilla_Vinil_' + cleanName + '_A4.pdf'
  doc.save(filename)
}

// Helper para dibujar estrellas doradas vectoriales perfectas
function drawGoldStar(doc: jsPDF, cx: number, cy: number, outerRadius = 3.2, innerRadius = 1.6) {
  let rot = Math.PI / 2 * 3
  const step = Math.PI / 5
  const pts: [number, number][] = []
  let startX = 0
  let startY = 0
  let prevX = 0
  let prevY = 0

  for (let i = 0; i < 5; i++) {
    let x = cx + Math.cos(rot) * outerRadius
    let y = cy + Math.sin(rot) * outerRadius
    if (i === 0) {
      startX = x
      startY = y
      prevX = x
      prevY = y
    } else {
      pts.push([x - prevX, y - prevY])
      prevX = x
      prevY = y
    }
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    pts.push([x - prevX, y - prevY])
    prevX = x
    prevY = y
    rot += step
  }

  doc.setFillColor(245, 158, 11) // Dorado Google Amber
  doc.lines(pts, startX, startY, [1, 1], 'F', true)
}

/**
 * Genera y descarga un PDF en tamaño A4 con Plantillas para Stands / Mostradores Acrílicos
 * de Reseñas de Google (2 displays grandes de 120 x 126 mm por página A4)
 */
export async function generateReviewPlatesSheetPdf(
  batch: NfcBatch,
  baseUrl: string,
  onProgress?: (current: number, total: number) => void
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const standW = 120.0
  const standH = 126.0
  const marginX = (210.0 - standW) / 2 // 45mm
  const marginY = 14.0
  const gapY = 14.0
  const standsPerPage = 2

  // Cargar el isotipo / logo OmniTag para fondo blanco en base64
  const logoLightDataUrl = await getBase64ImageFromUrl('/logo-light.png')

  const totalCards = batch.nfc_cards.length

  for (let index = 0; index < totalCards; index++) {
    const card = batch.nfc_cards[index]
    if (onProgress) onProgress(index + 1, totalCards)

    const pageIndex = index % standsPerPage

    if (index > 0 && pageIndex === 0) {
      doc.addPage('a4', 'portrait')
    }

    const x = marginX
    const y = marginY + pageIndex * (standH + gapY)

    // Encabezado técnico fuera del área de corte en la primera posición de la página
    if (pageIndex === 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(140, 140, 140)
      doc.text(
        'OMNITAG REVIEW PLATES - PLANTILLA STAND MOSTRADOR (120 x 126 mm) | LOTE: ' + batch.batch_name.toUpperCase(),
        14,
        8
      )
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      const curPage = Math.floor(index / standsPerPage) + 1
      const totPages = Math.ceil(totalCards / standsPerPage)
      doc.text(
        'Hoja ' + curPage + ' de ' + totPages + ' - Imprimir al 100% (Tamano Real) para acrilicos de mostrador',
        14,
        11.5
      )
    }

    // 1. Guías de corte externas (Crop Marks)
    doc.setDrawColor(180, 180, 190)
    doc.setLineWidth(0.15)
    const markLen = 4

    // Arriba-Izquierda
    doc.line(x - markLen, y, x, y)
    doc.line(x, y - markLen, x, y)
    // Arriba-Derecha
    doc.line(x + standW, y, x + standW + markLen, y)
    doc.line(x + standW, y - markLen, x + standW, y)
    // Abajo-Izquierda
    doc.line(x - markLen, y + standH, x, y + standH)
    doc.line(x, y + standH, x, y + standH + markLen)
    // Abajo-Derecha
    doc.line(x + standW, y + standH, x + standW + markLen, y + standH)
    doc.line(x + standW, y + standH, x + standW, y + standH + markLen)

    // 2. Fondo Blanco Puro con borde sutil para display acrílico
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, y, standW, standH, 4, 4, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.4)
    doc.roundedRect(x, y, standW, standH, 4, 4, 'D')

    // Borde decorativo interior fino
    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.2)
    doc.roundedRect(x + 3, y + 3, standW - 6, standH - 6, 3, 3, 'D')

    // 3. 5 Estrellas Doradas Vectoriales Centradas
    const starsY = y + 13
    const starOffsets = [-16, -8, 0, 8, 16]
    starOffsets.forEach(offset => {
      drawGoldStar(doc, x + standW / 2 + offset, starsY, 3.4, 1.7)
    })

    // 4. Título Principal
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13.5)
    doc.setTextColor(17, 24, 39) // Gray 900
    const titleText = 'CALIFICANOS EN GOOGLE'
    const titleW = doc.getTextWidth(titleText)
    doc.text(titleText, x + (standW - titleW) / 2, y + 23)

    // Subtítulo
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139) // Slate 500
    const subtitleText = 'Tu calificacion y comentarios nos ayudan a seguir creciendo'
    const subW = doc.getTextWidth(subtitleText)
    doc.text(subtitleText, x + (standW - subW) / 2, y + 28)

    // 5. Código QR HD de Mostrador
    const plateUrl = baseUrl + '/r/' + card.card_token
    const qrDataUrl = await generateQrDataUrl(plateUrl, batch.qr_style)
    const qrSize = 46.0
    const qrX = x + (standW - qrSize) / 2
    const qrY = y + 33.0

    // Marco blanco con sombra sutil para el QR
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, 'D')

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    }

    // 6. Sección de Interacción NFC Contactless
    const nfcY = y + 87.0

    // Badge Contactless
    doc.setFillColor(254, 243, 199) // Amber 100
    doc.setDrawColor(245, 158, 11) // Amber 500
    doc.setLineWidth(0.2)
    doc.roundedRect(x + (standW - 54) / 2, nfcY - 3.5, 54, 5.5, 2.5, 2.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(180, 83, 9) // Amber 700
    const nfcBadgeText = '((( CONTACTLESS NFC )))'
    const nfcBadgeW = doc.getTextWidth(nfcBadgeText)
    doc.text(nfcBadgeText, x + (standW - nfcBadgeW) / 2, nfcY)

    // Instrucción para el cliente
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(15, 23, 42) // Slate 900
    const inst1 = 'Acerca tu telefono celular aqui'
    const inst1W = doc.getTextWidth(inst1)
    doc.text(inst1, x + (standW - inst1W) / 2, nfcY + 7.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    const inst2 = 'o abre la camara y escanea el codigo QR'
    const inst2W = doc.getTextWidth(inst2)
    doc.text(inst2, x + (standW - inst2W) / 2, nfcY + 11.5)

    // 7. Línea Separadora y Pie de Placa
    const lineY = y + 107.0
    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.3)
    doc.line(x + 10, lineY, x + standW - 10, lineY)

    // Identificador de Placa
    doc.setFont('courier', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    doc.text(card.card_token, x + 10, lineY + 6)

    // Enlace corto
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(148, 163, 184)
    const urlClean = (baseUrl + '/r/' + card.card_token).replace('https://', '')
    const urlW = doc.getTextWidth(urlClean)
    doc.text(urlClean, x + standW - 10 - urlW, lineY + 6)

    // Marca de agua de OmniTag con isotipo oficial para fondo blanco
    const brandLogoSize = 5.0
    const brandText = 'OMNITAG SMART PLATES'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.0)
    doc.setTextColor(148, 163, 184)
    const brandW = doc.getTextWidth(brandText)
    const brandTotalW = brandW + (logoLightDataUrl ? brandLogoSize + 2 : 0)
    const brandStartX = x + (standW - brandTotalW) / 2

    if (logoLightDataUrl) {
      try {
        doc.addImage(logoLightDataUrl, 'PNG', brandStartX, lineY + 9.5, brandLogoSize, brandLogoSize)
      } catch (e) {
        // fallback
      }
    }
    doc.text(brandText, brandStartX + (logoLightDataUrl ? brandLogoSize + 2 : 0), lineY + 13.2)
  }

  const cleanName = batch.batch_name.replace(/\s+/g, '_')
  const filename = 'Plantilla_Mostrador_Resenas_' + cleanName + '_A4.pdf'
  doc.save(filename)
}
