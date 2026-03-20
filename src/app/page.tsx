import { redirect } from 'next/navigation'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default function Home({ searchParams }: Props) {
  const shop = searchParams?.shop
  const host = searchParams?.host

  if (shop) {
    redirect(`/api/auth?shop=${shop}&host=${host || ''}`)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Fluxmail</h1>
      <p>Please install this app from your Shopify admin.</p>
    </div>
  )
}
