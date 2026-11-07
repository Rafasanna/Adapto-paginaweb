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
| `/` | Hoja cuadriculada con logo + bienvenida e ilustración de hojas, banner de temas, temas con íconos, destacados, cómo comprar, para quién, adelanto de Nosotras, preguntas frecuentes |
| `/productos` | Catálogo. Botón "Filtros" que abre un panel (lateral en desktop, hoja desde abajo en mobile) con categoría, tema y para quién; chips de filtros activos y orden. Todo queda en la URL (`?tema=escritura&para=ninos`) para poder compartir el link |
| `/productos/[slug]` | Detalle: carrusel de páginas, nombre, precio, descripción, cantidad, agregar al carrito, pedir por WhatsApp, relacionados |

El buscador está en el header: en `/productos` filtra mientras escribís; desde otra página, Enter lleva a `/productos?q=...`.
Los links viejos `/recursos` y `/recursos/[slug]` redirigen a `/productos`.
| `/nosotras` | Azu y Jaz, con fotos |

## Estructura

```text
app/(site)/                 Páginas públicas (layout con header, footer y carrito)
components/site/            Header (con buscador), Footer, Logo, íconos propios (TopicIcon, StepIcon), trazos (Doodles) e ilustración del inicio (HeroSheets)
components/shop/            Carrito (CartProvider, CartDrawer), ProductCard, PagePreview, Catalog (con panel de filtros)...
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

- Fondos: blanco y **tiza** `#F8FAE8` (`crema` en `tailwind.config.js`).
- Botones y opciones activas: como las letras "T" y "O" del logo, relleno `#9AD7C4` con contorno `#83C0AE` y texto oscuro.
- Los otros colores del logo (violeta, rosa, verde, amarillo) aparecen en el logo, en los íconos de cada tema, en los puntitos de la franja del inicio y en las franjas del header y del footer.
- Íconos de línea fina (lucide), sobrios: sirven para niños, adolescentes y adultos.
- Tipografía: **Outfit** (geométrica, de la familia de Codec Pro, la del "Recursos digitales").
- Sin emojis, dibujitos ni cuadrículas: el inicio es el logo sobre blanco.
- Botón fijo de WhatsApp abajo a la derecha (`components/site/WhatsAppFloat.jsx`); el mensaje predeterminado está en `config/site.js` → `contact.whatsappMessage`.

## Carrito y pedido

- El carrito se guarda en el navegador (`localStorage`) y se sincroniza entre pestañas.
- Se puede sumar más de una unidad desde el detalle o desde el carrito.
- "Enviar pedido por WhatsApp" abre `wa.me/5493446525525` con este mensaje:

```text
Hola, ADAPTO. Quiero hacer este pedido:

• 3 x Trazos y grafismos ($ 4.500 c/u) → $ 13.500
• 1 x Mi rutina de la mañana y la noche → $ 3.500

Unidades: 4
*Total: $ 17.000*

Mi nombre es Rafa.
¿Cómo sigo con el pago? Gracias.
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

## Admin

Panel en `/admin` para que Azu y Jaz carguen y editen productos.

- **Ingreso:** email y contraseña. Contraseñas con bcrypt, sesión de 8 h guardada en la base (solo el hash del token) y cookie `httpOnly` firmada con `AUTH_SECRET`. Después de 5 intentos fallidos por email (o 20 por IP) se bloquea 15 minutos.
- **Productos:** crear, editar, ocultar/mostrar, destacar y borrar. Toda la validación se hace en el servidor (`lib/server/products.js`). Al guardar, la tienda se actualiza sola.
- **Vista previa desde el PDF:** se elige el PDF, se marcan las páginas a mostrar y se generan en el navegador con pdf.js, con marca de agua "ADAPTO · vista previa". **El PDF nunca se sube:** a Cloudinary solo van esas imágenes (carpeta `adapto/productos`). La API solo acepta imágenes de esa carpeta de nuestra cuenta.
- También se pueden subir imágenes sueltas (JPG, PNG, WebP).

### Crear una usuaria

```bash
npm run create-admin -- email@ejemplo.com "Azu"
```
Pide la contraseña dos veces (no se ve al escribir y no queda en el historial). Mínimo 10 caracteres. Si el email ya existe, le cambia la contraseña.

### Variables (en `.env.local` y en Vercel)

`DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`. Ver `.env.example`.

## Próximos pasos

- Descripciones de Azu y Jaz (`config/site.js` → `team[].bio`).
- Borrar de Cloudinary las imágenes de un producto borrado (hoy quedan guardadas, no se ven en la tienda).
