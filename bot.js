// ══════════════════════════════════════════════════════════════════
//  webAI Studio — Bot de WhatsApp "Cerrador de Ventas"  (bot.js)
//  Recibe los leads que llegan desde el chat de la página,
//  cierra la venta, envía cuentas de pago, detecta el pago y
//  te notifica. Preguntas fuera de guion → Claude. Si Claude no
//  puede → te avisa que hay un cliente esperando asesor real.
//
//  Uso:  npm install   →   node bot.js   →   escanear QR con tu cel
// ══════════════════════════════════════════════════════════════════
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const CFG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const OWNER = CFG.miNumero.replace(/\D/g, '') + '@c.us';

// ── Sesiones persistentes (cada cliente tiene su estado) ──────────
const SFILE = './sessions.json';
let S = {};
try { S = JSON.parse(fs.readFileSync(SFILE, 'utf8')); } catch (e) { S = {}; }
const saveS = () => fs.writeFileSync(SFILE, JSON.stringify(S, null, 2));
const ses = id => (S[id] = S[id] || { etapa: 'nuevo', nombre: '', negocio: '', plan: null, historial: [], avisadoPago: false, avisadoAsesor: false });

// ── Planes ─────────────────────────────────────────────────────────
const PLANES = CFG.planes;
const detectarPlan = t => {
  t = t.toLowerCase();
  if (t.includes('pro') || t.includes('ia') || t.includes('1.6') || t.includes('1600')) return 'pro';
  if (t.includes('crecimiento') || t.includes('890')) return 'crecimiento';
  if (t.includes('lanzamiento') || t.includes('490')) return 'lanzamiento';
  return null;
};

// ── Copys de venta (cerrador) ──────────────────────────────────────
const M = {
  bienvenidaLead: (n, p) =>
`¡Hola ${n}! 👋 Qué gusto tenerte aquí. Soy tu asesor de *webAI Studio* y acabo de revisar tu diagnóstico ✅

Tomaste una gran decisión: el *${p.nombre}* (${p.precio} COP) es exactamente lo que tu negocio necesita para empezar a generar clientes desde internet 🚀

Mira lo que vas a recibir:
${p.beneficios.map(b => '✓ ' + b).join('\n')}

Y ojo a esto 👇
🎁 *Si confirmas hoy*, congelamos el precio actual y tu proyecto entra de inmediato a producción: tu web estaría lista en *5 días*.

¿Aseguramos tu cupo de esta semana? Responde *SÍ* y te paso los datos de pago en un segundo 💳`,

  bienvenidaGeneral: n =>
`¡Hola${n ? ' ' + n : ''}! 👋 Bienvenido a *webAI Studio* — creamos páginas web con IA que venden desde el día 1.

Estos son nuestros planes (pago único):
🚀 *Lanzamiento* — $490.000: landing profesional lista en 5 días
📈 *Crecimiento* — $890.000: web completa + pagos + SEO (el más vendido ⭐)
🤖 *Pro + IA* — $1.600.000: todo + chatbot IA + tienda online + automatización

Más de *120 negocios* ya venden con nosotros y la satisfacción es del 100%.

¿Cuál te interesa? Escribe *Lanzamiento*, *Crecimiento* o *Pro* y te cuento cómo arrancamos hoy mismo 😉`,

  cierre: p =>
`¡Excelente decisión! 🎉 Acabas de dar el paso que separa a los negocios que esperan de los que *venden*.

Estos son los datos para tu pago de *${p.nombre}* — *${p.precio} COP*:

${CFG.pagos.map(pg => `💳 *${pg.metodo}*\n${pg.datos}`).join('\n\n')}

📌 Apenas hagas el pago, envíame aquí mismo el *comprobante (foto o pantallazo)* y tu proyecto entra HOY a la fila de producción. En 5 días tu negocio está en internet generando clientes 🚀

Te espero con el comprobante para reservar tu cupo 🙌`,

  objecionPrecio: p =>
`Te entiendo perfectamente, y justo por eso quiero que lo veas así 👇

${p.precio} no es un gasto: es *menos de lo que pierdes cada mes sin presencia en internet*. Nuestros clientes recuperan la inversión en sus *primeras ventas* — como Marcela, que en su primera semana vendió más que en todo el mes anterior por redes 📈

Además es *pago único*: dominio, hosting, diseño y soporte incluidos. Sin mensualidades escondidas.

Y hoy puedo dividirlo: *50% para iniciar y 50% contra entrega*. Así arrancas ya, sin presión. ¿Te paso los datos de pago? 💪`,

  objecionPensar: () =>
`¡Claro, es una decisión importante! Solo ten en cuenta esto 👇

Cada día sin web son clientes que te buscan en Google… y encuentran a tu competencia 😬 Por eso solo tomamos *cupos limitados por semana* para garantizar la entrega en 5 días.

Te propongo algo sin riesgo: aseguras tu cupo hoy con el *50%*, y si en la revisión no te encanta el diseño, lo ajustamos hasta que quedes 100% satisfecho — está garantizado ✅

¿Reservamos tu cupo de esta semana? 😉`,

  pagoRecibido: n =>
`🎉 ¡Comprobante recibido, ${n || 'crack'}! *¡Bienvenido oficialmente a webAI Studio!* 🥳

Tu proyecto ya entró a producción. Próximos pasos:
1️⃣ Validamos tu pago (máx. 1 hora)
2️⃣ Te contacta tu diseñadora asignada hoy mismo
3️⃣ En *5 días* tu web está en vivo vendiendo 🚀

Prepárate, porque tu negocio está a punto de cambiar de nivel 💚`,

  asesorEnCamino: () =>
`¡Buena pregunta! 🙌 Le acabo de pasar tu caso a un *asesor humano* del equipo para darte una respuesta exacta. Te escribe por aquí en unos minutos.

Mientras tanto, ¿hay algo más del plan en lo que te pueda ayudar? 😊`
};

// ── Notificaciones a tu número ─────────────────────────────────────
async function notificar(client, texto) {
  try { await client.sendMessage(OWNER, texto); } catch (e) { console.log('No pude notificar:', e.message); }
}

// ── Claude: respuestas fuera de guion ──────────────────────────────
async function preguntarClaude(s, pregunta) {
  if (!CFG.claudeApiKey || !CFG.claudeApiKey.startsWith('sk-ant')) return null;
  const system =
`Eres el mejor vendedor del mundo trabajando como asesor de webAI Studio (Armenia, Colombia). Creamos páginas web con IA. Planes (pago único COP): Lanzamiento $490.000 (landing 1 página, dominio+hosting 1 año, WhatsApp, entrega 5 días), Crecimiento $890.000 (5 secciones, pasarela de pagos, SEO, Analytics, 3 meses soporte), Pro+IA $1.600.000 (chatbot IA, tienda online, email marketing, automatización, 6 meses soporte). Métodos de pago: ${CFG.pagos.map(p => p.metodo).join(', ')}.
Tu objetivo: resolver la duda y cerrar la venta con persuasión elegante (beneficios, urgencia suave, prueba social: +120 negocios, satisfacción 100%, entrega 5 días). Español colombiano cercano, máximo 4 frases, emojis con moderación, termina siempre invitando a avanzar al pago.
Cliente: ${s.nombre || 'desconocido'} | Negocio: ${s.negocio || '—'} | Plan de interés: ${s.plan ? PLANES[s.plan].nombre : 'ninguno aún'}.
REGLA CRÍTICA: si no sabes la respuesta con certeza, si piden algo fuera de estos servicios, descuentos no autorizados, datos legales/técnicos que no tienes, o piden hablar con una persona, responde EXACTAMENTE y solo: [ASESOR]`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': CFG.claudeApiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', max_tokens: 400, system,
        messages: [...s.historial.slice(-8), { role: 'user', content: pregunta }]
      })
    });
    const d = await r.json();
    const out = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return out || null;
  } catch (e) { console.log('Error Claude:', e.message); return null; }
}

// ── Detección de intenciones ───────────────────────────────────────
const tiene = (t, arr) => arr.some(w => t.includes(w));
const INT = {
  si:      ['sí', 'si quiero', 'dale', 'de una', 'listo quiero', 'acepto', 'confirmo', 'hagamoslo', 'hagámoslo', 'me interesa', 'quiero el plan', 'si,', 'si '],
  pago:    ['ya pagué', 'ya pague', 'pagué', 'pague', 'transferí', 'transferi', 'consigné', 'consigne', 'comprobante', 'ya hice el pago', 'pago realizado', 'envié el pago', 'envie el pago', 'listo el pago'],
  precio:  ['caro', 'costoso', 'muy alto', 'descuento', 'rebaja', 'más barato', 'mas barato', 'precio'],
  pensar:  ['lo pienso', 'pensarlo', 'después', 'despues', 'luego', 'más adelante', 'mas adelante', 'no estoy segur', 'dudo'],
  humano:  ['asesor', 'persona real', 'humano', 'alguien real', 'una persona', 'hablar con alguien'],
  cuentas: ['cuenta', 'pagar', 'datos de pago', 'nequi', 'bancolombia', 'daviplata', 'cómo pago', 'como pago', 'donde pago', 'dónde pago']
};

// ══════════════════════════════════════════════════════════════════
//  CLIENTE WHATSAPP
// ══════════════════════════════════════════════════════════════════
const client = new Client({ authStrategy: new LocalAuth(), puppeteer: { args: ['--no-sandbox'] } });

client.on('qr', qr => { console.log('\n📱 Escanea este QR con WhatsApp (Dispositivos vinculados):\n'); qrcode.generate(qr, { small: true }); });
client.on('ready', () => console.log('\n✅ Bot webAI Studio conectado y cerrando ventas 24/7\n'));

client.on('message', async msg => {
  if (msg.from.endsWith('@g.us') || msg.from === 'status@broadcast') return; // ignora grupos/estados
  if (msg.from === OWNER) return; // no se responde a sí mismo

  const s = ses(msg.from);
  const texto = (msg.body || '').trim();
  const t = texto.toLowerCase();
  const responder = async out => { await msg.reply(out); s.historial.push({ role: 'user', content: texto || '[imagen]' }, { role: 'assistant', content: out }); saveS(); };

  // ── 1) Lead que llega desde la página web ──
  if (s.etapa === 'nuevo' && t.includes('acabo de completar el chat')) {
    const mN = texto.match(/soy\s+(.+?)\s+y\s+acabo/i);
    const mB = texto.match(/negocio\s+(.+?)\.?$/i);
    if (mN) s.nombre = mN[1].trim();
    if (mB) s.negocio = mB[1].trim();
    s.plan = detectarPlan(texto) || 'crecimiento';
    s.etapa = 'cerrando';
    await notificar(client, `🟢 *NUEVO LEAD DESDE LA WEB*\n👤 ${s.nombre || msg.from}\n🏪 ${s.negocio || '—'}\n📦 ${PLANES[s.plan].nombre}\n📲 wa.me/${msg.from.replace('@c.us', '')}`);
    return responder(M.bienvenidaLead(s.nombre || '', PLANES[s.plan]));
  }

  // ── 2) Comprobante de pago (imagen o palabras de pago) ──
  if ((msg.hasMedia && (s.etapa === 'pago' || s.etapa === 'cerrando')) || tiene(t, INT.pago)) {
    s.etapa = 'pagado';
    if (!s.avisadoPago) {
      s.avisadoPago = true;
      await notificar(client, `💰 *¡PAGO RECIBIDO!* 🎉\n👤 ${s.nombre || msg.from}\n🏪 ${s.negocio || '—'}\n📦 ${s.plan ? PLANES[s.plan].nombre + ' · ' + PLANES[s.plan].precio : '—'}\n📲 wa.me/${msg.from.replace('@c.us', '')}\n\n⚠️ Verifica el comprobante y confirma al cliente.`);
    }
    return responder(M.pagoRecibido(s.nombre));
  }

  // ── 3) Primer contacto sin venir de la web ──
  if (s.etapa === 'nuevo') {
    s.etapa = 'explorando';
    const p = detectarPlan(t);
    if (p) { s.plan = p; s.etapa = 'cerrando'; return responder(M.bienvenidaLead(s.nombre || '', PLANES[p])); }
    return responder(M.bienvenidaGeneral(s.nombre));
  }

  // ── 4) Eligió plan por nombre ──
  const pElegido = detectarPlan(t);
  if (pElegido && s.etapa !== 'pagado') {
    s.plan = pElegido; s.etapa = 'cerrando';
    return responder(M.bienvenidaLead(s.nombre || '', PLANES[pElegido]));
  }

  // ── 5) Dijo SÍ o pidió cuentas → enviar datos de pago ──
  if (s.plan && s.etapa !== 'pagado' && (tiene(t, INT.si) || tiene(t, INT.cuentas))) {
    s.etapa = 'pago';
    return responder(M.cierre(PLANES[s.plan]));
  }

  // ── 6) Objeciones clásicas ──
  if (s.plan && tiene(t, INT.precio)) return responder(M.objecionPrecio(PLANES[s.plan]));
  if (tiene(t, INT.pensar)) return responder(M.objecionPensar());

  // ── 7) Pide humano directamente ──
  if (tiene(t, INT.humano)) {
    if (!s.avisadoAsesor) { s.avisadoAsesor = true; await notificar(client, `👤 *CLIENTE PIDE ASESOR REAL*\n${s.nombre || msg.from} — "${texto.slice(0, 120)}"\n📲 wa.me/${msg.from.replace('@c.us', '')}`); }
    return responder(M.asesorEnCamino());
  }

  // ── 8) Pregunta fuera de guion → Claude ──
  const ia = await preguntarClaude(s, texto);
  if (ia && !ia.includes('[ASESOR]')) return responder(ia);

  // ── 9) Claude no pudo → notificar asesor real ──
  await notificar(client, `🔔 *CLIENTE ESPERANDO ASESOR REAL*\n👤 ${s.nombre || msg.from}\n❓ "${texto.slice(0, 160)}"\n📲 wa.me/${msg.from.replace('@c.us', '')}\n\nResponde tú directamente en ese chat.`);
  s.avisadoAsesor = true; saveS();
  return responder(M.asesorEnCamino());
});

client.initialize();
