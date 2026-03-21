'use client'

export default function ReferralPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 9 8h6s2-4 4.5-4a2.5 2.5 0 0 1 0 5H18" />
              <path d="M5 9h14v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
              <path d="M12 4v17" />
              <path d="M8 21h8" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Refer a Friend &amp; Earn</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Invite your friends and network to try Fluxmail,
            <br />
            and earn recurring commission on every payment they make.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">20%</p>
            <p className="text-lg font-semibold text-gray-900 mb-2">Commission</p>
            <p className="text-sm text-gray-500">On every subscription payment</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">Up to</p>
            <p className="text-lg font-semibold text-gray-900 mb-2">$400/month</p>
            <p className="text-sm text-gray-500">For each referred store</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">12-Month</p>
            <p className="text-lg font-semibold text-gray-900 mb-2">Earnings</p>
            <p className="text-sm text-gray-500">From subscription sign-up</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Join the Partner Program</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Sign up to become an official Fluxmail partner.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Share Your Unique Referral Link</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Invite friends, clients, or your audience.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Earn 20% Commission</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Get paid from every subscription payment they make.</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Withdraw Anytime</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Cash out your earnings with ease.</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <button className="w-full max-w-md px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Enroll in the Partner Program
          </button>
          <button className="w-full max-w-md px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Already an affiliate? Login
          </button>
        </div>

        {/* Fine Print */}
        <p className="text-center text-xs text-gray-400 leading-relaxed pb-8">
          * Stores that already have Fluxmail installed, or had it installed in the past,
          <br />
          are not eligible to be counted as referred.
        </p>
      </div>
    </div>
  )
}
