# Phase 6 Proposal: Design Persistence & Export System

**Status:** Proposed | **Target Version:** 3.0.0 | **Estimated Scope:** $2,500–$3,000

---

## Overview

Phase 6 adds **data persistence** (save/load designs) and **export functionality** (PDF, CSV, snapshots), transforming the plugin from an interactive calculator into a **complete design documentation tool**. Users can now save their work, create multiple roof scenarios, and generate professional quotes and reports.

### Primary Value Propositions
1. **Work Persistence** — designs survive page refresh and browser close
2. **Professional Output** — PDF quotes with site photos, panel layout, and energy projections
3. **Multi-Scenario Analysis** — compare different roof designs side-by-side
4. **Collaboration Ready** — export CSV data for handoff to installers or engineers

---

## Proposed Features

### Feature 1: Design Persistence (WordPress Post Meta)

**Description:**
Users can save and load solar panel layouts. Each design is stored as a WordPress post meta object on the current page/post, indexed by a design name. Designs persist indefinitely; users can manage them (rename, delete, export).

**Technical Approach:**
- Store design data in `post_meta` table: `sld_designs` (serialized JSON array)
- Each design entry: `{ id, name, timestamp, panels: [...], config: {...} }`
- Add **Save Design** button → modal form → `wp_update_post_meta()`
- Add **Load Design** dropdown / modal → populate UI from stored data
- UI updates via existing `UIManager.render()` pattern

**UI Changes:**
- New toolbar section: "Saved Designs" with dropdown selector
- **Save Design** button (💾 icon) → opens modal with name + optional notes field
- **Load Design** dropdown showing list of saved designs with last-modified date
- **Delete Design** button (confirmation modal)
- Show "Unsaved Changes" indicator when current layout differs from last saved version

**Database Schema:**
```php
// wp_postmeta entry
post_id: 123
meta_key: 'sld_designs'
meta_value: JSON [
  {
    id: 'design_1740000000',
    name: 'East Roof - 20 Panels',
    created: 1740000000,
    modified: 1740001200,
    panels: [...panel objects...],
    config: { rate: 0.25, mapLat: 40.4168, mapLng: -3.7038 }
  }
]
```

**Security Considerations:**
- Designs are stored per-post-per-user (post owner can save designs on pages they edit)
- Validate `wp_verify_nonce()` on AJAX save/load/delete handlers
- Sanitize design names with `sanitize_text_field()`

**Estimated Effort:** 3–4 hours

---

### Feature 2: PDF Export

**Description:**
Export current design to a professional PDF including site photo (from Maps tile), panel layout diagram, and summary stats. Useful for quotes, documentation, and handoff to installers.

**Technical Approach:**
- Use **mPDF** library (PHP) or **jsPDF + html2canvas** (client-side)
- Server-side via WordPress: enqueue mPDF, create shortcode/AJAX handler to generate PDF
- Capture current design state → build PDF with:
  1. **Header:** Site address, GPS coordinates, timestamp
  2. **Satellite Image:** Cropped Google Maps tile (via Static Maps API)
  3. **Design Diagram:** SVG or canvas render of panel layout with annotations
  4. **Summary Table:** Panel count, total area, annual energy (kWh), annual savings (EUR)
  5. **System Config:** Panel wattage, electricity rate, location-specific irradiance
  6. **Roof Segment Breakdown:** N/S/E/W orientation data from Phase 5 Google Solar API

**UI Changes:**
- **Export PDF** button in toolbar
- Modal with options: include satellite image (yes/no), include notes field, paper size (A4/Letter)
- Progress indicator during PDF generation (server-side processing)

**Implementation Notes:**
- For satellite image: Use Google Maps Static API to fetch a static image of current view
- Panel diagram: render via canvas or SVG (re-use existing drawing logic)
- Consider security: validate POST data, limit PDF generation frequency (rate limit AJAX handler)

**Estimated Effort:** 5–6 hours

---

### Feature 3: CSV Export

**Description:**
Export panel data as CSV for spreadsheet analysis, installer handoff, or integration with external solar design software (e.g., PVSS, Aurora, Helioscope).

**CSV Columns:**
- Panel Index, X (cm), Y (cm), Width (cm), Height (cm), Rotation (deg), Segment Orientation, Annual Energy (kWh), Annual Savings (EUR)
- Summary row at top: Site address, coordinates, total panels, total area, rate, timestamp

**Technical Approach:**
- AJAX handler: format panels array as CSV via PHP `fputcsv()` or string concatenation
- Client-side: trigger download via blob + `<a href="blob:...">` pattern
- Include design metadata as CSV comments (lines prefixed with `#`)

**UI Changes:**
- **Export CSV** button in toolbar (next to PDF export)
- Single-click download, no modal needed

**Estimated Effort:** 2–3 hours

---

### Feature 4: Design Comparison (Multi-Scenario View)

**Description:**
Users can load multiple saved designs and view them side-by-side to compare energy output, cost, panel count, and layout effectiveness.

**Technical Approach:**
- Add "Compare Designs" modal that lets user select 2–3 saved designs
- Split-pane layout: left/center/right panels, each showing a different design
- Render each design in a minimal read-only view (panels displayed, no interaction)
- Summary stats below each design for easy comparison (energy, cost, panel count)
- Diff highlighting: e.g., highlight panels that are in design A but not in B

**UI Changes:**
- **Compare Designs** button (separate from main UI, maybe in a "Tools" menu)
- Modal with multi-select design picker
- Split-pane comparison view with stats table
- **Export Comparison** button to save comparison as PDF or image

**Estimated Effort:** 6–7 hours

---

### Feature 5: Design Notes & Metadata

**Description:**
Allow users to attach notes, photos, or metadata to designs (e.g., roof condition notes, installer contact info, project stage).

**Technical Approach:**
- Add optional fields to design object: `notes`, `photos` (URL array), `tags`, `installer_info`
- Notes field: simple textarea with 500-char limit
- Photo storage: use WordPress media library; link photos by attachment ID
- Tags: simple comma-separated string for categorization
- Extend "Load Design" modal to show notes as tooltip or expandable section

**Estimated Effort:** 2–3 hours

---

## Technical Dependencies

### Client-Side
- `html2canvas` (for canvas-based PDF export) or rely on server-side mPDF
- No new JS libraries required (reuse existing pattern)

### Server-Side
- **mPDF** library (Composer-installed, ~200KB)
- Additional WordPress AJAX handlers for save/load/delete/export
- Rate limiting via transients for PDF generation

### WordPress API
- `update_post_meta()`, `get_post_meta()`, `delete_post_meta()`
- `wp_verify_nonce()`, `wp_localize_script()`, `wp_remote_get()` (for Google Maps Static API)

---

## Phase 6 Implementation Roadmap

| Sprint | Task | Effort | Dependency |
|--------|------|--------|------------|
| 1 | Design Persistence (save/load/delete) | 4h | — |
| 1 | CSV Export | 3h | Persistence (to export saved designs) |
| 2 | PDF Export (basic version, includes Solar API segment data) | 6h | Persistence |
| 2 | Design Notes & Metadata | 3h | Persistence |
| 3 | Multi-Scenario Comparison | 7h | Persistence, PDF Export |
| 3 | Polish, testing, documentation | 4h | All above |
| | **Total Effort** | **27h** | ~3–4 weeks @ 8h/week |

---

## File Changes Summary

**New Files:**
- `includes/class-design-storage.php` — handles save/load/delete logic
- `includes/class-pdf-exporter.php` — PDF generation
- `assets/js/modules/design-manager.js` — client-side design persistence UI

**Modified Files:**
- `solar-layout-designer.php` — bump version, register AJAX handlers
- `includes/class-plugin-core.php` — enqueue new JS module, load mPDF library
- `includes/class-shortcode-handler.php` — add design toolbar UI
- `assets/js/solar-designer.js` — integrate design-manager module
- `assets/css/solar-designer.css` — style new design toolbar, modals, comparison view

---

## Success Criteria

- [ ] Users can save designs with custom names and load them later
- [ ] Designs survive page refresh and browser close
- [ ] Export PDF with site photo, panel layout, roof segment breakdown, and summary stats
- [ ] Export CSV for external software compatibility
- [ ] Compare 2–3 designs side-by-side with stats
- [ ] Attach notes and metadata to designs
- [ ] All features work on mobile (touch-friendly modals)
- [ ] Rate limited to prevent API abuse (max 1 PDF export per minute per user)
- [ ] Comprehensive documentation + user guide

---

## Estimated Budget

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| Design Persistence | 4 | $100/h | $400 |
| CSV Export | 3 | $100/h | $300 |
| PDF Export | 6 | $100/h | $600 |
| Design Notes | 3 | $100/h | $300 |
| Multi-Scenario Compare | 7 | $100/h | $700 |
| Testing, Polish, Docs | 4 | $100/h | $400 |
| **Total** | **27h** | — | **$2,700** |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| PDF generation slow | Cache mPDF library, pre-render static assets, implement job queue for large PDFs |
| Post meta bloat (many designs) | Implement design archival; warn users if > 50 saved designs |
| Google Maps Static API quota | Cache static images in `wp-content/uploads/sld-cache/` |
| Incorrect CSV export | Validate panel data before export; include unit annotations in headers |
| Mobile PDF export fails | Test thoroughly on iOS Safari; fallback to JSON export if PDF generation times out |
