const IG_API_BASE = 'https://graph.facebook.com/v19.0'

function getCredentials() {
  const accountId = process.env.META_IG_ACCOUNT_ID
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!accountId || !token) {
    throw new Error('META_IG_ACCOUNT_ID and META_PAGE_ACCESS_TOKEN must be set')
  }
  return { accountId, token }
}

async function createMediaContainer(imageUrl: string, caption: string): Promise<string> {
  const { accountId, token } = getCredentials()
  const res = await fetch(`${IG_API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  })
  const data = await res.json() as { id?: string; error?: { message: string } }
  if (!data.id) {
    throw new Error(`Media container creation failed: ${data.error?.message ?? JSON.stringify(data)}`)
  }
  return data.id
}

async function publishContainer(containerId: string): Promise<string> {
  const { accountId, token } = getCredentials()
  const res = await fetch(`${IG_API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: token }),
  })
  const data = await res.json() as { id?: string; error?: { message: string } }
  if (!data.id) {
    throw new Error(`Media publish failed: ${data.error?.message ?? JSON.stringify(data)}`)
  }
  return data.id
}

export async function publishInstagramPost({
  imageUrl,
  caption,
}: {
  imageUrl: string
  caption: string
}): Promise<string> {
  const containerId = await createMediaContainer(imageUrl, caption)
  // Meta requires a short delay between container creation and publishing
  await new Promise(r => setTimeout(r, 3000))
  return publishContainer(containerId)
}
