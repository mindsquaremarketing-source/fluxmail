'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

// Extract product info from email HTML
function extractProductInfo(html: string): { image: string; title: string; price: string; url: string } | null {
  if (!html) return null
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const allLinks = doc.querySelectorAll('a')
  for (const link of Array.from(allLinks)) {
    const linkText = (link.textContent || '').trim().toLowerCase()
    if (linkText === 'shop now' || linkText === 'shop now →') {
      const container = link.closest('td') || link.closest('div')
      if (!container) continue

      let image = ''
      const imgs = container.querySelectorAll('img')
      for (const img of Array.from(imgs)) {
        const style = img.getAttribute('style') || ''
        if (style.includes('max-width') || style.includes('border-radius') || style.includes('width:100%')) {
          image = img.getAttribute('src') || ''
          break
        }
      }

      const h3 = container.querySelector('h3')
      const title = h3?.textContent || ''

      let price = ''
      const ps = container.querySelectorAll('p')
      for (const p of Array.from(ps)) {
        const text = (p.textContent || '').trim()
        const style = p.getAttribute('style') || ''
        if (text.includes('$') || ((style.includes('font-weight:bold') || style.includes('font-weight: bold')) && text.length < 30)) {
          price = text
          break
        }
      }

      const url = (link as HTMLAnchorElement).getAttribute('href') || '#'
      return { image, title, price, url }
    }
  }
  return null
}

// Identify which elements belong to the product section
function getProductElements(doc: Document): Set<Element> {
  const skipElements = new Set<Element>()
  const allLinks = doc.querySelectorAll('a')
  allLinks.forEach(link => {
    const linkText = (link.textContent || '').trim().toLowerCase()
    if (linkText === 'shop now' || linkText === 'shop now →') {
      const container = link.closest('td') || link.closest('div')
      if (container) {
        skipElements.add(link)
        container.querySelectorAll('img').forEach(img => {
          const style = img.getAttribute('style') || ''
          if (style.includes('max-width') || style.includes('border-radius') || style.includes('width:100%')) {
            skipElements.add(img)
          }
        })
        container.querySelectorAll('h3').forEach(h3 => skipElements.add(h3))
        container.querySelectorAll('p').forEach(p => {
          const text = (p.textContent || '').trim()
          const style = p.getAttribute('style') || ''
          if (text.includes('$') || ((style.includes('font-weight:bold') || style.includes('font-weight: bold')) && text.length < 30)) {
            skipElements.add(p)
          }
        })
      }
    }
  })
  return skipElements
}

// Parse email HTML into Editor.js blocks in document order, returning product position
function htmlToBlocks(html: string): { blocks: any[]; productIndex: number } {
  if (!html) return { blocks: [], productIndex: -1 }
  const blocks: any[] = []
  let productIndex = -1
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const skipElements = getProductElements(doc)

  // Find the first "Shop Now" link to identify the product container
  let productContainer: Element | null = null
  const allLinks = doc.querySelectorAll('a')
  for (const link of Array.from(allLinks)) {
    const linkText = (link.textContent || '').trim().toLowerCase()
    if (linkText === 'shop now' || linkText === 'shop now →') {
      productContainer = link.closest('td') || link.closest('div')
      break
    }
  }

  // Walk all relevant elements in document order
  const allElements = doc.querySelectorAll('h1, h2, h3, p, img, hr, ul, ol, a[style*="inline-block"]')
  let productInserted = false

  allElements.forEach(el => {
    // Check if this element is inside or IS the product container — insert product marker at this position
    if (productContainer && !productInserted) {
      if (skipElements.has(el) || productContainer.contains(el)) {
        productIndex = blocks.length
        productInserted = true
        return
      }
    }

    if (skipElements.has(el)) return

    const tag = el.tagName.toLowerCase()
    const text = (el.textContent || '').trim()
    if (!text && tag !== 'img' && tag !== 'hr') return

    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'header', data: { text, level: tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3 } })
    } else if (tag === 'p') {
      if (text.length > 2) {
        blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'paragraph', data: { text: el.innerHTML } })
      }
    } else if (tag === 'img') {
      const src = (el as HTMLImageElement).src
      if (src && !src.includes('track') && (el as HTMLImageElement).width !== 1) {
        blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'image', data: { file: { url: src }, caption: (el as HTMLImageElement).alt || '' } })
      }
    } else if (tag === 'hr') {
      blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'delimiter', data: {} })
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '')
      if (items.length > 0) {
        blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'list', data: { style: tag === 'ol' ? 'ordered' : 'unordered', items } })
      }
    } else if (tag === 'a') {
      blocks.push({ id: Math.random().toString(36).slice(2, 10), type: 'paragraph', data: { text: `<a href="${(el as HTMLAnchorElement).href}">${text}</a>` } })
    }
  })

  if (blocks.length === 0) {
    blocks.push({ id: 'fallback', type: 'paragraph', data: { text: 'Edit your email content here...' } })
  }

  return { blocks, productIndex }
}

// Convert Editor.js blocks to email-safe inline-styled HTML
function blocksToEmailHtml(blocks: any[], primaryColor: string): string {
  let body = ''

  for (const block of blocks) {
    switch (block.type) {
      case 'header':
        const fontSize = block.data.level === 1 ? '28px' : block.data.level === 2 ? '22px' : '18px'
        body += `<h${block.data.level} style="color:#111827;font-size:${fontSize};font-weight:800;margin:0 0 12px;line-height:1.3;">${block.data.text}</h${block.data.level}>`
        break
      case 'paragraph':
        body += `<p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 16px;">${block.data.text}</p>`
        break
      case 'image':
        if (block.data.file?.url) {
          body += `<div style="text-align:center;margin:0 0 16px;"><img src="${block.data.file.url}" alt="${block.data.caption || ''}" style="width:100%;max-width:100%;height:auto;display:block;border-radius:12px;margin:0 auto;" /></div>`
        }
        break
      case 'delimiter':
        body += `<hr style="border:none;border-top:2px solid #E5E7EB;margin:24px 0;" />`
        break
      case 'list':
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul'
        const items = (block.data.items || []).map((item: string) =>
          `<li style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 6px;">${item}</li>`
        ).join('')
        body += `<${tag} style="padding-left:24px;margin:0 0 16px;">${items}</${tag}>`
        break
    }
  }

  return body
}

// Swap product in full email HTML
function swapProductInHtml(html: string, product: any): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const image = product.images?.[0]?.src || ''
  const title = product.title || ''
  const price = product.variants?.[0]?.price ? `$${product.variants[0].price}` : ''
  const url = product.handle ? `/products/${product.handle}` : '#'

  const imgs = doc.querySelectorAll('img')
  const productImgs = Array.from(imgs).filter(img => {
    const w = img.getAttribute('width')
    if (w === '1' || (img.src || '').includes('track')) return false
    const parentTd = img.closest('td')
    if (parentTd?.getAttribute('style')?.includes('background:')) return false
    const style = img.getAttribute('style') || ''
    return style.includes('max-width') || style.includes('border-radius') || style.includes('width:100%')
  })

  const firstImg = productImgs[0]
  if (firstImg && image) {
    firstImg.src = image
    firstImg.alt = title
  }

  const headings = doc.querySelectorAll('h3')
  if (headings.length > 0) {
    const productHeading = headings[headings.length > 1 ? headings.length - 1 : 0]
    if (productHeading) productHeading.textContent = title
  }

  const allPs = doc.querySelectorAll('p')
  for (const p of Array.from(allPs)) {
    const text = p.textContent || ''
    const style = p.getAttribute('style') || ''
    if ((text.includes('$') || (style.includes('font-weight:bold') || style.includes('font-weight: bold'))) && text.length < 30) {
      if (price) p.textContent = price
      break
    }
  }

  const allLinks = doc.querySelectorAll('a')
  for (const link of Array.from(allLinks)) {
    const linkText = (link.textContent || '').trim().toLowerCase()
    if (linkText === 'shop now' || linkText === 'shop now →') {
      link.setAttribute('href', url)
      break
    }
  }

  return doc.documentElement.outerHTML
}

interface Props {
  initialHtml: string
  primaryColor: string
  onHtmlChange: (html: string) => void
  products?: any[]
}

export default function EmailBlockEditor({ initialHtml, primaryColor, onHtmlChange, products = [] }: Props) {
  const editorRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const htmlRef = useRef(initialHtml)
  const productIndexRef = useRef(-1)
  const portalContainerRef = useRef<HTMLDivElement | null>(null)

  const [productInfo, setProductInfo] = useState(() => extractProductInfo(initialHtml))
  const [portalReady, setPortalReady] = useState(false)

  const detectCurrentProductId = (): string => {
    if (!productInfo || products.length === 0) return ''
    const lower = (productInfo.title || '').toLowerCase()
    for (const p of products) {
      if (p.title && p.title.toLowerCase() === lower) return p.id.toString()
    }
    return ''
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value
    if (!productId) return
    const product = products.find(p => p.id.toString() === productId)
    if (!product) return
    const newHtml = swapProductInHtml(htmlRef.current, product)
    htmlRef.current = newHtml
    setProductInfo(extractProductInfo(newHtml))
    onHtmlChange(newHtml)
  }

  const handleChange = useCallback(async () => {
    if (!editorRef.current) return
    try {
      const data = await editorRef.current.save()
      const contentHtml = blocksToEmailHtml(data.blocks, primaryColor)

      const currentDoc = new DOMParser().parseFromString(htmlRef.current, 'text/html')
      let productSectionHtml = ''
      const allLinks = currentDoc.querySelectorAll('a')
      for (const link of Array.from(allLinks)) {
        const linkText = (link.textContent || '').trim().toLowerCase()
        if (linkText === 'shop now' || linkText === 'shop now →') {
          const container = link.closest('td') || link.closest('div')
          if (container) {
            productSectionHtml = container.innerHTML
            break
          }
        }
      }

      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
<tr><td style="background:${primaryColor};padding:28px 40px;text-align:center;">
<span style="color:#fff;font-size:24px;font-weight:900;">Email Preview</span>
</td></tr>
<tr><td style="padding:40px 48px;">
${contentHtml}
${productSectionHtml ? `<div style="text-align:center;padding:20px 0;">${productSectionHtml}</div>` : ''}
</td></tr>
<tr><td style="background:#111827;padding:28px 40px;text-align:center;">
<p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 6px;">Your Store</p>
<a href="{{UNSUBSCRIBE_URL}}" style="color:#9CA3AF;font-size:12px;">Unsubscribe</a>
</td></tr>
</table></td></tr></table></body></html>`

      htmlRef.current = fullHtml
      onHtmlChange(fullHtml)
    } catch {}
  }, [primaryColor, onHtmlChange])

  // Insert portal container at the correct position among Editor.js blocks
  const insertPortalAtPosition = useCallback(() => {
    if (!holderRef.current || productIndexRef.current < 0) return

    // Remove existing portal container if any
    if (portalContainerRef.current) {
      portalContainerRef.current.remove()
      portalContainerRef.current = null
    }

    const redactor = holderRef.current.querySelector('.codex-editor__redactor')
    if (!redactor) return

    const ceBlocks = redactor.querySelectorAll(':scope > .ce-block')
    const container = document.createElement('div')
    container.className = 'product-card-portal'

    if (productIndexRef.current < ceBlocks.length) {
      ceBlocks[productIndexRef.current].before(container)
    } else {
      redactor.appendChild(container)
    }

    portalContainerRef.current = container
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (initializedRef.current || !holderRef.current) return
    initializedRef.current = true

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default
      const Header = (await import('@editorjs/header')).default
      const Paragraph = (await import('@editorjs/paragraph')).default
      const ImageTool = (await import('@editorjs/image')).default
      const Delimiter = (await import('@editorjs/delimiter')).default
      const List = (await import('@editorjs/list')).default

      const { blocks, productIndex } = htmlToBlocks(initialHtml)
      productIndexRef.current = productIndex

      editorRef.current = new EditorJS({
        holder: holderRef.current!,
        tools: {
          header: { class: Header, config: { levels: [1, 2, 3], defaultLevel: 2 } },
          paragraph: { class: Paragraph },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByUrl: async (url: string) => ({ success: 1, file: { url } }),
                uploadByFile: async () => ({ success: 0 }),
              }
            }
          },
          delimiter: Delimiter,
          list: List,
        },
        data: { blocks },
        onChange: handleChange,
        placeholder: 'Start editing your email...',
        minHeight: 200,
        onReady: () => {
          // Insert portal container once Editor.js has rendered all blocks
          setTimeout(insertPortalAtPosition, 50)
        },
      })
    }

    initEditor()

    return () => {
      if (portalContainerRef.current) {
        portalContainerRef.current.remove()
        portalContainerRef.current = null
      }
      if (editorRef.current?.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
        initializedRef.current = false
      }
      setPortalReady(false)
    }
  }, [initialHtml, handleChange, insertPortalAtPosition])

  const currentProductId = detectCurrentProductId()

  const productCard = productInfo ? (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 my-2">
      <p className="text-xs text-gray-400 font-medium mb-2">{'\uD83D\uDECD\uFE0F'} Product Block</p>
      <div className="flex items-center gap-3 mb-3">
        {productInfo.image ? (
          <img
            src={productInfo.image}
            alt={productInfo.title}
            className="w-[60px] h-[60px] rounded-lg object-cover border border-gray-200 flex-shrink-0"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{productInfo.title || 'Product'}</p>
          {productInfo.price && (
            <p className="text-sm font-bold text-blue-700">{productInfo.price}</p>
          )}
        </div>
      </div>
      {products.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Change Product</label>
          <select
            onChange={handleProductChange}
            value={currentProductId}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          >
            <option value="" disabled>Select a product...</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id.toString()}>
                {p.title}{p.variants?.[0]?.price ? ` — $${p.variants[0].price}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Edit Content</p>
        <p className="text-xs text-gray-400 mt-0.5">Changes update the preview in real time</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div ref={holderRef} className="prose prose-sm max-w-none" />
      </div>
      {/* Portal: render product card at the correct position inside Editor.js block list */}
      {portalReady && portalContainerRef.current && productCard && createPortal(productCard, portalContainerRef.current)}
    </div>
  )
}
