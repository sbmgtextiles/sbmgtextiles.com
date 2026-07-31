# SBMG Textiles Website — Easy Catalogue Edition

This website is made for GitHub Pages and includes an easy catalogue manager.

## First-time upload to GitHub

1. Unzip this package on your computer.
2. Open your GitHub repository.
3. Delete the old website files.
4. Click **Add file → Upload files**.
5. Drag all files and folders from inside this package. Do not upload the outer ZIP itself.
6. Commit the changes.
7. Wait 1–5 minutes and open https://sbmgtextiles.com/

## Add a new PDF catalogue

1. Open `https://sbmgtextiles.com/admin.html` after this website is live.
2. Click **+ Add Catalogue**.
3. Enter the title, season, year and description.
4. In PDF path, enter: `catalogues/your-file-name.pdf`
5. Click **Download Updated catalogues.js**.
6. In GitHub, open the `catalogues` folder and upload your PDF.
7. In the main repository folder, replace `catalogues.js` with the downloaded file.
8. Commit and wait 1–5 minutes.

## Optional catalogue cover

Upload a JPG/PNG into `images/catalogues/` and enter the path in the manager, for example:

`images/catalogues/summer-2027.jpg`

If left blank, the website creates a premium navy-and-gold cover automatically.

## Important limitation

GitHub Pages is a static website. The manager cannot directly save to GitHub. It creates the updated `catalogues.js` file for you, so only one small file needs to be replaced.

## Product updates

Products still use `products.js`. A similar product manager can be added later.
