# webAI Studio — Landing Page

Página web de presentación de servicios para **webAI Studio**, un negocio especializado en crear páginas web con IA y diseño profesional para emprendedores y empresas que quieren vender en internet desde el día 1.

---

## Estructura del proyecto

```
webai-studio/
└── index.html      ← Página completa (HTML + CSS + JS en un solo archivo)
```

No requiere instalación ni dependencias locales. Solo abre `index.html` en cualquier navegador.

---

## Secciones de la página

| Sección | Descripción |
|---|---|
| **Nav** | Navegación fija con menú responsive (hamburger en móvil) |
| **Hero** | Titular principal + mockup de browser con métricas en vivo |
| **Marquee** | Banda animada con todos los servicios disponibles |
| **Servicios** | Mosaico de 6 servicios: landing pages, tienda online, chatbot IA, diseño, SEO, integraciones |
| **Resultados** | 4 métricas clave: 5 días de entrega, +3x consultas, 120+ negocios, 100% satisfacción |
| **Cómo funciona** | Proceso de 4 pasos: Diagnóstico → Diseño → Revisión → Publicación |
| **Entregables** | Grilla con los 12 elementos incluidos en todo proyecto |
| **Testimonios** | 3 reseñas de clientes ficticios con nombre y tipo de negocio |
| **Precios** | 3 planes en COP: Lanzamiento ($490K), Crecimiento ($890K), Pro + IA ($1.6M) |
| **CTA final** | Llamado a la acción con botón a WhatsApp y correo |
| **Footer** | Logo, links de navegación, copyright |

---

## Personalización

### Colores
Todos los colores están definidos como variables CSS al inicio del archivo, dentro de `:root {}`:

```css
:root {
  --lime:   #C8FF00;   /* Color principal de acento */
  --sky:    #4FC3F7;   /* Azul — plan Lanzamiento */
  --violet: #7C5CFC;   /* Violeta — plan Pro */
  --coral:  #FF6B6B;   /* Coral — precios */
  --amber:  #FFB347;   /* Ámbar — testimonios / resultados */
  --mint:   #00E5A0;   /* Menta — integraciones */
}
```

Cambia cualquier valor hexadecimal y el cambio se aplica automáticamente en toda la página.

### Textos y contenido
Busca y reemplaza directamente en el HTML:

- **Nombre del negocio:** busca `webAI Studio` y `webAI` / `studio`
- **Teléfono WhatsApp:** busca `573000000000` en el href del botón CTA y reemplaza por tu número (formato internacional sin `+`)
- **Correo:** busca `hola@webai.studio` y reemplaza por tu correo real
- **Precios:** busca `$490K`, `$890K`, `$1.6M` para actualizar tarifas
- **Ciudad:** busca `Armenia, Colombia` para cambiar la ubicación en el footer

### Fuentes
La página usa dos fuentes de Google Fonts cargadas en el `<head>`:
- **Clash Display** — titulares y headings
- **Bricolage Grotesque** — cuerpo de texto

Puedes reemplazarlas por cualquier otra fuente de Google Fonts cambiando el `<link>` en el `<head>` y actualizando las variables `--font-head` y `--font-body`.

---

## Tecnologías usadas

- HTML5 semántico
- CSS3 puro (variables, Grid, Flexbox, animaciones)
- JavaScript vanilla (scroll reveal + menú mobile)
- Google Fonts (cargadas desde CDN, requiere internet)

Sin frameworks. Sin dependencias. Sin build process.

---

## Cómo publicar

### Opción 1 — Netlify Drop (más fácil, gratis)
1. Ve a [netlify.com/drop](https://netlify.com/drop)
2. Arrastra el archivo `index.html` al área indicada
3. Tu página queda publicada en segundos con una URL pública

### Opción 2 — GitHub Pages (gratis)
1. Crea un repositorio en GitHub
2. Sube el `index.html` en la raíz del repo
3. Ve a **Settings → Pages → Branch: main → Save**
4. Tu página queda en `https://tuusuario.github.io/nombre-repo`

### Opción 3 — Hosting tradicional (cPanel / FTP)
1. Conéctate al hosting por FTP o el administrador de archivos
2. Sube `index.html` a la carpeta `public_html` o `www`
3. Apunta tu dominio a esa carpeta

---

## Notas

- El botón **"Consulta gratuita"** apunta a WhatsApp Web. Reemplaza el número antes de publicar.
- Los testimonios y métricas son **ficticios** — reemplázalos con datos reales de tus clientes cuando los tengas.
- La página carga fuentes desde Google Fonts, por lo que requiere conexión a internet para verse correctamente. Si necesitas una versión completamente offline, descarga las fuentes y referéncialas localmente.
- El menú hamburger en mobile funciona con JS puro, sin librerías externas.

---

Hecho con IA + diseño por **webAI Studio** · Armenia, Quindío, Colombia
