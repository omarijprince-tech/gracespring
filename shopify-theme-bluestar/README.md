# Blue Star — Shopify theme

Diseño del sitio de Grace Spring (paleta, tipografías Poppins/Inter/Anton/Yellowtail,
encabezado, hero, tarjetas de ofertas, grilla de productos, "cómo funciona",
sección de entregas con verificador de ZIP, FAQ, pie de página y carrito lateral)
portado a un tema Online Store 2.0 para **blue-star-pure-water.myshopify.com**.

Por ahora es **solo diseño**. El carrito y el pago son los nativos de Shopify.
Las funciones propias de Grace Spring (cambio entre pedido único y mensual, ventana
del dispensador con 5 botellas gratis, depósito automático, recordatorios mensuales)
se agregan después.

## Instalar

1. Comprime esta carpeta: `cd shopify-theme-bluestar && zip -r ../bluestar-theme.zip . -x README.md`
   (o usa `bluestar-theme.zip` si ya está generado).
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
3. El tema se sube **sin publicar**. Usa **Customize** para revisarlo y **Publish** cuando esté listo.

O con Shopify CLI: `shopify theme push --unpublished --store blue-star-pure-water`.

## Configurar en Customize

- **Theme settings → Brand**: logo, nombre ("BLUE STAR"), lema, teléfono.
- **Theme settings → Colors**: azules de Blue Star por defecto. La estructura es la
  misma paleta de Grace Spring, así que cualquier color se cambia en un solo lugar.
- **Theme settings → Products**: los productos con la etiqueta `deposit` muestran
  el distintivo "+ $5 deposit".
- **Menú principal** (Online Store → Navigation → `main-menu`): para que funcione
  igual que Grace Spring, usa enlaces `/#shop`, `/#offers`, `/#how`, `/#delivery`, `/#faq`.
- **Contacto**: crea una página "Contact" y asígnale la plantilla `page.contact`.
- **Español**: activa el español en Settings → Languages; aparece el botón EN/ES en
  el encabezado. Los textos de la tienda ya están traducidos (`locales/es.json`); los textos
  de las secciones se traducen con la app Translate & Adapt.

## Estructura

- `assets/base.css`: hojas de estilo de Grace Spring (`app/globals.css`) + estilos para producto, colección, carrito y cuenta.
- `assets/theme.js`: menú, cantidad, verificador de ZIP, variantes y carrito lateral (AJAX Cart API).
- `sections/`: `hero`, `offers`, `featured-collection`, `how-it-works`, `delivery`, `faq`, `rich-text`
  y las secciones `main-*` de cada página.
- `templates/index.json`: página de inicio con el mismo orden y los mismos textos que Grace Spring, adaptados a Blue Star.
