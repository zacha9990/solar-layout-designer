# Solar Layout Designer — Phase 1 Documentation

**Version:** 1.1.5
**Delivered:** February 2026
**Plugin Slug:** `solar-layout-designer`

---

## Table of Contents

1. [Overview](#overview)
2. [Features Delivered](#features-delivered)
3. [Installation](#installation)
4. [Admin Configuration](#admin-configuration)
5. [User Guide](#user-guide)
6. [Shortcode Reference](#shortcode-reference)
7. [Technical Architecture](#technical-architecture)
8. [Module Reference](#module-reference)
9. [Design Decisions](#design-decisions)
10. [Known Limitations](#known-limitations)
11. [Testing Checklist](#testing-checklist)
12. [Phase 2 Roadmap](#phase-2-roadmap)

---

## Overview

Solar Layout Designer is a WordPress plugin that lets users interactively place solar panels over a Google Maps satellite view of their rooftop, then instantly calculates the estimated annual energy production and financial savings.

**Shortcode:** `[solar_designer]`

---

## Features Delivered

### Core Panel Designer
- Add unlimited solar panels to the design area with one click
- Drag-and-drop panels freely across the canvas
- Panels are constrained within the design area boundaries
- Panels resize automatically based on Google Maps zoom level, matching real-world dimensions

### Delete Interactions
- **Double-click** any panel to delete it immediately
- **Single-click** to select a panel (highlighted in red), then press **Delete** or **Backspace** to remove it
- **Reset All** button clears the entire layout (with confirmation prompt)

### Solar Cell Grid Visual
Panels render as realistic dark-navy photovoltaic cells — a 3-column × 5-row cell grid is drawn using CSS gradients. No canvas or SVG required; the visual scales cleanly at any panel size.

### Google Maps Integration
- Satellite view as the design background (requires API key)
- Address search with geocoding fallback
- Panel pixel size recalculated on every zoom change to maintain real-world proportions
- Toggle satellite view on/off via checkbox

### Energy Calculator
- **Annual energy production** (kWh/year) = panels × kWh per panel
- **Monthly average** (kWh/month)
- **Annual savings** (€/year) = annual energy × electricity rate
- Electricity rate editable live by the end user

### Admin Settings Page
Settings → Solar Designer:
- Google Maps API key
- Enable/disable satellite view
- Default electricity rate (EUR/kWh)
- Energy per panel (kWh/year)
- Panel physical dimensions (cm)

### Responsive Design
- Adapts to desktop, tablet, and mobile viewports
- Touch drag support for tablets and smartphones
- Controls reflow to single-column on narrow screens

---

## Installation

### 1. Upload Plugin

**Option A — via WordPress Admin:**
1. Zip the `solar-layout-designer` folder
2. WordPress Admin → Plugins → Add New → Upload Plugin
3. Select the ZIP → Install Now → Activate

**Option B — via FTP/File Manager:**
1. Upload the `solar-layout-designer` folder to `/wp-content/plugins/`
2. WordPress Admin → Plugins → Activate "Solar Layout Designer"

### 2. Get a Google Maps API Key *(optional, for satellite view)*

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Enable these two APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Go to **Credentials → Create Credentials → API Key**
5. Copy the key

**Restrict the key (strongly recommended):**
- Application restrictions → HTTP referrers → add `https://yoursite.com/*`
- API restrictions → Maps JavaScript API + Places API

### 3. Configure the Plugin

WordPress Admin → **Settings → Solar Designer**

Paste your API key, verify settings, and click **Save Settings**.

### 4. Add to a Page

Create or edit any page/post and insert the shortcode:

```
[solar_designer]
```

---

## Admin Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Google Maps API Key | *(empty)* | Required for satellite view. Without it the tool works as a blank-canvas designer. |
| Enable Map Background | Yes | Toggle the satellite layer globally. Can also be toggled per-session by the end user. |
| Default Electricity Rate | 0.25 | EUR per kWh. Applied when the shortcode `rate` attribute is not set. |
| Energy Per Panel | 400 | Estimated kWh/year per panel. Adjust based on your region and panel spec. |
| Panel Width | 100 | Real-world width in centimetres (standard panel ≈ 100 cm). |
| Panel Height | 160 | Real-world height in centimetres (standard panel ≈ 160 cm). |

---

## User Guide

### Step 1 — Find Your Rooftop
Type an address in the search box and press **Enter** or click **Search**. The map navigates to that location at zoom level 20. Use the Google Maps zoom controls to fine-tune.

### Step 2 — Place Panels
Click **Add Panel**. Each panel appears in the top-left of the design area and can be dragged anywhere on the rooftop image. Panels are sized to match real-world dimensions at the current zoom level.

### Step 3 — Adjust the Layout
- **Move** a panel: click and drag
- **Delete** a panel: double-click it, or single-click to select (red outline) then press Delete/Backspace
- **Clear all**: click **Reset All** and confirm

### Step 4 — Review Calculations
The statistics bar below the map updates in real time:

| Stat | Meaning |
|------|---------|
| Total Panels | Number of panels placed |
| Annual Production | kWh generated per year |
| Monthly Average | kWh per month |
| Electricity Rate | Editable — enter your local tariff |
| Annual Savings | € saved per year at that rate |

### Step 5 — Toggle the Map
Uncheck **Show Satellite View** to hide the map and work on a plain background. Re-check to restore the satellite layer.

---

## Shortcode Reference

```
[solar_designer]
[solar_designer width="900" height="600" zoom="20" lat="40.4168" lng="-3.7038" rate="0.28"]
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | integer | `800` | Designer width in pixels |
| `height` | integer | `600` | Designer height in pixels |
| `zoom` | integer | `20` | Initial Google Maps zoom level (18–21 recommended for rooftops) |
| `lat` | float | `40.4168` | Initial latitude (defaults to Madrid, Spain) |
| `lng` | float | `-3.7038` | Initial longitude (defaults to Madrid, Spain) |
| `rate` | float | from settings | Electricity rate in EUR/kWh shown in the rate input |

---

## Technical Architecture

### Server-side (PHP)

```
solar-layout-designer.php          Bootstrap, SLD_VERSION constant, activation hook
includes/
  class-plugin-core.php            wp_enqueue_script/style — JS loaded in dependency order
  class-shortcode-handler.php      [solar_designer] shortcode — outputs HTML structure
  class-settings.php               WordPress Settings API — admin page, option registration
```

### Client-side (JavaScript)

Scripts are enqueued in strict dependency order:

```
1. panel-manager.js      SolarPanel, PanelManager   — data model, CRUD, hit detection
2. energy-calculator.js  EnergyCalculator            — kWh and savings formulas
3. map-manager.js        MapManager                  — Google Maps init, address search, zoom metrics
4. ui-manager.js         UIManager                   — DOM panel rendering
5. solar-designer.js     SolarDesigner               — main app, event delegation, drag, sizing
```

### HTML Structure (rendered by shortcode)

```html
<div class="solar-designer-container" data-width data-height data-rate data-lat data-lng data-zoom data-map-enabled>
  <div class="sld-controls">          <!-- Add Panel, Reset, Search, Toggle -->
  <div class="sld-canvas-wrapper">    <!-- height set via JS -->
    <div id="sld-map">                <!-- Google Maps — z-index 1 -->
    <div id="sld-panel-area">         <!-- Panel divs — z-index 999, pointer-events: none on area -->
      <div class="sld-panel-item">    <!-- pointer-events: auto per panel -->
  <div class="sld-stats">             <!-- Panel count, kWh, savings, rate input -->
  <div class="sld-location-info">     <!-- Current address display -->
```

### Data Flow

```
[Add Panel clicked]
  → PanelManager.addPanel()           creates SolarPanel object with pixel size
  → UIManager.render()                builds div from panel data
  → EnergyCalculator.calculate()      computes stats
  → UIManager.updateStats()           updates DOM

[Map zoom changed]
  → MapManager.getMetersPerPixel()    formula: (156543.03392 × cos(lat × π/180)) / 2^zoom
  → SolarDesigner._updatePanelSize()  converts cm → pixels, clamps min/max
  → PanelManager.resizePanels()       updates all panel objects
  → UIManager.render()                redraws all divs at new size
```

---

## Module Reference

### `PanelManager` (`panel-manager.js`)

| Method | Description |
|--------|-------------|
| `addPanel()` | Creates a panel at the next grid position, returns the `SolarPanel` object |
| `deletePanel(id)` | Removes panel by ID |
| `getPanelAt(x, y)` | Hit-test: returns panel under coordinates (top-to-bottom order) |
| `resizePanels(w, h)` | Updates all panels to new pixel dimensions (called on zoom change) |
| `reset()` | Clears all panels and resets ID counter |
| `getPanelCount()` | Returns current panel count |

### `EnergyCalculator` (`energy-calculator.js`)

| Method | Description |
|--------|-------------|
| `calculate(panelCount)` | Returns `{ panelCount, annualEnergy, monthlyAverage, annualSavings, electricityRate }` |
| `setElectricityRate(rate)` | Updates rate; returns `false` if rate ≤ 0 |
| `EnergyCalculator.formatNumber(n)` | Static — adds thousands-separator commas |

### `MapManager` (`map-manager.js`)

| Method | Description |
|--------|-------------|
| `initMap(lat, lng, zoom)` | Initialises Google Maps in satellite mode |
| `setupAddressSearch(input, btn)` | Attaches Places Autocomplete + geocoder fallback |
| `getMetersPerPixel()` | Returns metres-per-pixel at current zoom and latitude |
| `moveToLocation(lat, lng, zoom)` | Pans and zooms map |
| `toggleMap(show)` | Shows/hides the map div |
| `resize()` | Triggers Google Maps resize event |

### `UIManager` (`ui-manager.js`)

| Method | Description |
|--------|-------------|
| `render()` | Clears all panel divs and rebuilds from `PanelManager.panels` |
| `updateStats(stats)` | Updates stat values in the DOM |
| `updateMapVisibility(bool)` | Delegates to `MapManager.toggleMap()` |

---

## Design Decisions

### Why DOM divs instead of `<canvas>`

The original spec called for canvas rendering. During development, it was discovered that Google Maps manages its own internal DOM layers independently of CSS `z-index`, making it impossible to reliably draw on a canvas element overlaid on the map. Switching to absolutely-positioned `<div>` elements with `z-index: 999` resolved this completely and provides additional benefits:

- No manual redraw loops needed
- Native browser hit-testing (no custom `contains()` needed for interaction)
- CSS transitions and hover effects work naturally
- Solar cell grid rendered entirely in CSS — no drawing code required

### Why no delete button on panels

At the minimum functional size (15×24 px), a 22px delete button would occupy the entire panel, leaving no draggable area. The double-click / keyboard-delete interaction was adopted instead, which is standard UX in design tools (Figma, PowerPoint, etc.).

### Real-world panel sizing

At the default zoom level 20, one pixel ≈ 14.9 cm on the ground. A 100×160 cm panel therefore renders at roughly 7×11 pixels — far too small. `_updatePanelSize()` uses the Web Mercator zoom scale formula to convert physical centimetres to screen pixels at any zoom level, then clamps the result between minimum interactive size (15×24 px) and a maximum that prevents panels from becoming unwieldy (120×192 px).

---

## Known Limitations

| Limitation | Notes |
|------------|-------|
| Layouts are not saved | Panel positions are in-memory only. Refreshing the page loses the layout. Persistence is planned for Phase 2. |
| Places Autocomplete deprecated | Google deprecated `google.maps.places.Autocomplete` for new customers as of March 2025. Address search uses Geocoder as fallback and still works, but autocomplete suggestions may not appear. |
| No panel rotation | Panels are axis-aligned rectangles. Rotation support is planned for Phase 2. |
| No image export | Cannot export the layout as a PNG or PDF. Phase 2 feature. |
| Single designer per page | Multiple `[solar_designer]` shortcodes on the same page are not supported. |

---

## Testing Checklist

### Functional Tests

| Test | Expected Result |
|------|-----------------|
| Add 1 panel | Panel appears on design area |
| Add 10 panels | All 10 panels appear, arranged in grid |
| Drag panel | Panel moves smoothly, stays in bounds |
| Double-click panel | Panel is deleted |
| Click panel → Delete key | Panel is deleted |
| Reset All | Confirmation dialog appears, all panels cleared |
| Change electricity rate | Annual savings updates immediately |
| Invalid rate (0 or negative) | Alert shown, rate reverts to previous value |
| Address search | Map navigates to searched location |
| Toggle satellite view | Map shows/hides |
| Zoom in/out | Panel pixel size recalculates to maintain real-world scale |

### Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome (latest) | ⬜ To be tested |
| Firefox (latest) | ⬜ To be tested |
| Safari (latest) | ⬜ To be tested |
| Edge (latest) | ⬜ To be tested |

### Responsive Breakpoints

| Viewport | Status |
|----------|--------|
| Desktop 1920×1080 | ⬜ To be tested |
| Laptop 1366×768 | ⬜ To be tested |
| Tablet 768×1024 | ⬜ To be tested |
| Mobile 375×667 | ⬜ To be tested |

### Performance

| Test | Status |
|------|--------|
| 10 panels — smooth drag | ⬜ To be tested |
| 25 panels — smooth drag | ⬜ To be tested |
| 50 panels — smooth drag | ⬜ To be tested |

---

## Phase 2 Roadmap

| Feature | Description |
|---------|-------------|
| Layout persistence | Save panel positions to WordPress database per user/post |
| Panel rotation | Rotate panels to align with angled rooflines |
| Snap-to-grid | Optional grid snapping for precise layouts |
| Roof area detection | Draw a polygon over the roof and count max panels that fit |
| Image export | Export the layout as a PNG for proposals and reports |
| PDF report generation | Generate a printable solar proposal with layout + calculations |
| Multiple layouts | Save and compare different layout configurations |
| Shading analysis | Mark shaded zones that reduce panel output |

---

*Solar Layout Designer — Phase 1 | GPL2 License*
