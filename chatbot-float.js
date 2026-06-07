/*!
 * webAI Studio — Floating Chat Widget v2.0
 * ─────────────────────────────────────────
 * Uso básico: <script src="chatbot-float.js"></script>
 *
 * Personalizar (antes del script):
 *   window.WebAIConfig = { src:'chat-widget.html', color:'#C8FF00', pos:'right' };
 */
(function (w, d) {
  'use strict';

  /* ── CONFIG ────────────────────────────── */
  var cfg   = w.WebAIConfig || {};
  var SRC   = cfg.src   || 'chat-widget.html';
  var COLOR = cfg.color || '#C8FF00';
  var POS   = cfg.pos   || 'right';          // 'right' | 'left'
  var RIGHT = POS === 'right' ? '20px' : 'auto';
  var LEFT  = POS === 'left'  ? '20px' : 'auto';

  var isOpen = false, hasOpened = false;

  /* ── CSS ────────────────────────────────── */
  var css = d.createElement('style');
  css.textContent =
    /* Chat iframe wrapper */
    '#wai-wrap{' +
      'position:fixed;' +
      'bottom:88px;' +
      'right:' + RIGHT + ';' +
      'left:' + LEFT + ';' +
      'width:370px;height:790px;' +
      'z-index:99998;' +
      'opacity:0;' +
      'transform:translateY(20px) scale(.97);' +
      'pointer-events:none;' +
      'transition:opacity .3s cubic-bezier(.4,0,.2,1),' +
                 'transform .3s cubic-bezier(.4,0,.2,1);' +
    '}' +
    '#wai-wrap.wai-open{' +
      'opacity:1;transform:translateY(0) scale(1);pointer-events:all;' +
    '}' +
    '#wai-iframe{' +
      'width:100%;height:100%;border:none;' +
      'border-radius:18px;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.45),' +
                 '0 0 0 1px rgba(255,255,255,.06);' +
    '}' +

    /* Toggle button */
    '#wai-btn{' +
      'position:fixed;' +
      'bottom:20px;' +
      'right:' + RIGHT + ';' +
      'left:' + LEFT + ';' +
      'z-index:99999;' +
      'width:56px;height:56px;border-radius:50%;' +
      'background:' + COLOR + ';color:#07080D;' +
      'border:none;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:1.4rem;line-height:1;' +
      'box-shadow:0 4px 20px rgba(200,255,0,.4),' +
                 '0 2px 8px rgba(0,0,0,.35);' +
      'transition:transform .2s,box-shadow .2s;' +
      'font-family:sans-serif;' +
    '}' +
    '#wai-btn:hover{' +
      'transform:scale(1.1);' +
      'box-shadow:0 6px 28px rgba(200,255,0,.55);' +
    '}' +

    /* Notification badge */
    '#wai-badge{' +
      'position:fixed;' +
      'bottom:62px;' +
      'right:' + (POS === 'right' ? '14px' : 'auto') + ';' +
      'left:'  + (POS === 'left'  ? '14px' : 'auto') + ';' +
      'z-index:100000;' +
      'background:#FF6B6B;color:#fff;' +
      'border-radius:50%;' +
      'width:20px;height:20px;' +
      'font-size:.65rem;font-weight:700;' +
      'display:none;align-items:center;justify-content:center;' +
      'border:2px solid #fff;' +
      'animation:waipulse 2s ease-in-out infinite;' +
    '}' +
    '@keyframes waipulse{' +
      '0%,100%{transform:scale(1)}' +
      '50%{transform:scale(1.2)}' +
    '}' +

    /* Mobile: full-width bottom sheet */
    '@media(max-width:480px){' +
      '#wai-wrap{' +
        'bottom:76px;right:0;left:0;' +
        'width:100%;height:88vh;' +
      '}' +
      '#wai-iframe{border-radius:16px 16px 0 0;}' +
      '#wai-btn{right:16px;left:auto;}' +
      '#wai-badge{right:10px;left:auto;}' +
    '}';

  d.head.appendChild(css);

  /* ── DOM ────────────────────────────────── */
  /* iframe wrapper */
  var wrap  = d.createElement('div');
  wrap.id   = 'wai-wrap';

  var frame = d.createElement('iframe');
  frame.id  = 'wai-iframe';
  frame.src = SRC;
  frame.setAttribute('allow', 'clipboard-write');
  frame.setAttribute('title', 'Chat con nosotros');
  frame.setAttribute('loading', 'lazy');
  wrap.appendChild(frame);

  /* toggle button */
  var btn = d.createElement('button');
  btn.id  = 'wai-btn';
  btn.setAttribute('aria-label', 'Abrir chat');
  btn.setAttribute('title', 'Chatea con nosotros');
  btn.innerHTML = '<span id="wai-ico">💬</span>';

  /* badge */
  var badge = d.createElement('div');
  badge.id  = 'wai-badge';
  badge.textContent = '1';
  badge.setAttribute('aria-label', '1 mensaje nuevo');

  /* ── TOGGLE LOGIC ───────────────────────── */
  btn.addEventListener('click', function () {
    isOpen = !isOpen;

    if (isOpen) {
      wrap.classList.add('wai-open');
      d.getElementById('wai-ico').textContent = '✕';
      btn.style.fontSize = '1.2rem';
      badge.style.display = 'none';
      hasOpened = true;
    } else {
      wrap.classList.remove('wai-open');
      d.getElementById('wai-ico').textContent = '💬';
      btn.style.fontSize = '1.4rem';
    }
  });

  /* ── ATTENTION BADGE after 3s ───────────── */
  setTimeout(function () {
    if (!hasOpened) {
      badge.style.display = 'flex';
    }
  }, 3000);

  /* ── CLOSE ON OUTSIDE CLICK (optional) ─── */
  d.addEventListener('click', function (e) {
    if (isOpen && !wrap.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      // Uncomment the lines below to enable close-on-outside-click:
      // wrap.classList.remove('wai-open');
      // d.getElementById('wai-ico').textContent = '💬';
      // btn.style.fontSize = '1.4rem';
      // isOpen = false;
    }
  });

  /* ── MOUNT ──────────────────────────────── */
  function mount() {
    d.body.appendChild(wrap);
    d.body.appendChild(btn);
    d.body.appendChild(badge);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})(window, document);
