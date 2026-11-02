# ADAPTO · Recursos digitales

Tienda de recursos terapéuticos para imprimir de Azu y Jaz (Lic. en Terapia Ocupacional).
El cliente elige recursos, suma unidades al carrito y envía el pedido por WhatsApp con el detalle de valores.

## Stack



- **Next.js 16** (App Router, JavaScript) + React 19
- **Tailwind CSS 3**
- **Neon** (Postgres serverless) para el catálogo
- Imágenes de las páginas desde **Cloudinary** (loader en `lib/imageLoader.js`)
- Deploy en **Vercel**

## Páginas

| Ruta | Qué tiene |
| --- | --- |
| `/` | Logo + bienvenida, banner de temas, temas con íconos, destacados, cómo comprar, para quién, adelanto de Nosotras, preguntas frecuentes |
| `/recursos` | Catálogo con filtros: categoría, tema (subcategoría), para quién, búsqueda y orden. Los filtros quedan en la URL (`?tema=escritura&para=ninos`) para poder compartir el link |
| `/recursos/[slug]` | Detalle: carrusel de páginas, nombre, precio, descripción, cantidad, agregar al carrito, pedir por WhatsApp, relacionados |
| `/nosotras` | Azu y Jaz, con fotos |

## Estructura

```text
app/(site)/                 Páginas públicas (layout con header, footer y carrito)
components/site/            Header, Footer, Logo, íconos propios (TopicIcon, StepIcon, Doodles)
components/shop/            Carrito (CartProvider, CartDrawer), ProductCard, PagePreview, Catalog...
config/site.js              Textos de bienvenida, equipo, WhatsApp, menú
config/catalog.js           Categorías y subcategorías (con color e ícono)
data/demo-products.js       Productos de EJEMPLO (solo sin base conectada)
lib/server/catalog.js       Lee el catálogo de Neon (o el ejemplo si no hay base)
lib/whatsapp.js             Arma el mensaje del pedido
docs/neon-schema.sql        Esquema de la base (catálogo + tablas del admin)
public/brand/               Logo en SVG (vector exacto del PDF de marca)
public/equipo/              Fotos de Azu y Jaz
```

## Identidad

- Colores del logo: violeta `#CB6CE6`, rosa `#FF66C4`, verde `#B1D782`, amarillo `#FFDE59`, verde agua `#9AD7C4`. Cada uno tiene su borde más oscuro (como las letras del logo), un fondo suave y un tono para texto. Ver `tailwind.config.js`.
- Fondo crema `#F8F3EA` y gris `#737373`, tomados del PDF.
- Tipografía: **Outfit** (geométrica, de la familia de Codec Pro, la del "Recursos digitales").
- Íconos propios por tema con el estilo del logo: relleno pastel + contorno del mismo tono.

## Carrito y pedido

- El carrito se guarda en el navegador (`localStorage`) y se sincroniza entre pestañas.
- Se puede sumar más de una unidad desde el detalle o desde el carrito.
- "Enviar pedido por WhatsApp" abre `wa.me/5493446525525` con este mensaje:

```text
¡Hola ADAPTO! 👋 Quiero hacer este pedido:

• 3 x Trazos y grafismos ($ 4.500 c/u) → $ 13.500
• 1 x Mi rutina de la mañana y la noche → $ 3.500

Unidades: 4
*Total: $ 17.000*

Mi nombre es Rafa.
¿Cómo sigo con el pago? ¡Gracias!
```

El número se cambia en `config/site.js`.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Sin `DATABASE_URL` el sitio muestra **productos de ejemplo** y un aviso arriba ("Vista previa"). Apenas se conecta la base, se usan solo los productos reales.

### Conectar Neon

1. Copiar la connection string de Neon en `DATABASE_URL` (`.env.local` y en Vercel).
2. Crear las tablas y cargar categorías/subcategorías: `npm run db:schema` (o pegar `docs/neon-schema.sql` en el SQL Editor de Neon).
3. Cargar productos (por ahora a mano en Neon; después desde el admin). Campos clave de `products`:
   - `name`, `slug`, `short_description`, `description`, `price` (en pesos, sin decimales)
   - `category_id` / `subcategory_id`
   - `previews`: `[{"url": "https://res.cloudinary.com/.../pagina-1.jpg", "alt": "Página 1"}, ...]` — la primera es la portada y el resto pasan en el carrusel
   - `audiences`: `{ninos,adolescentes,adultos}`
   - `page_count`, `featured`, `visible`, `sort_order`

## Próximos pasos

- Admin en `/admin` (mismo esquema de usuarios y sesiones que Cofi Lab, las tablas ya están en el SQL): ABM de productos, subida de páginas a Cloudinary, orden y destacados.
- Generar la vista previa automáticamente a partir del PDF (primeras páginas → imágenes).
- Descripciones de Azu y Jaz (`config/site.js` → `team[].bio`).
- Instagram (`config/site.js` → `contact.instagram`).
