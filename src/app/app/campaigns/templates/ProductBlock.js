export default class ProductBlock {
  static get toolbox() {
    return {
      title: 'Change Product',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    }
  }

  constructor({ data, config, api }) {
    this.data = data || {}
    this.config = config || {}
    this.api = api
    this.products = this.config.products || []
    this.wrapper = null
    this.previewEl = null
  }

  render() {
    this.wrapper = document.createElement('div')
    this.wrapper.style.cssText = 'border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:8px 0;'

    // Dropdown
    const selectWrap = document.createElement('div')
    selectWrap.style.cssText = 'padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;'

    const label = document.createElement('span')
    label.textContent = 'Product:'
    label.style.cssText = 'font-size:12px;font-weight:600;color:#6b7280;white-space:nowrap;'

    const select = document.createElement('select')
    select.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#fff;cursor:pointer;outline:none;'

    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Select a product...'
    select.appendChild(placeholder)

    this.products.forEach((p) => {
      const opt = document.createElement('option')
      opt.value = p.id.toString()
      const price = p.variants?.[0]?.price ? `$${p.variants[0].price}` : ''
      opt.textContent = price ? `${p.title} — ${price}` : p.title
      select.appendChild(opt)
    })

    // If we have saved data, pre-select it
    if (this.data.id) {
      select.value = this.data.id.toString()
    }

    select.addEventListener('change', () => {
      const product = this.products.find((p) => p.id.toString() === select.value)
      if (product) {
        this.data = {
          id: product.id.toString(),
          title: product.title,
          image: product.images?.[0]?.src || '',
          price: product.variants?.[0]?.price ? `$${product.variants[0].price}` : '',
          url: product.handle ? `/products/${product.handle}` : '#',
        }
        this._renderPreview()
        this.api.blocks.update(this.api.blocks.getCurrentBlockIndex(), this.data)
      }
    })

    selectWrap.appendChild(label)
    selectWrap.appendChild(select)
    this.wrapper.appendChild(selectWrap)

    // Preview area
    this.previewEl = document.createElement('div')
    this.wrapper.appendChild(this.previewEl)

    if (this.data.id) {
      this._renderPreview()
    }

    return this.wrapper
  }

  _renderPreview() {
    if (!this.previewEl) return
    const { title, image, price } = this.data
    this.previewEl.innerHTML = ''

    const card = document.createElement('div')
    card.style.cssText = 'text-align:center;padding:16px;'

    if (image) {
      const img = document.createElement('img')
      img.src = image
      img.alt = title || ''
      img.style.cssText = 'width:100%;max-width:200px;border-radius:8px;display:block;margin:0 auto 12px;'
      card.appendChild(img)
    }

    if (title) {
      const h = document.createElement('h4')
      h.textContent = title
      h.style.cssText = 'font-size:15px;font-weight:700;color:#1a1a1a;margin:0 0 4px;'
      card.appendChild(h)
    }

    if (price) {
      const p = document.createElement('p')
      p.textContent = price
      p.style.cssText = 'font-size:14px;font-weight:600;color:#1E40AF;margin:0 0 8px;'
      card.appendChild(p)
    }

    const badge = document.createElement('span')
    badge.textContent = 'Shop Now →'
    badge.style.cssText = 'display:inline-block;background:#1E40AF;color:#fff;padding:6px 16px;border-radius:16px;font-size:12px;font-weight:600;'
    card.appendChild(badge)

    this.previewEl.appendChild(card)
  }

  save() {
    return this.data
  }

  static get isReadOnlySupported() {
    return true
  }
}
