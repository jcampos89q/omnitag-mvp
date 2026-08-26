import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug } = await params

  // Buscar la vCard en la base de datos de forma segura
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!vcard) {
    return new NextResponse('vCard not found', { status: 404 })
  }

  // Desestructurar datos de la DB
  const { first_name, last_name, job_title, company_name, contact_info } = vcard
  const phone = contact_info?.phone || ''
  const email = contact_info?.email || ''

  // Generar contenido del archivo .vcf (vCard format 3.0)
  const vcfContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${last_name || ''};${first_name || ''};;;`,
    `FN:${first_name || ''} ${last_name || ''}`.trim(),
    job_title ? `TITLE:${job_title}` : '',
    company_name ? `ORG:${company_name}` : '',
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    email ? `EMAIL;TYPE=WORK,INTERNET:${email}` : '',
    `URL:https://${request.headers.get('host')}/v/${slug}`,
    'END:VCARD'
  ].filter(Boolean).join('\n')

  // Retornar la respuesta como un archivo descargable
  return new NextResponse(vcfContent, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${first_name}_${last_name || 'contact'}.vcf"`
    }
  })
}
