'use client'

import { useState } from 'react'

export default function SettingsPage() {
  // Profile
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Branding
  const [language, setLanguage] = useState('english')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [buttonShape, setButtonShape] = useState<'square' | 'rounded' | 'pill'>('rounded')

  // Colors
  const [colors, setColors] = useState({
    primary: '#6C47FF',
    primaryText: '#FFFFFF',
    secondary: '#FFFFFF',
    secondaryText: '#000000',
    background: '#FFFFFF',
    backgroundText: '#1F2937',
  })

  // Company
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [address, setAddress] = useState('')

  // Sender
  const [senderName, setSenderName] = useState('Fluxmail')
  const [replyTo, setReplyTo] = useState('')

  // Search
  const [productSearch, setProductSearch] = useState('')

  const updateColor = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Brand &amp; Settings</h1>

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
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">Edit</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Remove</button>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
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
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
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
              <button onClick={() => setButtonShape('square')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-none ${buttonShape === 'square' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                Square
              </button>
              <button onClick={() => setButtonShape('rounded')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-lg ${buttonShape === 'rounded' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                Rounded
              </button>
              <button onClick={() => setButtonShape('pill')} className={`w-24 h-10 border-2 text-xs font-medium transition-all rounded-full ${buttonShape === 'pill' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                Pill
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
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
                  <input
                    type="color"
                    value={colors[color.key]}
                    onChange={(e) => updateColor(color.key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colors[color.key]}
                    onChange={(e) => updateColor(color.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">Regenerate Flows</button>
            <button className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Browse</button>
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
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
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your Company" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourstore.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="California" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip code</label>
              <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="94105" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Market Street" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <p className="text-xs text-gray-400 mb-4">Your physical address is required by the CAN-SPAM Act and will appear in the footer of all marketing emails.</p>
          <div className="flex justify-end">
            <button className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
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
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
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
            <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@yourstore.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          <p className="text-xs text-gray-400 mb-4">To change your sending domain, please contact support.</p>
          <div className="flex justify-end">
            <button className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Pro AI</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Active Contacts</span>
              <span className="text-sm font-semibold text-gray-900">Loading...</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Emails sent this cycle</span>
              <span className="text-sm font-semibold text-gray-900">0</span>
            </div>
            <div className="pt-2">
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View pricing scale →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
