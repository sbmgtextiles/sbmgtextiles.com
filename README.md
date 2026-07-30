# SBMG Textiles Website

A professional bilingual static website for GitHub Pages.

## Upload to GitHub Pages
1. Open your GitHub website repository.
2. Delete the old website files after downloading a backup.
3. Upload `index.html`, `styles.css`, `script.js`, and `products.js` to the repository root.
4. Commit the changes.
5. In GitHub: Settings → Pages → Deploy from branch → `main` / root.
6. Keep your current custom domain settings for `sbmgtextiles.com`.

## Add catalogue products later
Open `products.js`. Duplicate one product object, then change:
- English and Hindi product name
- Subtitle and description
- Category
- Two colours
- Badge
- Garment illustration type

For real product photos, replace the generated SVG inside each card with an image field. A developer can do this without changing the layout.

## Important before publishing
- Confirm all company claims shown are accurate.
- The phone, email and address were taken from the existing live website.
- Replace catalogue illustrations with your real product photographs when ready.
- Compress photos to WebP format, ideally below 250 KB each.
