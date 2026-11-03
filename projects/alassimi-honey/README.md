# Al-Assimi Yemeni Honey | العصيمي للعسل اليمني

A responsive static storefront made with HTML, CSS and vanilla JavaScript. No framework, build step, or server required.

## Open locally
1. Extract the ZIP.
2. Open `index.html` directly in a browser. Product cards, language/theme preferences and cart work client-side.
3. Product photos are remote Unsplash images; an internet connection is needed for those photos and Google Fonts. Replace them with local assets for fully offline use.

## Deploy
- **Netlify:** drag the extracted `alassimi-honey` folder into Netlify Drop.
- **Vercel:** import the folder/repository as a static project; no build command, output directory is the project root.
- **GitHub Pages:** upload the contents to a repository and enable Pages for the branch/root.
- **cPanel:** upload the contents into `public_html` (or the chosen domain folder).

## Edit products and prices
Edit the `PRODUCTS` array in `js/products.js`. Each item has `id`, bilingual `name`/`desc`, `price`, `weight`, and `image`.

## Edit contact settings
Edit the `CONFIG` object at the top of `js/main.js`:
- `email`: storefront email
- `whatsapp`: WhatsApp numbers in international digits-only format
- `defaultWhatsapp`: index 0 or 1 for default destination
- `storeName` and `currency`

The provided WhatsApp contacts are +1 313-909-8734 and +1 313-455-1054. Individual WhatsApp links are prepared with encoded messages. Note: WhatsApp ordering is a contact flow; shipping, final totals, and payment must be confirmed with the store.

## Replace images
Replace remote image URLs in `js/products.js` or place local files in `assets/images/` and update the corresponding paths. Keep the fallback at `assets/images/honey-placeholder.svg`. `assets/logo.svg` is the custom vector logo.

## Translation
The `T` object in `js/main.js` holds English and Arabic interface strings. Language toggle persists in localStorage and switches document direction to RTL.

## Visual preview / screenshots
No screenshots are bundled because they depend on the browser viewport. Open `index.html` on mobile and desktop to capture your own current screenshots. The layout is responsive at phone, tablet and desktop breakpoints.

## Notes
- The product prices and reviews are starter storefront content; verify/update them before launch.
- `favicon.ico` and `og-image.png` are lightweight brand assets included in this package.
- Static mailto submission opens the visitor's email client; no server-side form delivery is configured.
