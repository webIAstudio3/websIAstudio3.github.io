/* ══════════════════════════════════════════════════════════════════
   webAI Studio — Chat flotante  (chatbot-float.js)
   Pegar antes de </body>:  <script src="chatbot-float.js"></script>
   Requiere chat-widget.html en la misma carpeta.
   Opcional:
   <script>window.WebAIConfig={src:'chat-widget.html',color:'#C8FF00',pos:'right'};</script>
   ══════════════════════════════════════════════════════════════════ */
(function(){
  if(window.__webaiFloatLoaded) return; window.__webaiFloatLoaded=true;

  var cfg = Object.assign({src:'chat-widget.html', color:'#C8FF00', pos:'right'}, window.WebAIConfig||{});
  var side = cfg.pos==='left' ? 'left' : 'right';
  var open=false, teaserShown=false;

  /* ── estilos ── */
  var css =
  '@keyframes webaiJump{0%,100%{transform:translateY(0)}12%{transform:translateY(-14px)}24%{transform:translateY(0)}32%{transform:translateY(-7px)}40%{transform:translateY(0)}}' +
  '@keyframes webaiRing{0%{box-shadow:0 0 0 0 rgba(200,255,0,.45)}70%{box-shadow:0 0 0 18px rgba(200,255,0,0)}100%{box-shadow:0 0 0 0 rgba(200,255,0,0)}}' +
  '@keyframes webaiIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}' +
  '@keyframes webaiTease{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
  '#webai-fab{position:fixed;bottom:22px;'+side+':22px;width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;z-index:999990;' +
    'background:'+cfg.color+';color:#07080D;font-size:1.65rem;line-height:1;display:flex;align-items:center;justify-content:center;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.45);transition:transform .15s;animation:webaiJump 3.2s ease 2s infinite, webaiRing 3.2s ease 2s infinite}' +
  '#webai-fab:hover{transform:scale(1.08)}' +
  '#webai-fab.open{animation:none;font-size:1.25rem}' +
  '#webai-badge{position:absolute;top:2px;'+side+':2px;width:14px;height:14px;border-radius:50%;background:#FF6B6B;border:2px solid #07080D}' +
  '#webai-tease{position:fixed;bottom:96px;'+side+':22px;z-index:999990;max-width:240px;background:#0F1120;color:#F0F2FF;' +
    'border:1px solid rgba(200,255,0,.35);border-radius:14px;border-bottom-'+side+'-radius:4px;padding:.7rem .85rem;' +
    'font:500 .8rem/1.45 "DM Sans",system-ui,sans-serif;box-shadow:0 12px 35px rgba(0,0,0,.5);cursor:pointer;animation:webaiTease .35s ease}' +
  '#webai-tease b{color:'+cfg.color+'}' +
  '#webai-tease-x{position:absolute;top:-8px;'+(side==='right'?'left':'right')+':-8px;width:20px;height:20px;border-radius:50%;border:none;' +
    'background:#1F2340;color:#7A7D95;font-size:.7rem;cursor:pointer;line-height:1}' +
  '#webai-panel{position:fixed;bottom:98px;'+side+':22px;z-index:999991;width:382px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 120px);' +
    'border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 70px rgba(0,0,0,.6);' +
    'display:none;animation:webaiIn .28s ease;background:#07080D}' +
  '#webai-panel.open{display:block}' +
  '#webai-panel iframe{width:100%;height:100%;border:none;display:block;background:#07080D}' +
  '@media(max-width:480px){#webai-panel{bottom:0;'+side+':0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0}}' +
  '@media(prefers-reduced-motion:reduce){#webai-fab{animation:none!important}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ── botón flotante ── */
  var fab=document.createElement('button');
  fab.id='webai-fab'; fab.type='button';
  fab.setAttribute('aria-label','Abrir chat de webAI Studio');
  fab.innerHTML='💬<span id="webai-badge"></span>';
  document.body.appendChild(fab);

  /* ── burbuja de aviso (llama la atención) ── */
  var tease=document.createElement('div');
  tease.id='webai-tease'; tease.style.display='none';
  tease.innerHTML='👋 ¿Dudas? <b>Aquí resuelves todo</b> y eliges el plan ideal para tu negocio.<button id="webai-tease-x" aria-label="Cerrar aviso">✕</button>';
  document.body.appendChild(tease);
  setTimeout(function(){ if(!open){ tease.style.display='block'; teaserShown=true; } },2600);
  tease.addEventListener('click',function(e){ if(e.target.id==='webai-tease-x'){ tease.style.display='none'; e.stopPropagation(); return; } toggle(true); });

  /* ── panel con iframe ── */
  var panel=document.createElement('div'); panel.id='webai-panel';
  document.body.appendChild(panel);
  var frame=null;
  function mountFrame(){
    frame=document.createElement('iframe');
    frame.title='Chat webAI Studio';
    frame.src=cfg.src+(cfg.src.indexOf('?')>-1?'&':'?')+'float=1&t='+Date.now();
    panel.appendChild(frame);
  }

  function toggle(force){
    open = typeof force==='boolean' ? force : !open;
    if(open){
      tease.style.display='none';
      if(!frame) mountFrame();
      panel.classList.add('open');
      fab.classList.add('open');
      fab.innerHTML='✕';
      fab.setAttribute('aria-label','Cerrar chat');
    }else{
      panel.classList.remove('open');
      fab.classList.remove('open');
      fab.innerHTML='💬<span id="webai-badge"></span>';
      fab.setAttribute('aria-label','Abrir chat de webAI Studio');
    }
  }
  fab.addEventListener('click',function(){ toggle(); });

  /* Permite abrir el chat desde cualquier botón de la página: onclick="openWebAIChat()" */
  window.openWebAIChat  = function(){ toggle(true); };
  window.closeWebAIChat = function(){ toggle(false); };
  window.toggleWebAIChat= function(){ toggle(); };

  /* cerrar desde el ✕ interno del widget */
  window.addEventListener('message',function(e){ if(e.data==='webai-close') toggle(false); });

  /* si el admin guarda cambios (misma web), recargar el chat cerrado para que tome la config nueva */
  window.addEventListener('storage',function(e){
    if(e.key==='webai_state' && frame && !open){ frame.src=cfg.src+(cfg.src.indexOf('?')>-1?'&':'?')+'float=1&t='+Date.now(); }
  });
})();
