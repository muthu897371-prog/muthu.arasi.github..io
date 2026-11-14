# WingLab AI — Aircraft Wing Optimization (Educational Prototype)

A beginner-friendly static website for exploring basic aircraft-wing parameters. It runs entirely in the browser and can be hosted using **GitHub Pages**.

## Important technical note

This first version is an educational front-end prototype. It uses a deliberately simplified illustrative equation to show how inputs affect estimated lift coefficient, drag coefficient, lift-to-drag ratio, and lift. It does **not** contain a trained AI/ML model, validated XFOIL/XFLR5 data, CFD, structural analysis, or flight testing. The optimization button searches angle of attack only within a small range. Do not use its outputs to design, build, or operate a real aircraft.

For a research-grade next version:
1. Generate airfoil polar data with XFOIL or XFLR5 at documented Reynolds numbers and transition settings.
2. Store the source data and conditions in CSV files.
3. Train and validate a regression model in Python/scikit-learn using a held-out test set.
4. Add a Python API (for example, Flask or FastAPI) to serve predictions.
5. Deploy the API separately (GitHub Pages cannot execute Python server code) and connect this static frontend to it.
6. Validate candidate designs with an independent aerodynamic method; assess stall, stability, structural loads, manufacturability, and applicable standards with qualified supervision.

## Files

- `index.html` — page structure
- `style.css` — responsive styling
- `script.js` — browser-side calculations, chart, and angle search

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Change the inputs and click **Analyze wing** or **Find better setting**.

No build tools or package installation are required.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `winglab-ai`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages deployment to finish. Open the published URL shown in the Pages settings.

If the repository is named `username.github.io`, the site is usually published at `https://username.github.io/`. For a project repository, the URL is usually `https://username.github.io/repository-name/`.

## Suggested future upgrades

- Import real airfoil polar datasets from XFOIL/XFLR5.
- Add charts for CL vs angle of attack and CD vs angle of attack.
- Add geometry options such as taper ratio and sweep angle.
- Add a trained model with model version and prediction uncertainty.
- Export an analysis report with input conditions and dataset provenance.
