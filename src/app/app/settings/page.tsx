'use client'
import { useState, useEffect, useRef } from 'react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [language, setLanguage] = useState('English')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [buttonShape, setButtonShape] = useState('rounded')
  const [primaryColor, setPrimaryColor] = useState('#1E40AF')
  const [primaryText, setPrimaryText] = useState('#FFFFFF')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [secondaryText, setSecondaryText] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [bgText, setBgText] = useState('#1F2937')
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('US')
  const [stateVal, setStateVal] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [address, setAddress] = useState('')
  const [senderName, setSenderName] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [rootDomain, setRootDomain] = useState('')
  const [senderDomain, setSenderDomain] = useState('')
  const [senderEmail, setSenderEmail] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const s = data.store
        if (s) {
          setFirstName(s.firstName || '')
          setLastName(s.lastName || '')
          setEmail(s.email || '')
          setPhone(s.phone || '')
          setLogoUrl(s.logoUrl || '')
          setLanguage(s.language || 'English')
          setFontFamily(s.fontFamily || 'Arial')
          setButtonShape(s.buttonShape || 'rounded')
          setPrimaryColor(s.primaryColor || '#1E40AF')
          setPrimaryText(s.primaryText || '#FFFFFF')
          setSecondaryColor(s.secondaryColor || '#FFFFFF')
          setSecondaryText(s.secondaryText || '#000000')
          setBgColor(s.bgColor || '#FFFFFF')
          setBgText(s.bgText || '#1F2937')
          setCompanyName(s.companyName || '')
          setWebsite(s.website || '')
          setCountry(s.country || 'US')
          setStateVal(s.state || '')
          setCity(s.city || '')
          setZip(s.zip || '')
          setAddress(s.address || '')
          setSenderName(s.senderName || '')
          setReplyToEmail(s.replyToEmail || '')
          setRootDomain(s.rootDomain || s.shopDomain || '')
          setSenderDomain(s.senderDomain || '')
          setSenderEmail(s.senderEmail || '')
          // Auto sync from Shopify if no company name set
          if (!s.companyName && !s.logoUrl) {
            setTimeout(() => syncFromShopify(), 1000)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const save = async (data: any) => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        setSaveMsg('Saved!')
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        setSaveMsg('Failed to save')
      }
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await save({ logoUrl: base64 })
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const syncFromShopify = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync/branding', { method: 'POST' })
      if (res.ok) {
        const settingsRes = await fetch('/api/settings')
        const settingsData = await settingsRes.json()
        const s = settingsData.store
        if (s) {
          setCompanyName(s.companyName || '')
          setWebsite(s.website || '')
          setLogoUrl(s.logoUrl || '')
          setPrimaryColor(s.primaryColor || '#1E40AF')
          setEmail(s.email || '')
          setPhone(s.phone || '')
          setCity(s.city || '')
          setCountry(s.country || '')
          setZip(s.zip || '')
          setAddress(s.address || '')
        }
        setSaveMsg('Synced from Shopify!')
        setTimeout(() => setSaveMsg(''), 4000)
      } else {
        setSaveMsg('Sync failed')
      }
    } catch {
      setSaveMsg('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p className="text-gray-500">Loading settings...</p>
      </div>
    </div>
  )

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  const labelClass = "text-sm font-medium text-gray-700 block mb-1.5"
  const sectionClass = "grid grid-cols-3 gap-8 py-8 border-b border-gray-100"
  const leftClass = "col-span-1"
  const rightClass = "col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
  const saveBtn = "flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md shadow-blue-200"

  const SaveButton = ({ onClick }: { onClick: () => void }) => (
    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
      <button disabled={saving} onClick={onClick} className={saveBtn}>
        {saving ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </>
        )}
      </button>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Brand &amp; Settings</h1>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
              saveMsg.includes('failed') || saveMsg.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={syncFromShopify}
            disabled={syncing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200"
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync from Shopify
              </>
            )}
          </button>
        </div>
      </div>

      {/* PROFILE */}
      <div className={sectionClass}>
        <div className={leftClass}>
          <h2 className="font-semibold text-gray-900 mb-1">Profile Information</h2>
          <p className="text-sm text-gray-500">Not visible to customers.</p>
        </div>
        <div className={rightClass}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
          </div>
          <SaveButton onClick={() => save({ firstName, lastName, email, phone })} />
        </div>
      </div>

      {/* BRANDING */}
      <div className={sectionClass}>
        <div className={leftClass}>
          <h2 className="font-semibold text-gray-900 mb-1">Branding</h2>
          <p className="text-sm text-gray-500">Update your brand assets. Logo changes update all email flows automatically.</p>
        </div>
        <div className={rightClass}>
          {/* Logo */}
          <div className="mb-6">
            <label className={labelClass}>Logo</label>
            <p className="text-xs text-gray-400 mb-3">Edit the logo block across all your emails at once.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 mb-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="max-h-20 max-w-48 mx-auto object-contain" />
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">No logo uploaded yet</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <div className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  {logoUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Logo
                    </>
                  )}
                </div>
              </label>
              {logoUrl && (
                <button onClick={() => { setLogoUrl(''); save({ logoUrl: '' }) }}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG. Max 2MB.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className={inputClass}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Portuguese</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Font Family</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className={inputClass}>
                <option>Arial</option>
                <option>Georgia</option>
                <option>Verdana</option>
                <option>Times New Roman</option>
                <option>Helvetica</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Button Shape</label>
            <div className="flex gap-3">
              {[
                { value: 'square', label: 'Square', style: 'rounded-none' },
                { value: 'rounded', label: 'Rounded', style: 'rounded-md' },
                { value: 'pill', label: 'Pill', style: 'rounded-full' },
              ].map(shape => (
                <button key={shape.value}
                  onClick={() => setButtonShape(shape.value)}
                  className={`flex-1 py-2.5 text-sm font-medium border-2 transition-all ${shape.style} ${buttonShape === shape.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          <SaveButton onClick={() => save({ language, fontFamily, buttonShape })} />
        </div>
      </div>

      {/* BRAND COLORS */}
      <div className={sectionClass}>
        <div className={leftClass}>
          <h2 className="font-semibold text-gray-900 mb-1">Brand Colors</h2>
          <p className="text-sm text-gray-500">Edit colors across all campaign emails at once.</p>
        </div>
        <div className={rightClass}>
          <p className="text-sm text-gray-500 mb-4">Edit the logo colors across all your campaign emails at once, to match your branding.</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Primary', value: primaryColor, set: setPrimaryColor },
              { label: 'Primary Text', value: primaryText, set: setPrimaryText },
              { label: 'Secondary', value: secondaryColor, set: setSecondaryColor },
              { label: 'Secondary Text', value: secondaryText, set: setSecondaryText },
              { label: 'Background', value: bgColor, set: setBgColor },
              { label: 'Background Text', value: bgText, set: setBgText },
            ].map(color => (
              <div key={color.label} className="flex items-center gap-3">
                <input type="color" value={color.value} onChange={e => color.set(e.target.value)}
                  className="h-10 w-12 border border-gray-200 rounded-lg cursor-pointer p-0.5" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">{color.label}</label>
                  <input type="text" value={color.value} onChange={e => color.set(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Regenerate Flows</button>
            <SaveButton onClick={() => save({ primaryColor, primaryText, secondaryColor, secondaryText, bgColor, bgText })} />
          </div>
        </div>
      </div>

      {/* COMPANY INFORMATION */}
      <div className={sectionClass}>
        <div className={leftClass}>
          <h2 className="font-semibold text-gray-900 mb-1">Company Information</h2>
          <p className="text-sm text-gray-500">Required by CAN-SPAM. Appears in email footer.</p>
        </div>
        <div className={rightClass}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Company name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Company" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourstore.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="US" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State/Province</label>
              <input value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="Nevada" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Las Vegas" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Zip code</label>
              <input value={zip} onChange={e => setZip(e.target.value)} placeholder="89107" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="304 South Jones Boulevard" className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">* Including your complete business address in marketing emails is required to comply with CAN-SPAM, GDPR, CASL.</p>
          <SaveButton onClick={() => save({ companyName, website, country, state: stateVal, city, zip, address })} />
        </div>
      </div>

      {/* SENDER INFORMATION */}
      <div className={sectionClass}>
        <div className={leftClass}>
          <h2 className="font-semibold text-gray-900 mb-1">Sender Information</h2>
          <p className="text-sm text-gray-500">To change your domain, please contact support.</p>
        </div>
        <div className={rightClass}>
          <div className="space-y-4 mb-4">
            <div>
              <label className={labelClass}>Sender name</label>
              <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your Store" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Root Domain</label>
              <input value={rootDomain} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>Sender domain</label>
              <input value={senderDomain} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>Sender email address</label>
              <input value={senderEmail} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>Reply-to email address</label>
              <input type="email" value={replyToEmail} onChange={e => setReplyToEmail(e.target.value)} placeholder="support@yourstore.com" className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">To make changes to your Root domain, Sender Domain, or sender email address, please contact our customer support.</p>
          <SaveButton onClick={() => save({ senderName, replyToEmail })} />
        </div>
      </div>

      {/* PLAN & USAGE */}
      <div className="py-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="font-semibold text-gray-900 mb-1">Plan &amp; Usage</h2>
            <p className="text-sm text-gray-500">Monitor your subscription and usage.</p>
          </div>
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Plan</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">Pro AI</span>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Emails sent this cycle</span>
              <span className="text-sm font-bold text-gray-900">0</span>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View pricing scale &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  )
}
