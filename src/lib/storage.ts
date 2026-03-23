import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadLogoToStorage(
  base64Data: string,
  storeId: string
): Promise<string> {
  const base64 = base64Data.split(',')[1]
  const mimeType = base64Data.split(';')[0].split(':')[1]
  const extension = mimeType.split('/')[1] || 'png'
  const buffer = Buffer.from(base64, 'base64')

  const fileName = `logos/${storeId}.${extension}`

  const { error } = await supabase.storage
    .from('fluxmail-assets')
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage
    .from('fluxmail-assets')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
