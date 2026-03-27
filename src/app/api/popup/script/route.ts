import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get('storeId')
    if (!storeId) {
      return new NextResponse('// missing storeId', {
        headers: { 'Content-Type': 'application/javascript' },
      })
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store || !store.popupEnabled) {
      return new NextResponse('// popup disabled', {
        headers: { 'Content-Type': 'application/javascript' },
      })
    }

    const popupTitle = (store.popupTitle || 'Get 10% Off Your First Order').replace(/'/g, "\\'")
    const popupSubtitle = (store.popupSubtitle || 'Subscribe to our newsletter and get an exclusive discount on your first purchase.').replace(/'/g, "\\'")
    const brandColor = store.primaryColor || '#1E40AF'
    const popupDelay = (store.popupDelay || 5) * 1000

    const script = `
(function() {
  if (document.getElementById('fluxmail-popup')) return;

  var STORAGE_KEY = 'fluxmail_popup_dismissed';
  var dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed) {
    var dismissedAt = parseInt(dismissed, 10);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
  }

  var popupHTML = '<div id="fluxmail-popup" style="position:fixed;bottom:20px;right:20px;z-index:99999;background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);padding:28px;max-width:340px;font-family:sans-serif;display:none;">'
    + '<button id="fluxmail-close" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;color:#999;">\\u00d7</button>'
    + '<div style="font-size:28px;margin-bottom:8px;">\\ud83c\\udf81</div>'
    + '<h3 style="margin:0 0 6px;font-size:18px;font-weight:800;color:#0f172a;">${popupTitle}</h3>'
    + '<p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.5;">${popupSubtitle}</p>'
    + '<input id="fluxmail-email" type="email" placeholder="Enter your email" style="width:100%;box-sizing:border-box;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:10px;outline:none;">'
    + '<button id="fluxmail-submit" style="width:100%;padding:12px;background:${brandColor};color:white;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">Subscribe & Get Discount</button>'
    + '<p id="fluxmail-msg" style="margin:8px 0 0;font-size:12px;text-align:center;color:#64748b;"></p>'
    + '<p style="margin:12px 0 0;font-size:11px;text-align:center;color:#94a3b8;">We respect your privacy. Unsubscribe anytime.</p>'
    + '</div>';

  var container = document.createElement('div');
  container.innerHTML = popupHTML;
  document.body.appendChild(container);

  var popup = document.getElementById('fluxmail-popup');

  setTimeout(function() {
    if (popup) popup.style.display = 'block';
  }, ${popupDelay});

  function dismissPopup() {
    if (popup) popup.style.display = 'none';
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  document.getElementById('fluxmail-close').addEventListener('click', dismissPopup);

  document.getElementById('fluxmail-submit').addEventListener('click', function() {
    var emailInput = document.getElementById('fluxmail-email');
    var msgEl = document.getElementById('fluxmail-msg');
    var email = emailInput.value.trim();

    if (!email || email.indexOf('@') === -1) {
      msgEl.textContent = 'Please enter a valid email address.';
      msgEl.style.color = '#ef4444';
      return;
    }

    var btn = document.getElementById('fluxmail-submit');
    btn.textContent = 'Subscribing...';
    btn.disabled = true;

    fetch('https://fluxmail-silk.vercel.app/api/popup/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: '${storeId}', email: email, firstName: '' })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        msgEl.innerHTML = '\\ud83c\\udf89 You\\'re in! Check your inbox.';
        msgEl.style.color = '#16a34a';
        emailInput.style.display = 'none';
        btn.style.display = 'none';
        setTimeout(dismissPopup, 3000);
      } else {
        msgEl.textContent = data.error || 'Something went wrong.';
        msgEl.style.color = '#ef4444';
        btn.textContent = 'Subscribe & Get Discount';
        btn.disabled = false;
      }
    })
    .catch(function() {
      msgEl.textContent = 'Something went wrong. Try again.';
      msgEl.style.color = '#ef4444';
      btn.textContent = 'Subscribe & Get Discount';
      btn.disabled = false;
    });
  });
})();
`

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error: any) {
    return new NextResponse(`// error: ${error.message}`, {
      headers: { 'Content-Type': 'application/javascript' },
    })
  }
}
