'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EmailBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'coupon' | 'product' | 'social' | 'navbar'
  content: any
  styles: any
}

const getDefaultContent = (type: string) => {
  switch (type) {
    case 'text': return { html: '<p style="text-align:center;">Add your text here</p>' }
    case 'button': return { text: 'Click Here', url: '#' }
    case 'image': return { src: 'https://via.placeholder.com/600x300/1E40AF/ffffff?text=Your+Image', alt: '' }
    case 'coupon': return { label: 'Use Code:', code: 'DISCOUNT10' }
    case 'spacer': return { height: '30px' }
    case 'divider': return {}
    case 'navbar': return { logoText: 'Fluxmail', logoColor: '#1E40AF' }
    case 'social': return { html: '<p style="text-align:center;font-size:12px;color:#999;">Follow us: Facebook | Instagram | Twitter</p>' }
    case 'product': return { name: 'Product Name', price: '$29.99', image: 'https://via.placeholder.com/200x200/eee/666?text=Product' }
    default: return {}
  }
}

const getDefaultStyles = (type: string) => {
  switch (type) {
    case 'navbar': return { backgroundColor: '#ffffff', padding: '20px' }
    case 'text': return { backgroundColor: '#ffffff', padding: '20px' }
    case 'button': return { backgroundColor: '#ffffff', padding: '20px', buttonColor: '#1E40AF', textColor: '#ffffff' }
    case 'image': return { backgroundColor: '#ffffff', padding: '0' }
    case 'coupon': return { backgroundColor: '#f9f9f9', padding: '30px 20px' }
    case 'divider': return { backgroundColor: '#ffffff', padding: '10px 20px' }
    case 'spacer': return { backgroundColor: '#ffffff', padding: '0' }
    case 'social': return { backgroundColor: '#f9fafb', padding: '20px' }
    case 'product': return { backgroundColor: '#ffffff', padding: '20px' }
    default: return { backgroundColor: '#ffffff', padding: '20px' }
  }
}

export default function EmailEditorPage() {
  const router = useRouter()

  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: '1',
      type: 'navbar',
      content: { logoText: 'Fluxmail', logoColor: '#1E40AF' },
      styles: { backgroundColor: '#ffffff', padding: '20px' },
    },
    {
      id: '2',
      type: 'text',
      content: { html: '<h1 style="text-align:center;color:#ffffff;margin:0 0 12px;">Welcome to Fluxmail!</h1><p style="text-align:center;color:rgba(255,255,255,0.9);margin:0;">Here\'s 10% Off your next order.</p>' },
      styles: { backgroundColor: '#1E40AF', padding: '40px 20px' },
    },
    {
      id: '3',
      type: 'coupon',
      content: { label: 'Use Code:', code: 'FW-WELCOME10' },
      styles: { backgroundColor: '#f9f9f9', padding: '30px 20px' },
    },
    {
      id: '4',
      type: 'button',
      content: { text: 'SHOP NOW', url: '#' },
      styles: { backgroundColor: '#ffffff', padding: '20px', buttonColor: '#1E40AF', textColor: '#ffffff' },
    },
  ])

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'element' | 'style' | 'layer'>('element')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  const addBlock = (type: string) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    setSelectedBlockId(null)
  }

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    const newBlock = { ...block, id: Date.now().toString(), content: { ...block.content }, styles: { ...block.styles } }
    const index = blocks.findIndex((b) => b.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const moveBlock = (id: string, dir: -1 | 1) => {
    const index = blocks.findIndex((b) => b.id === id)
    if (index + dir < 0 || index + dir >= blocks.length) return
    const newBlocks = [...blocks]
    const [item] = newBlocks.splice(index, 1)
    newBlocks.splice(index + dir, 0, item)
    setBlocks(newBlocks)
  }

  const renderBlockHTML = (block: EmailBlock): string => {
    switch (block.type) {
      case 'navbar':
        return `<div style="text-align:center"><span style="font-size:24px;font-weight:bold;color:${block.content.logoColor}">${block.content.logoText}</span></div>`
      case 'text':
        return block.content.html
      case 'button':
        return `<div style="text-align:center"><a href="${block.content.url}" style="display:inline-block;background:${block.styles.buttonColor || '#1E40AF'};color:${block.styles.textColor || '#fff'};padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px">${block.content.text}</a></div>`
      case 'coupon':
        return `<div style="text-align:center"><p style="color:#666;margin-bottom:8px">${block.content.label}</p><div style="display:inline-block;border:2px dashed #333;padding:10px 24px;font-weight:bold;font-size:18px;letter-spacing:2px">${block.content.code}</div></div>`
      case 'image':
        return `<div style="text-align:center"><img src="${block.content.src}" alt="${block.content.alt || ''}" style="max-width:100%;display:block" /></div>`
      case 'divider':
        return `<hr style="border:none;border-top:1px solid #eee;margin:0" />`
      case 'spacer':
        return `<div style="height:${block.content.height || '30px'}"></div>`
      case 'social':
        return block.content.html || '<p style="text-align:center;font-size:12px;color:#999">Follow us</p>'
      case 'product':
        return `<div style="text-align:center"><img src="${block.content.image}" alt="${block.content.name}" style="width:200px;height:200px;object-fit:cover;border-radius:8px" /><p style="font-weight:bold;margin:12px 0 4px">${block.content.name}</p><p style="color:#1E40AF;font-weight:bold">${block.content.price}</p></div>`
      default:
        return ''
    }
  }

  const generateHTML = () => {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 0;"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">${blocks.map((block) => `<tr><td style="background:${block.styles.backgroundColor};padding:${block.styles.padding};">${renderBlockHTML(block)}</td></tr>`).join('')}</table></td></tr></table></body></html>`
  }

  const handleSave = () => {
    const html = generateHTML()
    console.log('Generated HTML:', html)
    alert('Email template saved!')
    router.push('/app/flow-editor')
  }

  const renderBlock = (block: EmailBlock) => {
    const isSelected = selectedBlockId === block.id

    return (
      <div
        key={block.id}
        onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id) }}
        className={`relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'}`}
        style={{ backgroundColor: block.styles.backgroundColor, padding: block.styles.padding }}
      >
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-2 py-1 z-10 flex items-center gap-2 rounded-t">
            <span className="capitalize font-medium">{block.type}</span>
            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, -1) }} title="Move up" className="hover:bg-blue-700 rounded px-0.5">&#9650;</button>
            <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 1) }} title="Move down" className="hover:bg-blue-700 rounded px-0.5">&#9660;</button>
            <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }} title="Duplicate" className="hover:bg-blue-700 rounded px-0.5">&#10697;</button>
            <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }} title="Delete" className="hover:bg-red-600 rounded px-0.5">&#128465;</button>
          </div>
        )}

        {block.type === 'navbar' && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: block.content.logoColor }}>{block.content.logoText}</span>
          </div>
        )}

        {block.type === 'text' && (
          <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
        )}

        {block.type === 'button' && (
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: block.styles.buttonColor || '#1E40AF',
                color: block.styles.textColor || '#ffffff',
                padding: '12px 32px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '1px',
              }}
            >
              {block.content.text}
            </span>
          </div>
        )}

        {block.type === 'coupon' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '8px' }}>{block.content.label}</p>
            <div style={{ display: 'inline-block', border: '2px dashed #333', padding: '10px 24px', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>
              {block.content.code}
            </div>
          </div>
        )}

        {block.type === 'image' && (
          <div style={{ textAlign: 'center' }}>
            <img src={block.content.src} alt={block.content.alt || ''} style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }} />
          </div>
        )}

        {block.type === 'divider' && <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0' }} />}

        {block.type === 'spacer' && <div style={{ height: block.content.height || '30px' }} />}

        {block.type === 'social' && <div dangerouslySetInnerHTML={{ __html: block.content.html }} />}

        {block.type === 'product' && (
          <div style={{ textAlign: 'center' }}>
            <img src={block.content.image} alt={block.content.name} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
            <p style={{ fontWeight: 'bold', margin: '12px 0 4px' }}>{block.content.name}</p>
            <p style={{ color: '#1E40AF', fontWeight: 'bold' }}>{block.content.price}</p>
          </div>
        )}
      </div>
    )
  }

  const contentBlocks = [
    { type: 'text', icon: 'T', label: 'Text' },
    { type: 'image', icon: '🖼', label: 'Image' },
    { type: 'button', icon: '▭', label: 'Button' },
    { type: 'divider', icon: '—', label: 'Divider' },
    { type: 'spacer', icon: '▢', label: 'Spacer' },
    { type: 'navbar', icon: '☰', label: 'Navbar' },
    { type: 'social', icon: '⬡', label: 'Social' },
    { type: 'coupon', icon: '🏷', label: 'Coupon' },
    { type: 'product', icon: '🛍', label: 'Product' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/app/flow-editor')} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-semibold text-gray-900">Email Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setPreviewMode('desktop')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${previewMode === 'desktop' ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              Desktop
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${previewMode === 'mobile' ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
              Mobile
            </button>
          </div>
          <button onClick={() => router.push('/app/flow-editor')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Discard</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">Save</button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200">
            {(['element', 'style', 'layer'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize ${activeTab === tab ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'element' && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Content</p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {contentBlocks.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => addBlock(item.type)}
                      className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors gap-2 text-xs text-gray-600"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Layout</p>
                <div className="space-y-2">
                  {[
                    { cols: 1, label: '1 column', preview: '100%' },
                    { cols: 2, label: '2 column', preview: '50% | 50%' },
                    { cols: 3, label: '3 column', preview: '33% | 33% | 33%' },
                    { cols: 4, label: '4 column', preview: '25% × 4' },
                  ].map((layout) => (
                    <button
                      key={layout.cols}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-sm text-gray-700"
                    >
                      <span>{layout.label}</span>
                      <span className="text-xs text-gray-400">{layout.preview}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email Background</label>
                  <input type="color" defaultValue="#f4f4f4" className="w-full h-10 border rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Font Family</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Arial</option><option>Georgia</option><option>Verdana</option><option>Helvetica</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Link Color</label>
                  <input type="color" defaultValue="#1E40AF" className="w-full h-10 border rounded-lg cursor-pointer" />
                </div>
              </div>
            )}

            {activeTab === 'layer' && (
              <div className="space-y-1">
                {blocks.map((block, index) => (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm text-left ${selectedBlockId === block.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span className="text-gray-400 text-xs w-4">{index + 1}</span>
                    <span className="capitalize">{block.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8" onClick={() => setSelectedBlockId(null)}>
          <div
            className="mx-auto bg-white shadow-lg"
            style={{ width: previewMode === 'desktop' ? '600px' : '375px', transition: 'width 0.3s ease' }}
          >
            {blocks.map((block) => renderBlock(block))}

            <div
              className="border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={(e) => { e.stopPropagation(); addBlock('text') }}
            >
              + Add block
            </div>
          </div>
        </div>

        {/* Right settings panel */}
        {selectedBlock && (
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">{selectedBlock.type} Settings</h3>
              <button onClick={() => setSelectedBlockId(null)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
            </div>

            {selectedBlock.type === 'text' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Content (HTML)</label>
                <textarea
                  value={selectedBlock.content.html}
                  onChange={(e) => updateBlock(selectedBlock.id, { content: { html: e.target.value } })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-40 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {selectedBlock.type === 'navbar' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Logo Text</label>
                  <input type="text" value={selectedBlock.content.logoText} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, logoText: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Logo Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={selectedBlock.content.logoColor} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, logoColor: e.target.value } })} className="h-10 w-16 border rounded cursor-pointer" />
                    <span className="text-sm text-gray-500">{selectedBlock.content.logoColor}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBlock.type === 'button' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Text</label>
                  <input type="text" value={selectedBlock.content.text} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, text: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Link URL</label>
                  <input type="text" value={selectedBlock.content.url} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, url: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Button Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={selectedBlock.styles.buttonColor || '#1E40AF'} onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, buttonColor: e.target.value } })} className="h-10 w-16 border rounded cursor-pointer" />
                    <span className="text-sm text-gray-500">{selectedBlock.styles.buttonColor || '#1E40AF'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Text Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={selectedBlock.styles.textColor || '#ffffff'} onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textColor: e.target.value } })} className="h-10 w-16 border rounded cursor-pointer" />
                    <span className="text-sm text-gray-500">{selectedBlock.styles.textColor || '#ffffff'}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBlock.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Image URL</label>
                  <input type="text" value={selectedBlock.content.src} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, src: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Alt Text</label>
                  <input type="text" value={selectedBlock.content.alt || ''} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, alt: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}

            {selectedBlock.type === 'coupon' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Label</label>
                  <input type="text" value={selectedBlock.content.label} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, label: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                  <input type="text" value={selectedBlock.content.code} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, code: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 font-mono" />
                </div>
              </div>
            )}

            {selectedBlock.type === 'product' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <input type="text" value={selectedBlock.content.name} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, name: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <input type="text" value={selectedBlock.content.price} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, price: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Image URL</label>
                  <input type="text" value={selectedBlock.content.image} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, image: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>
            )}

            {selectedBlock.type === 'spacer' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Height</label>
                <input type="text" value={selectedBlock.content.height || '30px'} onChange={(e) => updateBlock(selectedBlock.id, { content: { ...selectedBlock.content, height: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" placeholder="30px" />
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700">Background Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={selectedBlock.styles.backgroundColor || '#ffffff'} onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, backgroundColor: e.target.value } })} className="h-10 w-16 border rounded cursor-pointer" />
                <span className="text-sm text-gray-500">{selectedBlock.styles.backgroundColor || '#ffffff'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700">Padding</label>
              <input type="text" value={selectedBlock.styles.padding || '20px'} onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, padding: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" placeholder="20px" />
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => duplicateBlock(selectedBlock.id)} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Duplicate</button>
              <button onClick={() => deleteBlock(selectedBlock.id)} className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
