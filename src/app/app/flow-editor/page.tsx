'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const emailTemplates: Record<string, string> = {
  'welcome-1': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#1E40AF;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:26px">Welcome! &#127881;</h1>
<p style="color:#93C5FD;margin:8px 0 0">We are so glad you are here</p></div>
<div style="padding:40px;text-align:center">
<h2 style="color:#111827;font-size:26px;margin:0 0 16px">Here is 10% Off Your First Order</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Thank you for joining! Use code below to save on your first purchase.</p>
<div style="background:#EFF6FF;border:2px dashed #1E40AF;border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:#1E40AF;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">YOUR WELCOME GIFT</p>
<div style="background:#1E40AF;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px">FW-WELCOME10</div>
<p style="color:#6B7280;font-size:13px;margin:12px 0 0">10% off your entire order</p></div>
<a href="#" style="display:inline-block;background:#1E40AF;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(30,64,175,0.3)">Shop Now</a></div>
<div style="background:#F9FAFB;padding:24px;text-align:center">
<span style="margin:0 16px;font-size:24px">&#128666;</span>
<span style="margin:0 16px;font-size:24px">&#8617;&#65039;</span>
<span style="margin:0 16px;font-size:24px">&#11088;</span></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'welcome-2': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#1E40AF,#3B82F6);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">Your discount is still waiting! &#9200;</h1></div>
<div style="padding:40px">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Did you find everything you were looking for?</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">We noticed you have not used your welcome discount yet. Here is a reminder — it expires in 48 hours!</p>
<div style="background:#FFF7ED;border-left:4px solid #F59E0B;border-radius:8px;padding:16px;margin-bottom:24px">
<p style="color:#92400E;font-weight:700;margin:0 0 4px">&#9200; Expires in 48 hours!</p>
<p style="color:#78350F;font-size:13px;margin:0">Use code <strong>FW-WELCOME10</strong> for 10% off</p></div>
<div style="text-align:center">
<a href="#" style="display:inline-block;background:#1E40AF;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(30,64,175,0.3)">Use My Discount Now</a></div></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'welcome-3': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#DC2626;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">LAST CHANCE! &#9200; Expires Today</h1></div>
<div style="padding:40px;text-align:center">
<div style="background:#FEF2F2;border-radius:16px;padding:32px;margin-bottom:24px">
<p style="color:#DC2626;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">&#9888;&#65039; EXPIRING TODAY</p>
<p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 8px">10% OFF</p>
<div style="background:#DC2626;color:#fff;display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px">FW-WELCOME10</div></div>
<h2 style="color:#111827;font-size:20px;margin:0 0 16px">This is your final reminder!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Your welcome discount expires at midnight tonight. Do not miss out on saving 10%!</p>
<a href="#" style="display:inline-block;background:#DC2626;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(220,38,38,0.3)">Claim 10% Off NOW</a>
<p style="color:#9CA3AF;font-size:12px;margin-top:16px">Offer valid until midnight tonight only</p></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'browse-1': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#7C3AED,#1E40AF);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">Still thinking about it? &#128064;</h1></div>
<div style="padding:40px">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">You left something behind!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">We noticed you were browsing our store. The items you viewed are still available — but they might not be for long!</p>
<div style="background:#FFF7ED;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center">
<p style="color:#92400E;font-weight:700;margin:0 0 4px">&#128293; Only a few left in stock!</p></div>
<div style="text-align:center">
<a href="#" style="display:inline-block;background:#7C3AED;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(124,58,237,0.3)">Continue Shopping</a></div></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'browse-2': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#7C3AED;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">We saved your picks! &#128156; Here is 10% off</h1></div>
<div style="padding:40px;text-align:center">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Come back and save!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Use this exclusive comeback discount just for you!</p>
<div style="background:#F5F3FF;border:2px dashed #7C3AED;border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:#7C3AED;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">SPECIAL OFFER</p>
<div style="background:#7C3AED;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px">COMEBACK10</div>
<p style="color:#6B7280;font-size:13px;margin:12px 0 0">10% off your next order</p></div>
<a href="#" style="display:inline-block;background:#7C3AED;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(124,58,237,0.3)">Shop With Discount</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'checkout-1': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">You forgot something! &#128722;</h1></div>
<div style="padding:40px">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Your cart is waiting for you</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">You were so close! Your items are still in your cart. Complete your purchase before they sell out!</p>
<div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:20px;margin-bottom:16px">
<p style="color:#92400E;font-weight:700;margin:0 0 4px">&#128722; Items in your cart</p>
<p style="color:#78350F;font-size:13px;margin:0">Ready and waiting for you!</p></div>
<div style="background:#FEF2F2;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center">
<p style="color:#DC2626;font-weight:700;margin:0">&#9888;&#65039; Items may sell out soon!</p></div>
<div style="text-align:center">
<a href="#" style="display:inline-block;background:#F59E0B;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(245,158,11,0.3)">Complete My Order</a></div></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'checkout-2': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#EF4444;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">Still on the fence? Here is 10% off! &#127873;</h1></div>
<div style="padding:40px;text-align:center">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Let us help you decide!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Complete your purchase with this exclusive discount:</p>
<div style="background:#FEF2F2;border:2px dashed #EF4444;border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:#EF4444;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">EXCLUSIVE OFFER</p>
<div style="background:#EF4444;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px">SAVE10NOW</div>
<p style="color:#6B7280;font-size:13px;margin:12px 0 0">10% off your abandoned cart</p></div>
<a href="#" style="display:inline-block;background:#EF4444;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(239,68,68,0.3)">Complete Purchase &amp; Save</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'checkout-3': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#111827;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">Final reminder &#9200; 15% off your cart</h1>
<p style="color:#9CA3AF;margin:8px 0 0">Our biggest cart discount ever</p></div>
<div style="padding:40px;text-align:center">
<div style="background:#FEF2F2;border-radius:16px;padding:32px;margin-bottom:24px">
<p style="color:#DC2626;font-size:40px;font-weight:900;margin:0 0 8px">15% OFF</p>
<div style="background:#DC2626;color:#fff;display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px">LASTCHANCE15</div></div>
<p style="color:#6B7280;font-size:14px;margin:0 0 24px">This is our final email about your cart!</p>
<a href="#" style="display:inline-block;background:#111827;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px">Save 15% &amp; Complete Order</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'thankyou-1': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#10B981,#059669);padding:32px;text-align:center">
<div style="font-size:48px;margin-bottom:8px">&#127882;</div>
<h1 style="color:#fff;margin:0;font-size:26px">Thank You for Your Order!</h1></div>
<div style="padding:40px;text-align:center">
<div style="background:#F0FDF4;border-radius:16px;padding:24px;margin-bottom:24px">
<div style="font-size:48px;margin-bottom:12px">&#9989;</div>
<h2 style="color:#111827;font-size:22px;margin:0 0 8px">Order Confirmed!</h2>
<p style="color:#6B7280;font-size:14px;margin:0">Your order is being processed and will ship soon.</p></div>
<a href="#" style="display:inline-block;background:#10B981;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(16,185,129,0.3)">Shop More Products</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'thankyou-2': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#10B981;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">We love you! &#128154; Here is 15% off</h1></div>
<div style="padding:40px;text-align:center">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Thank you for being our customer!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">As a token of appreciation, enjoy 15% off your next order!</p>
<div style="background:#F0FDF4;border:2px dashed #10B981;border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:#10B981;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">THANK YOU GIFT &#127873;</p>
<div style="background:#10B981;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px">THANKYOU15</div>
<p style="color:#6B7280;font-size:13px;margin:12px 0 0">15% off your next order</p></div>
<a href="#" style="display:inline-block;background:#10B981;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(16,185,129,0.3)">Shop Again &amp; Save 15%</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'winback-1': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">We miss you! &#128156;</h1>
<p style="color:#C4B5FD;margin:8px 0 0">It has been a while</p></div>
<div style="padding:40px;text-align:center">
<div style="font-size:64px;margin-bottom:16px">&#128546;</div>
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">Come back, we have missed you!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Here is a special 20% discount just for you!</p>
<div style="background:#F5F3FF;border:2px dashed #8B5CF6;border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:#8B5CF6;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">WE MISS YOU GIFT &#128156;</p>
<p style="color:#111827;font-size:36px;font-weight:900;margin:0 0 8px">20% OFF</p>
<div style="background:#8B5CF6;color:#fff;display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px">MISSYOU20</div></div>
<a href="#" style="display:inline-block;background:#8B5CF6;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(139,92,246,0.3)">Come Back &amp; Save 20%</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'winback-2': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:#8B5CF6;padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">Look what is new! &#10024;</h1></div>
<div style="padding:40px">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">New products you will love!</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">Since your last visit we added amazing new products. Here is 15% off to welcome you back!</p>
<div style="background:#F5F3FF;border:2px dashed #8B5CF6;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center">
<div style="background:#8B5CF6;color:#fff;display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px">WELCOME15</div>
<p style="color:#6B7280;font-size:13px;margin:8px 0 0">15% off everything</p></div>
<div style="text-align:center">
<a href="#" style="display:inline-block;background:#8B5CF6;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(139,92,246,0.3)">Explore New Products</a></div></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,

  'winback-3': `<html><body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<div style="background:linear-gradient(135deg,#111827,#374151);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">This is goodbye? &#128532;</h1>
<p style="color:#9CA3AF;margin:8px 0 0">Our biggest offer ever</p></div>
<div style="padding:40px;text-align:center">
<h2 style="color:#111827;font-size:22px;margin:0 0 16px">One final offer before you go</h2>
<p style="color:#6B7280;line-height:1.7;margin:0 0 24px">We do not want to lose you. Here is 25% off — our best offer ever!</p>
<div style="background:linear-gradient(135deg,#111827,#374151);border-radius:16px;padding:32px;margin-bottom:24px">
<p style="color:#9CA3AF;font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">OUR BEST OFFER EVER</p>
<p style="color:#fff;font-size:48px;font-weight:900;margin:0 0 8px">25% OFF</p>
<div style="background:#fff;color:#111827;display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px">COMEBACK25</div>
<p style="color:#9CA3AF;font-size:13px;margin:12px 0 0">Valid for 24 hours only</p></div>
<a href="#" style="display:inline-block;background:#111827;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(0,0,0,0.3)">Claim 25% Off Now</a></div>
<div style="background:#111827;padding:20px;text-align:center">
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a></div></div></body></html>`,
}

interface FlowEmail {
  id: string
  name: string
  delay: string
  status: string
  subject: string
  previewText: string
  templateKey: string
}

interface Flow {
  id: string
  name: string
  count: string
  emails: FlowEmail[]
}

const flows: Flow[] = [
  { id: 'welcome', name: 'Welcome Flow', count: '3 of 3',
    emails: [
      { id: 'w1', name: '1st Welcome Email', delay: 'On trigger', status: 'active', subject: 'Welcome! Here is 10% off', previewText: 'Your welcome gift awaits', templateKey: 'welcome-1' },
      { id: 'w2', name: '2nd Welcome Email', delay: '48 hour(s) from previous', status: 'active', subject: 'Your discount is still waiting', previewText: 'Do not let your discount expire', templateKey: 'welcome-2' },
      { id: 'w3', name: '3rd Welcome Email', delay: '2 day(s) from previous', status: 'active', subject: 'LAST CHANCE! 10% off expires today', previewText: 'Final reminder', templateKey: 'welcome-3' },
    ]
  },
  { id: 'browse', name: 'Browse Abandonment', count: '2 of 2',
    emails: [
      { id: 'b1', name: 'Browse Abandonment', delay: '1 hour from trigger', status: 'active', subject: 'Still thinking about it?', previewText: 'Items you viewed are still available', templateKey: 'browse-1' },
      { id: 'b2', name: 'Browse Follow-up', delay: '24 hour(s) from previous', status: 'active', subject: 'We saved your picks + 10% off', previewText: 'Special offer just for you', templateKey: 'browse-2' },
    ]
  },
  { id: 'checkout', name: 'Abandoned Checkout', count: '3 of 3',
    emails: [
      { id: 'c1', name: '1st Checkout Recovery', delay: '1 hour from trigger', status: 'active', subject: 'You forgot something!', previewText: 'Your cart is waiting', templateKey: 'checkout-1' },
      { id: 'c2', name: '2nd Checkout Recovery', delay: '24 hour(s) from previous', status: 'active', subject: 'Still deciding? Here is 10% off', previewText: 'Complete your purchase and save', templateKey: 'checkout-2' },
      { id: 'c3', name: 'Final Checkout Recovery', delay: '48 hour(s) from previous', status: 'active', subject: 'Final reminder — 15% off your cart', previewText: 'Our biggest cart discount', templateKey: 'checkout-3' },
    ]
  },
  { id: 'thankyou', name: 'Thank You', count: '2 of 2',
    emails: [
      { id: 't1', name: 'Order Confirmation', delay: 'On trigger', status: 'active', subject: 'Thank you for your order!', previewText: 'Your order is confirmed', templateKey: 'thankyou-1' },
      { id: 't2', name: 'Thank You Gift', delay: '3 day(s) from previous', status: 'active', subject: 'We love you! 15% off your next order', previewText: 'A thank you gift just for you', templateKey: 'thankyou-2' },
    ]
  },
  { id: 'winback', name: 'Winback Email', count: '3 of 3',
    emails: [
      { id: 'wb1', name: 'We Miss You', delay: '30 days from last order', status: 'active', subject: 'We miss you! 20% off inside', previewText: 'Come back and save big', templateKey: 'winback-1' },
      { id: 'wb2', name: 'New Products', delay: '7 day(s) from previous', status: 'active', subject: 'Look what is new!', previewText: 'Amazing new products', templateKey: 'winback-2' },
      { id: 'wb3', name: 'Final Winback', delay: '7 day(s) from previous', status: 'active', subject: 'Our best offer yet — 25% off', previewText: 'One final offer', templateKey: 'winback-3' },
    ]
  },
]

export default function FlowEditor() {
  const router = useRouter()
  const [expandedFlow, setExpandedFlow] = useState<string>('welcome')
  const defaultEmail = flows[0]!.emails[0]!
  const [selectedEmail, setSelectedEmail] = useState<FlowEmail>(defaultEmail)
  const [selectedHtml, setSelectedHtml] = useState<string>(emailTemplates[defaultEmail.templateKey]!)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showSubjectEditor, setShowSubjectEditor] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)
  const [storeData, setStoreData] = useState<{ storeName: string; primaryColor: string; logoUrl: string; website: string; products: any[] } | null>(null)
  const [dynamicWelcomeHtml, setDynamicWelcomeHtml] = useState('')

  // Fetch real store data, products, and dynamic template on mount
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/products'),
        ])
        const settingsData = await settingsRes.json()
        const productsData = await productsRes.json()

        const data = {
          storeName: settingsData.store?.storeName || 'Your Store',
          primaryColor: settingsData.store?.primaryColor || '#1E40AF',
          logoUrl: settingsData.store?.logoUrl || '',
          website: settingsData.store?.website || '#',
          products: productsData.products || [],
        }
        setStoreData(data)

        // Fetch smart dynamic welcome template from API
        try {
          const dynamicRes = await fetch('/api/templates/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'welcome',
              storeData: settingsData.store || {},
              products: productsData.products?.slice(0, 2) || []
            })
          })
          const dynamicData = await dynamicRes.json()
          if (dynamicData.html) {
            setDynamicWelcomeHtml(dynamicData.html)
            // If currently viewing welcome-1, update preview
            if (defaultEmail.templateKey === 'welcome-1') {
              setSelectedHtml(dynamicData.html)
            }
          }
        } catch {
          // Fall back to string replacement
          const dynamicHtml = generateDynamicTemplate(defaultEmail.templateKey, data)
          if (dynamicHtml) setSelectedHtml(dynamicHtml)
        }
      } catch (e) {
        console.error('Failed to load store data:', e)
      }
    }
    loadStoreData()
  }, [])

  const generateDynamicTemplate = (templateKey: string, data: { storeName: string; primaryColor: string; logoUrl: string; website: string; products: any[] }): string | null => {
    const { storeName, primaryColor, products } = data
    const productRows = products.slice(0, 2).map(p =>
      `<td width="48%" style="background:#F9FAFB;border-radius:12px;overflow:hidden;text-align:center;">
        ${p.images?.[0]?.src ? `<img src="${p.images[0].src}" style="width:100%;height:140px;object-fit:cover;">` : `<div style="height:140px;background:#E5E7EB;text-align:center;line-height:140px;font-size:28px;">&#128230;</div>`}
        <div style="padding:10px;"><p style="color:#111827;font-weight:700;font-size:12px;margin:0 0 4px;">${p.title}</p><p style="color:${primaryColor};font-weight:700;font-size:13px;margin:0;">$${p.variants?.[0]?.price || '0.00'}</p></div>
      </td>`
    ).join('<td width="4%"></td>')
    const productsSection = products.length > 0 ? `<tr><td style="padding:24px 40px;"><p style="color:#111827;font-size:16px;font-weight:700;margin:0 0 12px;text-align:center;">Our Products</p><table width="100%"><tr>${productRows}</tr></table></td></tr>` : ''

    const base = emailTemplates[templateKey]
    if (!base) return null

    // For welcome-1, inject products section before footer
    if (templateKey === 'welcome-1' && productsSection) {
      return base
        .replace(/Our Store|Your Store/g, storeName)
        .replace(/#1E40AF/g, primaryColor)
        .replace(/<\/div><\/div><\/body>/, `</div>${productsSection}</div></body>`)
    }

    // For all templates, swap store name and brand color
    return base
      .replace(/Our Store|Your Store|Fluxmail/g, storeName)
      .replace(/#1E40AF/g, primaryColor)
  }

  const handleEmailClick = (email: FlowEmail) => {
    setSelectedEmail(email)
    // Use smart dynamic template for welcome-1 if available
    if (email.templateKey === 'welcome-1' && dynamicWelcomeHtml) {
      setSelectedHtml(dynamicWelcomeHtml)
      return
    }
    const dynamicHtml = storeData ? generateDynamicTemplate(email.templateKey, storeData) : null
    setSelectedHtml(dynamicHtml || emailTemplates[email.templateKey] || '<p style="text-align:center;padding:40px;color:#999">No template available</p>')
  }

  const handleSendTest = async () => {
    setTestSending(true)
    try {
      const res = await fetch('/api/flow-emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: selectedEmail.subject,
          html: selectedHtml
        })
      })
      if (res.ok) setTestSuccess(true)
    } catch (e) {
      alert('Failed to send')
    } finally {
      setTestSending(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* LEFT PANEL */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Flow Editor</h2>
          <p className="text-xs text-gray-500 mt-0.5">View and edit your email flows</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Flow Selector</p>
            {flows.map(flow => (
              <div key={flow.id} className="mb-1">
                <button
                  onClick={() => setExpandedFlow(expandedFlow === flow.id ? '' : flow.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${expandedFlow === flow.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">{flow.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{flow.count}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </button>

                {expandedFlow === flow.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {flow.emails.map(email => (
                      <button
                        key={email.id}
                        onClick={() => handleEmailClick(email)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${selectedEmail.id === email.id ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-50'}`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${selectedEmail.id === email.id ? 'text-blue-700' : 'text-gray-700'}`}>
                            {email.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{email.delay}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                          &#9679; Active
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Triggers &amp; Funnel</p>
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-2">
              <div>
                <p className="font-semibold text-gray-700 mb-1">User added when:</p>
                <p>&#8226; Valid email entered in popup</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">User removed when:</p>
                <p>&#8226; Places an order</p>
                <p>&#8226; Was in flow last 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900">{selectedEmail.name} - Preview</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                &#9679; Active
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
              >
                Edit
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showEditMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEditMenu(false)} />
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-1">
                    <button onClick={() => { setShowEditMenu(false); setShowSubjectEditor(true) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Subject Line
                    </button>
                    <button onClick={() => { setShowEditMenu(false); router.push('/app/flow-editor/email-editor') }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Edit Email Template
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { setShowEditMenu(false); setTestSuccess(false); setTestEmail(''); setShowTestModal(true) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Test Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">From:</span>
              <span className="text-gray-900 font-medium">Fluxmail &lt;onboarding@resend.dev&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">Subject:</span>
              <span className="text-gray-900 font-medium">{selectedEmail.subject}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">Preview:</span>
              <span className="text-gray-600">{selectedEmail.previewText}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <iframe
            key={selectedEmail.id}
            srcDoc={selectedHtml}
            className="w-full bg-white rounded-xl shadow-sm"
            style={{ height: '600px', border: 'none', maxWidth: '650px', margin: '0 auto', display: 'block' }}
            title="Email Preview"
          />
        </div>
      </div>

      {/* Subject Editor Modal */}
      {showSubjectEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setShowSubjectEditor(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit Subject Line</h2>
              <button onClick={() => setShowSubjectEditor(false)} className="text-gray-400 hover:text-gray-600">&#10005;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Subject Line</label>
                <input type="text" defaultValue={selectedEmail.subject}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Preview Text</label>
                <input type="text" defaultValue={selectedEmail.previewText}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => !testSending && setShowTestModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Send Test Email</h2>
                    <p className="text-blue-200 text-xs">Preview in your inbox</p>
                  </div>
                </div>
                <button onClick={() => setShowTestModal(false)} disabled={testSending}
                  className="text-white text-opacity-70 hover:text-opacity-100 w-8 h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-lg">&#10005;</button>
              </div>
            </div>
            <div className="px-6 py-6">
              {!testSuccess ? (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                    <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendTest()}
                      placeholder="you@example.com" autoFocus disabled={testSending}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none disabled:opacity-50" />
                    <div className="flex items-center gap-2 mt-2 bg-blue-50 rounded-lg px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-600 text-xs">Sending: {selectedEmail.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowTestModal(false)} disabled={testSending}
                      className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50">Discard</button>
                    <button onClick={handleSendTest} disabled={testSending || !testEmail}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                      {testSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Test Email
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Email Sent!</h3>
                  <p className="text-gray-500 text-sm mb-1">Sent to: <strong className="text-blue-700">{testEmail}</strong></p>
                  <p className="text-gray-400 text-xs mb-6">Check your inbox (and spam folder)</p>
                  <div className="flex gap-3">
                    <button onClick={() => { setTestSuccess(false); setTestEmail('') }}
                      className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Send Another</button>
                    <button onClick={() => setShowTestModal(false)}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-200">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
