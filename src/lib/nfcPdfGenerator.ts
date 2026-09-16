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

  // Cargar el isotipo / logo OmniTag en base64
  const logoDataUrl = await getBase64ImageFromUrl('/omnitag-logo.jpg')

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
        doc.addImage(logoDataUrl, 'JPEG', logoX, logoY, logoSize, logoSize)
      } catch (e) {
        doc.setFillColor(0, 0, 0)
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, 'F')
      }
    }

    // 5. Textos de Marca (OmniTag)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text('OMNITAG', logoX + logoSize + 3, logoY + 6.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(168, 168, 180)
    doc.text('SMART BUSINESS CARD', logoX + logoSize + 3, logoY + 10.5)

    // Indicador NFC Contactless Iconográfico
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(147, 197, 253)
    doc.text('((( NFC CONTACTLESS )))', logoX, y + 26)

    // Instrucción sutil para el cliente
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(150, 150, 160)
    doc.text('Acerca al celular o', logoX, y + 31.5)
    doc.text('escanea el codigo QR', logoX, y + 34.5)

    // 6. CÓDIGO DE ACTIVACIÓN / TOKEN FÍSICO
    const tokenBoxY = y + 38.5
    doc.setFillColor(28, 28, 35)
    doc.roundedRect(logoX, tokenBoxY, 34, 10, 1.8, 1.8, 'F')
    doc.setDrawColor(60, 60, 75)
    doc.setLineWidth(0.2)
    doc.roundedRect(logoX, tokenBoxY, 34, 10, 1.8, 1.8, 'D')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(4.5)
    doc.setTextColor(156, 163, 175)
    doc.text('ID DE ACTIVACION / GESTION:', logoX + 2, tokenBoxY + 3.8)

    doc.setFont('courier', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    doc.text(card.card_token, logoX + 2, tokenBoxY + 8)

    // 7. CÓDIGO QR HD ENMARCADO (Lado derecho de la tarjeta)
    const cardFullUrl = baseUrl + '/t/' + card.card_token
    const qrDataUrl = await generateQrDataUrl(cardFullUrl, batch.qr_style)

    const qrContainerX = x + cardW - 35
    const qrContainerY = y + 9.5
    const qrContainerSize = 30

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

    // Pie de tarjeta sutil
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(4.5)
    doc.setTextColor(120, 120, 130)
    doc.text('1 ANO PRO INCLUIDO', qrContainerX + 5, y + 43.5)
  }

  // Descargar el archivo PDF automáticamente
  const cleanName = batch.batch_name.replace(/\s+/g, '_')
  const filename = 'Plantilla_Vinil_' + cleanName + '_A4.pdf'
  doc.save(filename)
}
