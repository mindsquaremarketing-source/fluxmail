export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ color: '#1E40AF' }}>Privacy Policy</h1>
      <p><strong>Last updated: March 2026</strong></p>

      <h2>1. Introduction</h2>
      <p>Fluxmail (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our Shopify application.</p>

      <h2>2. Information We Collect</h2>
      <p>We collect the following information through our Shopify app:</p>
      <ul>
        <li>Customer email addresses</li>
        <li>Customer first and last names</li>
        <li>Store information (shop domain, company name)</li>
        <li>Order data for conversion tracking</li>
        <li>Email marketing consent status</li>
      </ul>

      <h2>3. How We Use Information</h2>
      <p>We use collected information to:</p>
      <ul>
        <li>Send email marketing campaigns on behalf of merchants</li>
        <li>Track email open rates and click rates</li>
        <li>Provide automated email flows (welcome, abandoned cart, etc.)</li>
        <li>Generate analytics and reports for merchants</li>
      </ul>

      <h2>4. Data Storage</h2>
      <p>All data is stored securely in encrypted databases hosted on Supabase (PostgreSQL). Data is transmitted over HTTPS at all times.</p>

      <h2>5. Data Sharing</h2>
      <p>We do not sell, trade, or share customer data with third parties except:</p>
      <ul>
        <li>Resend.com - for email delivery services</li>
        <li>Supabase - for data storage</li>
        <li>Vercel - for application hosting</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>We retain customer data as long as the merchant has our app installed. Upon uninstallation, all merchant and customer data is permanently deleted within 30 days.</p>

      <h2>7. Customer Rights</h2>
      <p>Customers have the right to:</p>
      <ul>
        <li>Request access to their personal data</li>
        <li>Request deletion of their personal data</li>
        <li>Unsubscribe from email communications at any time</li>
        <li>Lodge a complaint with a supervisory authority</li>
      </ul>

      <h2>8. GDPR Compliance</h2>
      <p>We comply with GDPR, CAN-SPAM, and CASL regulations. We only send emails to customers who have given marketing consent through the merchant&apos;s Shopify store.</p>

      <h2>9. Cookies</h2>
      <p>Our application uses essential cookies only for authentication purposes. We do not use tracking or advertising cookies.</p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related questions or data deletion requests, contact us at:</p>
      <p>Email: privacy@fluxmail.app</p>
    </div>
  )
}
