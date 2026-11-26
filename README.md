# Jaydev’s Studio — vector editor in the browser

A single-file web app (`index.html`) for drawing, editing, importing and exporting vector files. No build step and no server: open `index.html` in a browser, or host it on any static host (e.g. GitHub Pages).

## What it does

**Open / place:** SVG, DXF (ASCII, R12–2018), DWG (R14–2018, via LibreDWG), PDF and Illustrator `.ai` files saved with PDF compatibility (first page), PNG/JPG/WebP images, and Studio project files (`.studio.json`; older `.vellum.json` files open too). Drag and drop or paste SVG code also work.

**Draw & edit:** select/move/scale/rotate, edit points and Bézier handles, pen, pencil, line, rectangle (with corner radius), ellipse, polygon, star, text. Fill, stroke, width, dashes, opacity. Group/ungroup, arrange, align, flip, boolean ops (unite, minus, overlap, exclude), undo/redo, grid and snapping, artboard presets (A-series, US sizes, laser bed), units (mm, cm, in, pt, px). Works with mouse, keyboard shortcuts, and touch (pinch to zoom).

**Export (real size):**
- **SVG**: width/height in your chosen unit, 1 user unit = 1 mm.
- **PDF**: true vector output at artboard size (jsPDF). Text uses the standard Helvetica/Times/Courier fonts.
- **DXF**: AutoCAD R12 ASCII with LINE/POLYLINE/TEXT entities. Curves are flattened to 0.02 mm, Y axis flipped to CAD convention, units written to `$INSUNITS` (mm, or cm/in if selected).

Your drawing autosaves in the browser. Use **Save project** to keep an editable copy.

## Limits

- DXF import skips hatches, images, meshes and 3D solids; binary DXF is not supported.
- PDF import reads paths and text from page 1; embedded images are skipped, and text is re-created with a standard font.
- DWG import skips pattern hatches (solid fills are kept), 3D solids, images, multileaders and tables. Very old (pre-R13) files may not open.
- DWG/DXF drawings larger than 1.5 m are placed on an A3 sheet at a standard scale (1:50, 1:100, …) so line weights stay visible; press Undo once for real size.
- EPS and CDR can't be read in the browser — convert to SVG, PDF or DXF first.

## Libraries (loaded from jsDelivr)

[Paper.js](http://paperjs.org) 0.12.17 · [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 · [pdf.js](https://mozilla.github.io/pdf.js/) 3.11.174 (only loaded when you open a PDF) · [libredwg-web](https://github.com/mlightcad/libredwg-web) 0.9.4, LibreDWG compiled to WebAssembly, GPL-3.0 (≈8 MB, only loaded when you open a DWG)
