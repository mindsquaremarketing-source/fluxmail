'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [language, setLanguage] = useState('english')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [buttonShape, setButtonShape] = useState<'square' | 'rounded' | 'pill'>('rounded')
  const [colors, setColors] = useState({
    primary: '#1E40AF',
    primaryText: '#FFFFFF',
    secondary: '#FFFFFF',
    secondaryText: '#000000',
    background: '#FFFFFF',
    backgroundText: '#1F2937',
  })
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [address, setAddress] = useState('')
  const [senderName, setSenderName] = useState('Fluxmail')
  const [replyTo, setReplyTo] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [contactCount, setContactCount] = useState(0)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        const store = data.store
        if (store) {
          setFirstName(store.firstName || '')
          setLastName(store.lastName || '')
          setEmail(store.email || '')
          setPhone(store.phone || '')
          setLogoUrl(store.logoUrl || '')
          setColors({
            primary: store.primaryColor || '#1E40AF',
            primaryText: store.primaryText || '#FFFFFF',
            secondary: store.secondaryColor || '#FFFFFF',
            secondaryText: store.secondaryText || '#000000',
            background: store.bgColor || '#FFFFFF',
            backgroundText: store.bgText || '#1F2937',
          })
          setFontFamily(store.fontFamily || 'Arial')
          setButtonShape(store.buttonShape || 'rounded')
          setCompany(store.companyName || '')
          setWebsite(store.website || '')
          setCountry(store.country || '')
          setState(store.state || '')
          setCity(store.city || '')
          setZip(store.zip || '')
          setAddress(store.address || '')
          setSenderName(store.senderName || 'Fluxmail')
          setReplyTo(store.replyToEmail || '')
        }
        if (data.contactCount !== undefined) setContactCount(data.contactCount)
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (data: any) => {
    setSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        setSaveMessage('Saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Save failed')
      }
    } catch (e) {
      setSaveMessage('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB.')
      return
    }
    setLogoUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setLogoUrl(base64)
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: base64 })
      })
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const updateColor = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Brand &amp; Settings</h1>
        {saveMessage && (
          <span className={`text-sm font-medium ${saveMessage.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Profile Information */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-500 mt-1">Update your personal details and contact information.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave({ firstName, lastName, email, phone })}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Branding</h2>
          <p className="text-sm text-gray-500 mt-1">Customize your brand appearance across all emails.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          {/* Logo Upload */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">Logo</p>
            <p className="text-xs text-gray-500 mb-3">Edit the logo block across all your emails at once</p>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Store logo" className="max-h-24 max-w-48 mx-auto object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">No logo uploaded</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input type="file" accept="image/png,image/jpg,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
                <div className={`flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${logoUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {logoUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Logo
                    </>
                  )}
                </div>
              </label>
              {logoUrl && (
                <button
                  onClick={async () => {
                    setLogoUrl('')
                    await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ logoUrl: '' })
                    })
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Accepts PNG, JPG, JPEG, WebP. Max 2MB.</p>
          </div>

          {/* Language */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="portuguese">Portuguese</option>
            </select>
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
            </select>
          </div>

          {/* Button Shape */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Shape</label>
            <div className="flex gap-3">
              <button onClick={() => setButtonShape('square')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-none ${buttonShape === 'square' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>Square</button>
              <button onClick={() => setButtonShape('rounded')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-lg ${buttonShape === 'rounded' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>Rounded</button>
              <button onClick={() => setButtonShape('pill')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-full ${buttonShape === 'pill' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>Pill</button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSave({ fontFamily, buttonShape })}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Brand Colors</h2>
          <p className="text-sm text-gray-500 mt-1">Set colors used across your email templates.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-5">Edit the logo colors across all your campaign emails.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {([
              { key: 'primary', label: 'Primary' },
              { key: 'primaryText', label: 'Primary Text' },
              { key: 'secondary', label: 'Secondary' },
              { key: 'secondaryText', label: 'Secondary Text' },
              { key: 'background', label: 'Background' },
              { key: 'backgroundText', label: 'Background Text' },
            ] as const).map((color) => (
              <div key={color.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{color.label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={colors[color.key]} onChange={(e) => updateColor(color.key, e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" value={colors[color.key]} onChange={(e) => updateColor(color.key, e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Regenerate Flows</button>
            <button
              onClick={() => handleSave({
                primaryColor: colors.primary,
                primaryText: colors.primaryText,
                secondaryColor: colors.secondary,
                secondaryText: colors.secondaryText,
                bgColor: colors.background,
                bgText: colors.backgroundText,
              })}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Excluded Products */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Excluded Products</h2>
          <p className="text-sm text-gray-500 mt-1">Products that won&apos;t appear in automated emails.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Browse</button>
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
            <p className="text-sm text-gray-400">There are no excluded products</p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Company Information</h2>
          <p className="text-sm text-gray-500 mt-1">Required by CAN-SPAM regulations. This info appears in your email footer.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your Company" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourstore.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="California" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip code</label>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="94105" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Market Street" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <p className="text-xs text-gray-400 mb-4">Your physical address is required by the CAN-SPAM Act and will appear in the footer of all marketing emails.</p>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave({ companyName: company, website, country, state, city, zip, address })}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Sender Information */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Sender Information</h2>
          <p className="text-sm text-gray-500 mt-1">Configure the sender details for your emails.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sender name</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Root Domain</label>
            <input type="text" value="fluxmail.com" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sender domain</label>
            <input type="text" value="mail.fluxmail.com" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sender email</label>
            <input type="text" value="noreply@mail.fluxmail.com" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reply-to email</label>
            <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@yourstore.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <p className="text-xs text-gray-400 mb-4">To change your sending domain, please contact support.</p>
          <div className="flex justify-end">
            <button
              onClick={() => handleSave({ senderName, replyToEmail: replyTo })}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="flex gap-8 mb-10">
        <div className="w-1/3">
          <h2 className="text-sm font-semibold text-gray-900">Plan &amp; Usage</h2>
          <p className="text-sm text-gray-500 mt-1">View your current plan and usage statistics.</p>
        </div>
        <div className="w-2/3 bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Pro AI</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Active Contacts</span>
              <span className="text-sm font-semibold text-gray-900">{contactCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Emails sent this cycle</span>
              <span className="text-sm font-semibold text-gray-900">0</span>
            </div>
            <div className="pt-2">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View pricing scale &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
