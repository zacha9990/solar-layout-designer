# Solar Layout Designer — WordPress Plugin

Interactive solar panel layout designer with Google Maps satellite view. Rendered via the `[solar_designer]` shortcode.

**Current Version:** 1.1.5

---

## File Structure

```
solar-layout-designer/
├── solar-layout-designer.php          # Bootstrap, constants, activation hook
├── includes/
│   ├── class-plugin-core.php          # Asset enqueue (JS/CSS dependency chain)
│   ├── class-shortcode-handler.php    # [solar_designer] shortcode HTML
│   └── class-settings.php            # Admin settings page (Settings API)
└── assets/
    ├── css/solar-designer.css
    └── js/
        ├── solar-designer.js          # Main app class (SolarDesigner)
        └── modules/
            ├── panel-manager.js       # SolarPanel + PanelManager (data model)
            ├── energy-calculator.js   # EnergyCalculator (kWh/savings)
            ├── map-manager.js         # MapManager (Google Maps API)
            └── ui-manager.js          # UIManager (DOM rendering)
```

JS files are enqueued in the order above — dependency order matters.

---

## Critical Conventions

### 1. Cache Busting
**Bump `SLD_VERSION` in `solar-layout-designer.php` every time any JS or CSS file changes.**
The version string is passed as the `?ver=` query parameter for all enqueued assets, forcing browsers to fetch the new file.

### 2. Panel Rendering: DOM divs, NOT canvas
Panels are `<div class="sld-panel-item">` elements, absolutely positioned inside `#sld-panel-area`.
There is no `<canvas>` element. Canvas was abandoned because Google Maps internal layers block canvas z-index regardless of stacking context.

### 3. Real-World Panel Sizing
Panel dimensions are stored in **centimetres** (default: 100 cm × 160 cm).
`_updatePanelSize()` in `solar-designer.js` converts cm → pixels at runtime:

```
metersPerPixel = (156543.03392 × cos(lat × π/180)) / 2^zoom
pixelSize = (cm / 100) / metersPerPixel
```

Pixel size is clamped: **min 15×24 px**, **max 120×192 px**.
Recalculated on every `zoom_changed` map event.

### 4. Delete UX (no delete button)
Panels are too small for a dedicated delete button. Instead:
- **Double-click** a panel to delete it immediately
- **Single-click** to select (red border) → **Delete / Backspace** key to delete

### 5. Solar Cell Grid Visual
Panel divs use CSS `repeating-linear-gradient` to render a **3-column × 5-row** cell grid over a dark navy background. No canvas or SVG needed — purely CSS via `background-image`.

---

## Locale / Currency

| Setting | Value |
|---------|-------|
| Currency | EUR (€) |
| Default electricity rate | 0.25 EUR/kWh |
| Default map location | Madrid, Spain (40.4168, −3.7038) |
| UI language | English |

---

## WordPress Options

| Option key | Default | Description |
|------------|---------|-------------|
| `sld_google_maps_api_key` | `''` | Google Maps JS API key |
| `sld_enable_map_background` | `'yes'` | Enable satellite map |
| `sld_default_rate` | `0.25` | EUR/kWh electricity rate |
| `sld_panel_width` | `100` | Panel width in cm |
| `sld_panel_height` | `160` | Panel height in cm |
| `sld_energy_per_panel` | `400` | kWh/year per panel |

---

## Shortcode

```
[solar_designer]
[solar_designer width="900" height="600" zoom="20" lat="40.4168" lng="-3.7038"]
```

---

## Google Maps Notes

- Requires **Maps JavaScript API** + **Places API** enabled in Google Cloud Console.
- The Places Autocomplete API is deprecated for new customers as of March 2025 — address search may not work without legacy access. Geocoder fallback is in place.
- `getMetersPerPixel()` in `MapManager` is used for real-world panel sizing.
