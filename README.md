# Portfolio · Olivia Calista Setiawan

Static website: `index.html`, `styles.css`, `script.js`, plus `img/` and `files/`.
No build step. Open `index.html` in a browser to view it locally.

## Publish for free

**Netlify Drop (fastest)**
1. Go to https://app.netlify.com/drop and log in.
2. Drag this whole `website` folder onto the page.
3. Netlify gives you a link. Rename it under Site settings → Change site name.

**GitHub Pages**
1. Create a public repository and upload the contents of this folder (index.html at the root).
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/<repository>/`.

## After publishing
Open `index.html` and replace the relative Open Graph image with the full URL so
LinkedIn and WhatsApp show the preview image:

    <meta property="og:image" content="https://YOUR-SITE-URL/img/og-image.jpg">
