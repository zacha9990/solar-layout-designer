# Phase 5 Plan: Google Solar API — Roof Orientation & Irradiance Analysis

**Status:** Ready to Execute | **Target Version:** 2.0.0 | **Prerequisite:** Google Solar API enabled on Google Cloud Console (same project as existing Maps API key)

---

## Overview

Phase 5 integrates the **Google Solar API** to give users visual guidance on where to place panels and replace the flat `400 kWh/panel/year` default with real, **orientation-specific** energy production data. A north-facing roof section will correctly show less production than a south-facing one.

### Primary Value Propositions
1. **Visual Placement Guidance** — color overlay on the map shows users exactly which roof areas get the most sun, before they place a single panel
2. **Orientation-Aware Accuracy** — N/S/E/W-facing roof sections each get their own real annual production figure
3. **Auto Roof Detection** — Google Solar API automatically identifies roof segments, pitch, and azimuth from satellite imagery
4. **Credibility** — calculations backed by Google's proprietary satellite + shadow analysis dataset

---

## Google Solar API Endpoints Used

### 1. `buildingInsights:findClosest`
```
GET https://solar.googleapis.com/v1/buildingInsights:findClosest
  ?location.latitude=LAT
  &location.longitude=LNG
  &requiredQuality=HIGH
  &key=API_KEY
```

Returns per roof segment: `azimuthDegrees`, `pitchDegrees`, `stats.areaMeters2`, `stats.sunshineQuantiles`, `boundingBox`, `center` (lat/lng centroid).

### 2. `dataLayers:get` (pixel-level heatmap)
```
GET https://solar.googleapis.com/v1/dataLayers:get
  ?location.latitude=LAT
  &location.longitude=LNG
  &radiusMeters=50
  &view=ANNUAL_FLUX
  &key=API_KEY
```

Returns `annualFluxUrl` — a GeoTIFF raster of annual solar flux (kWh/kW/year) per pixel.

---

## Delivery Tiers

| Tier | Features | Hours | Price | Best for |
|------|----------|-------|-------|----------|
| **Tier 1 — MVP** | Segment color overlay + "Best placement" hint | ~6h | **$600** | Try the value with minimal commitment |
| **Tier 2 — Core** | MVP + segment tooltip + orientation-aware energy calc + roof analysis table + testing | ~18h | **$1,800** | Full production-ready solar guidance |
| **Tier 3 — Full** | Core + pixel-level flux heatmap | ~23h | **$2,300** | Maximum visual detail, spot shading within a segment |

Each tier is a superset of the previous — client can start with MVP and upgrade later.

---

## Features to Implement

### Feature 1: Irradiance Overlay — Visual Guidance for Panel Placement ⭐ `[Tier 1+]`

**What it does:**
Before the user places a single panel, a **color-coded overlay** appears directly on the satellite map showing which areas of the rooftop receive the most annual sunlight. The user can immediately see: *"green zone = place panels here, orange zone = avoid."*

**Two overlay modes:**

**A. Segment Color Overlay — instant, from `buildingInsights`**
Each detected roof segment is filled with a semi-transparent polygon color based on its annual solar production estimate:

| Color | Threshold | Meaning |
|-------|-----------|---------|
| Green (`#22c55e`) | > 1,500 kWh/year | Optimal — place panels here |
| Yellow (`#eab308`) | 800–1,500 kWh/year | Acceptable |
| Orange (`#f97316`) | < 800 kWh/year | Suboptimal — avoid |

This renders immediately after address search with no extra API call.

**B. Pixel-Level Flux Heatmap — from `dataLayers` `[Tier 3 only]`**
A finer overlay showing solar flux per pixel across the entire rooftop. Useful for spotting shaded areas (chimneys, dormers, adjacent buildings) within a single segment.

- Rendered as a semi-transparent `google.maps.ImageMapType` over the satellite tiles
- GeoTIFF converted to PNG server-side (PHP GD library)
- Color scale: deep blue (low flux) → green → yellow → red (high flux)
- Legend strip shown at bottom-left of map

**Toggle UI:**
- Desktop: "☀ Radiation" checkbox in the controls bar, next to Satellite toggle — **ON by default** when Solar API data is available
- Mobile: "☀" toggle button in the mobile floating panel
- Both overlays can be toggled independently

**Implementation sketch:**
```javascript
// solar-api-manager.js
_renderSegmentOverlays(buildingData) {
    buildingData.solarPotential.roofSegmentStats.forEach(seg => {
        const kwh    = seg.stats.sunshineQuantiles[9]; // p90 sunshine hours
        const color  = kwh > 1500 ? '#22c55e' : kwh > 800 ? '#eab308' : '#f97316';
        const poly   = new google.maps.Polygon({
            paths:        this._boundsToPath(seg.boundingBox),
            fillColor:    color,
            fillOpacity:  0.40,
            strokeColor:  color,
            strokeWeight: 1.5,
            map: this.map
        });
        google.maps.event.addListener(poly, 'click', () => this._showTooltip(seg));
        this._segmentPolygons.push(poly);
    });
}
```

---

### Feature 2: Segment Tooltip — Direction, Pitch, and Production on Click `[Tier 2+]`

**What it does:**
Clicking a colored segment shows a floating info card pinned near the clicked area:
```
┌─────────────────────────────────────┐
│  ☀ South-facing  (180°)            │
│  Pitch: 15°  ·  Area: 85 m²        │
│  Est. 1,820 kWh/year                │
│  Max recommended: ~14 panels        │
└─────────────────────────────────────┘
```

Clicking elsewhere dismisses the tooltip. On mobile, the tooltip appears as a slide-up card from the bottom.

---

### Feature 3: Orientation-Aware Energy Calculation `[Tier 2+]`

**What it does:**
When a panel is placed on (or moved into) a roof segment, its annual energy estimate uses that specific segment's solar data rather than a global flat value.

**Formula:**
```
panelAreaM2     = (panelWidthCm / 100) × (panelHeightCm / 100)
segmentKwhPerM2 = segment.yearlyEnergyDcKwh / segment.stats.areaMeters2
panelAnnualKwh  = panelAreaM2 × segmentKwhPerM2 × efficiency (default 0.20)
```

**Fallback chain (graceful degradation):**
1. Google Solar API segment data (if building found and segment determined)
2. PVGIS irradiance (already implemented — location-aware but not segment-aware)
3. Admin-configured `sld_energy_per_panel` (flat fallback)

**Data model change:**
Each panel object gets an optional `segmentId` field. When a panel is added or moved, the nearest segment centroid is found and `segmentId` is set. `EnergyCalculator.calculate()` accepts a `segmentMap` (`Map<id, kwhPerM2>`) and uses it per-panel.

---

### Feature 5: "Best Placement" First-Time Hint ⭐ `[Tier 1+]`

**What it does:**
The first time Solar API data loads for a location **and no panels have been placed yet**, the tool proactively guides the user to the optimal area instead of waiting for them to discover the overlay on their own.

**Behaviour:**
1. After `buildingInsights` loads, identify the segment with the highest `yearlyEnergyDcKwh`
2. If `panelCount === 0`, show a pulsing "Start here" badge anchored to that segment's centroid (lat/lng → pixel projection via `fromLatLngToPoint`)
3. Badge text: *"Best area — start placing panels here"*
4. Badge auto-dismisses when the user places their first panel or clicks elsewhere
5. A one-line status message also appears above the map: *"☀ Best roof area highlighted. Place panels in the green zone for maximum production."*

**Desktop UI:** Badge is a small green pill (`position: absolute`, `z-index: 10`) with a CSS `pulse` animation. Status message appears in the controls bar.

**Mobile UI:** Status message appears as a toast notification (`_showToast()`). No badge (too small to be useful).

**Implementation sketch:**
```javascript
// solar-api-manager.js
_showBestPlacementHint(buildingData) {
    if (this._panelManager.panels.length > 0) return; // only on empty canvas
    const best = buildingData.solarPotential.roofSegmentStats
        .reduce((a, b) => a.yearlyEnergyDcKwh > b.yearlyEnergyDcKwh ? a : b);
    const center = best.center; // { latitude, longitude }
    this._renderHintBadge(center, 'Best area — start placing panels here');
    this._once('panel-added', () => this._removeHintBadge());
}
```

**Effort:** 2h (included in core)

---

### Feature 4: Roof Analysis Summary Panel `[Tier 2+]`

**What it does:**
After fetching building insights, show a collapsible table listing all detected segments with key metrics. This helps users plan before placing panels.

**Desktop UI (collapsible, below the map):**
```
Roof Analysis  [☀ 3 segments detected]              [▲ collapse]
──────────────────────────────────────────────────────────────────
Direction   | Pitch | Area   | Max Panels | kWh/year | Overlay
South ●     | 15°   | 85 m²  | 14         | 1,820    | ■ green
East ●      | 12°   | 62 m²  | 10         | 980      | ■ yellow
North ●     | 15°   | 85 m²  | 14         | 640      | ■ orange
──────────────────────────────────────────────────────────────────
```

**Mobile UI:**
Horizontal-scrolling card row inside the floating panel, one card per segment.

---

## New Admin Setting

Add `sld_google_solar_api_key` to the settings page. In most cases this will be identical to `sld_google_maps_api_key` (if Solar API is enabled on the same Google Cloud project), but stored separately for flexibility.

---

## File Changes

**New Files:**

| File | Purpose |
|------|---------|
| `assets/js/modules/solar-api-manager.js` | `SolarApiManager` — fetch, cache, render Solar API data |
| `includes/class-solar-api-proxy.php` | PHP AJAX handler: GeoTIFF → PNG conversion for flux heatmap |

**Modified Files:**

| File | Changes |
|------|---------|
| `solar-layout-designer.php` | Bump version; add `sld_google_solar_api_key` to activation hook |
| `includes/class-settings.php` | Add Solar API key field |
| `includes/class-plugin-core.php` | Enqueue `solar-api-manager.js`; pass Solar API key via `wp_localize_script` |
| `includes/class-shortcode-handler.php` | Add "Radiation" toggle checkbox; add roof analysis HTML block |
| `assets/js/solar-designer.js` | Instantiate `SolarApiManager`; wire segment overlays + energy calc |
| `assets/js/modules/energy-calculator.js` | Accept per-segment `segmentMap` in `calculate()` |
| `assets/css/solar-designer.css` | Segment tooltip styles; heatmap legend; roof analysis table |

---

## Implementation Roadmap

**Tier 1 — MVP (~6h, $600):**

| Sprint | Task | Effort |
|--------|------|--------|
| 1 | `SolarApiManager` skeleton; Settings field; `wp_localize_script` passthrough | 1h |
| 1 | Fetch `buildingInsights` on address search; cache per lat/lng | 1h |
| 2 | Render segment color polygons on map; toggle on/off | 3h |
| 2 | "Best Placement" hint badge (desktop) + toast (mobile); auto-dismiss on first panel | 1h |
| | **Tier 1 Total** | **6h** |

**Tier 2 — Core (additional ~12h on top of Tier 1, $1,200 delta → $1,800 total):**

| Sprint | Task | Effort |
|--------|------|--------|
| 3 | Segment click tooltip (direction, pitch, area, kWh/year) — desktop + mobile slide-up | 2h |
| 3 | Per-segment energy calculation; `segmentId` on panels; fallback chain | 3h |
| 4 | Roof analysis summary panel (desktop table + mobile scrollable cards) | 2h |
| 4 | Testing, edge cases (no Solar data, bad coords, API quota), polish | 4h |
| 4 | Documentation update | 1h |
| | **Tier 2 Delta** | **12h** |
| | **Tier 2 Total** | **18h** |

**Tier 3 — Full (additional ~5h on top of Tier 2, $500 delta → $2,300 total):**

| Task | Effort |
|------|--------|
| Pixel-level flux heatmap (GeoTIFF → PNG via PHP; `ImageMapType` overlay) | 4h |
| Heatmap legend + mobile heatmap toggle | 1h |
| **Tier 3 Delta** | **5h** |
| **Tier 3 Total** | **23h** |

---

## API Coverage & Caching Notes

Google Solar API coverage is **not global**. Before starting, test client locations:
```
https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=LAT&location.longitude=LNG&requiredQuality=LOW&key=KEY
```

**Caching strategy:** Cache `buildingInsights` response per lat/lng (rounded to 5 decimal places) in a JS `Map` for the session lifetime. Cache PNG heatmap tiles in `wp-content/uploads/sld-solar-cache/` on the server side. One API call per address search — never on every map pan.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Solar API key missing | Skip all Solar API calls silently; use PVGIS fallback |
| Building not found (404) | Show notice: "Solar data not available for this location" |
| API quota exceeded (429) | Fall back to PVGIS; log warning to console |
| Fetch fails (offline) | Fall back to PVGIS → admin flat value |
| Segment has no `boundingBox` | Skip polygon for that segment only |
| GeoTIFF conversion fails | Hide heatmap toggle; segment color overlay still works |

---

## Success Criteria

**Tier 1 — MVP:**
- [ ] Segment color polygons render correctly over satellite view without blocking panel drag
- [ ] First-time user with no panels placed sees "Best area" hint badge on the optimal roof segment
- [ ] Hint badge auto-dismisses after first panel is placed
- [ ] When Solar API unavailable, PVGIS fallback activates — no JS error, no broken UI
- [ ] API calls are cached — revisiting a previous address does not re-fetch

**Tier 2 — Core (includes Tier 1):**
- [ ] Clicking a segment shows correct direction, pitch, area, and production estimate
- [ ] North-facing segment shows measurably lower kWh/year than south-facing on same building
- [ ] Roof analysis table shows correct breakdown by direction
- [ ] Works on mobile (touch-friendly segment tap, compact summary cards in floating panel)

**Tier 3 — Full (includes Tier 2):**
- [ ] Pixel-level heatmap renders and toggles correctly
- [ ] Heatmap legend correctly maps color scale to kWh/kW/year values

---

## Estimated Budget

**Tier 1 — MVP** *(recommended starting point)*

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| SolarApiManager skeleton + Settings field + buildingInsights fetch | 2h | $100/h | $200 |
| Segment color overlay + toggle | 3h | $100/h | $300 |
| "Best Placement" hint badge + toast | 1h | $100/h | $100 |
| **Tier 1 Total** | **6h** | — | **$600** |

**Tier 2 — Core** *(full production-ready solar guidance)*

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| Tier 1 (above) | 6h | $100/h | $600 |
| Segment click tooltip | 2h | $100/h | $200 |
| Per-segment energy calculation + fallback chain | 3h | $100/h | $300 |
| Roof analysis summary panel (desktop + mobile) | 2h | $100/h | $200 |
| Testing, polish, docs | 5h | $100/h | $500 |
| **Tier 2 Total** | **18h** | — | **$1,800** |

**Tier 3 — Full** *(adds pixel-level shade detection)*

| Component | Hours | Rate | Cost |
|-----------|-------|------|------|
| Tier 2 (above) | 18h | $100/h | $1,800 |
| GeoTIFF → PNG conversion (PHP) + ImageMapType overlay | 4h | $100/h | $400 |
| Heatmap legend + mobile toggle | 1h | $100/h | $100 |
| **Tier 3 Total** | **23h** | — | **$2,300** |

---

## Post-Phase 5 Opportunities

- **Phase 6 (Planned):** Design persistence (save/load layouts) + PDF/CSV export — see `PHASE6_PROPOSAL.md`
- **Shade Timeline** — hourly shade animation using `dataLayers.hourlyShade`
- **Auto-placement Suggestion** — use segment data to suggest optimal panel positions automatically
