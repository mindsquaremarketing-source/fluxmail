'use client'
import { useEffect, useRef, useCallback } from 'react'

// Parse email HTML into Editor.js blocks
function htmlToBlocks(html: string): any[] {
  if (!html) return []
  const blocks: any[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract meaningful content from email tables
  const allElements = doc.querySelectorAll('h1, h2, h3, p, img, hr, ul, ol, a[style*="inline-block"]')

  allElements.forEach(el => {
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

  return blocks
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

interface Props {
  initialHtml: string
  primaryColor: string
  onHtmlChange: (html: string) => void
}

export default function EmailBlockEditor({ initialHtml, primaryColor, onHtmlChange }: Props) {
  const editorRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const handleChange = useCallback(async () => {
    if (!editorRef.current) return
    try {
      const data = await editorRef.current.save()
      const contentHtml = blocksToEmailHtml(data.blocks, primaryColor)

      // Rebuild the full email wrapping the edited content
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
</td></tr>
<tr><td style="background:#111827;padding:28px 40px;text-align:center;">
<p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 6px;">Your Store</p>
<a href="{{UNSUBSCRIBE_URL}}" style="color:#9CA3AF;font-size:12px;">Unsubscribe</a>
</td></tr>
</table></td></tr></table></body></html>`

      onHtmlChange(fullHtml)
    } catch {}
  }, [primaryColor, onHtmlChange])

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

      const blocks = htmlToBlocks(initialHtml)

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
      })
    }

    initEditor()

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
        initializedRef.current = false
      }
    }
  }, [initialHtml, handleChange])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Edit Content</p>
        <p className="text-xs text-gray-400 mt-0.5">Changes update the preview in real time</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div ref={holderRef} className="prose prose-sm max-w-none" />
      </div>
    </div>
  )
}
