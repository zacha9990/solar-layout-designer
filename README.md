# Solar Layout Designer

Interactive solar panel layout designer for WordPress. Place panels over a Google Maps satellite view of any rooftop and instantly calculate energy production and savings.

**Version:** 1.6.7 | **Phase:** 4 complete + mobile floating UI | **License:** GPL2

---

## Project Roadmap

This plugin is developed in three phases. Each phase is reviewed and approved by the client before the next begins.

| Phase | Scope | Status | Value |
|-------|-------|--------|-------|
| Phase 1 | Core panel system + energy calculator + Google Maps | ✅ Complete | $800 |
| Phase 2 | Panel rotation, duplication, and selection system | ✅ Complete | $450 |
| Phase 3 | Performance optimisation, mobile polish, production hardening | ✅ Complete | $350 |
| Phase 4 | UI redesign + mobile floating panel with D-pad | ✅ Complete | — |
| **Phase 5** | Google Solar API — roof orientation & irradiance overlay | 🔜 Next | $1,600 (+$500 heatmap add-on) |
| Phase 6 | Design persistence + PDF/CSV export | 💡 Proposed | $2,700 |
| **Total (Ph 1–3)** | | | **$1,600** |

---

## Phase 1 + Phase 2 + Phase 3 — Delivered Features

Everything below is complete and working in this version.

### Core Panel System (Phase 1)
- Add solar panels to the design area with one click
- Drag panels freely to position over the rooftop; boundaries enforced
- Delete panels by double-clicking, or click to select then press Delete/Backspace
- Reset all panels at once (with confirmation)
- Panel count updates in real time

### Advanced Panel Interactions (Phase 2)
- **Rotate panels** — select a panel to reveal a small rotation handle (8px circle at top-center); drag the handle to freely rotate the panel around its center
- **Duplicate panels** — Duplicate button (enabled when a panel is selected) creates a new panel cloned from the selected one, placed directly to the right on the same row, with the same rotation
- **Selection state** — panels highlight in red when selected; visual state persists after re-renders

### Energy Calculator
- Annual energy production (kWh/year)
- Monthly average (kWh/month)
- Annual savings in EUR — updates live as panels are added or rate is changed
- Electricity rate editable directly by the user
- **Location-aware via PVGIS** — queries the EU JRC PVGIS API on every map location change for real solar irradiance at that coordinate; falls back to admin-configured value if unavailable

### Google Maps Integration
- Satellite view as the design background
- Address search — type any address to navigate the map
- Panels automatically resize with zoom level to match real-world dimensions (100 cm × 160 cm standard)
- Toggle satellite view on/off

### Plugin Infrastructure
- WordPress shortcode `[solar_designer]`
- Modular JS architecture (panel-manager, energy-calculator, map-manager, ui-manager)
- Admin settings page (Settings → Solar Designer)
- Fully responsive — touch drag support for tablets and mobile

### Production Optimizations (Phase 3)
- **Bug fixes** — silent data loss (electricity rate), null reference guards, async boundary checks
- **Performance** — areaRect caching, eliminated redundant DOM queries
- **UX** — Escape key to deselect, click-outside deselection, grabbing cursor persistence
- **Accessibility** — ARIA attributes, panel entrance animations, null-safe DOM updates
- **Mobile/Touch** — touch-action, larger rotation handle hit targets, improved touch rotation
- **Code cleanup** — removed 30+ lines of dead code, stale comments removed
- **Security** — CSRF protection on admin URL, AbortController for stale PVGIS requests
- **CSS polish** — transition optimization, mobile breakpoint fixes, animation cleanup

---

## Quick Start

1. Upload plugin to `/wp-content/plugins/` and activate
2. Go to **Settings → Solar Designer** and paste your Google Maps API key
3. Add `[solar_designer]` to any page or post

## Shortcode

```
[solar_designer]
[solar_designer width="900" height="600" zoom="21" lat="40.4168" lng="-3.7038"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `width` | `800` | Designer width (px) |
| `height` | `600` | Designer height (px) |
| `zoom` | `21` | Initial map zoom (18–22 for rooftops) |
| `lat` | `40.4168` | Initial latitude (default: Madrid, Spain) |
| `lng` | `-3.7038` | Initial longitude (default: Madrid, Spain) |
| `rate` | from settings | Electricity rate (EUR/kWh) |

## Admin Settings

Go to **Settings → Solar Designer** to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| Google Maps API Key | *(empty)* | Required for satellite view |
| Enable Map Background | Yes | Toggle map globally |
| Default Electricity Rate | 0.25 EUR/kWh | Used when `rate` attribute is not set |
| Energy Per Panel | 400 kWh/year | Fallback when PVGIS is unavailable |
| Panel Width | 100 cm | Real-world panel width |
| Panel Height | 160 cm | Real-world panel height |
| Panel Peak Power | 400 Wp | Used with PVGIS irradiance for location-aware energy calculation |

## User Guide

| Action | How |
|--------|-----|
| Search for a rooftop | Type address in search box → Enter or click Search |
| Add a panel | Click **Add Panel** |
| Move a panel | Click and drag |
| Delete a panel | Double-click, or click to select (red border) → Delete/Backspace key |
| Clear all panels | Click **Reset All** → confirm |
| Change electricity rate | Edit the rate field in the stats bar; savings update immediately |
| Hide the map | Uncheck **Show Satellite View** |

## Requirements

- WordPress 5.8+
- PHP 7.4+
- Google Maps API key (Maps JavaScript API + Places API) — needed for satellite view only; the designer works without it on a plain background

## Google Maps API Key

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project
2. Enable **Maps JavaScript API** and **Places API**
3. Credentials → Create API Key → copy and paste into **Settings → Solar Designer**
4. Restrict the key to your domain (strongly recommended to prevent abuse)

## Known Limitations

| Limitation | Status |
|------------|--------|
| Layouts not saved — lost on page refresh | Deferred (future feature) |
| No image/PDF export | Deferred (future feature) |
| PVGIS API outages | Handled gracefully with admin-configured fallback |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map not showing | Check API key in Settings; verify APIs enabled in Google Cloud Console |
| Map shows grey boxes | Enable billing in Google Cloud Console (free tier is sufficient, card required) |
| Address search not working | Enable Places API; note: Autocomplete deprecated for new accounts since March 2025 — geocoder fallback is active |
| Panels disappear on refresh | Expected in Phase 1 — persistence is a Phase 2 feature |

## Full Documentation

See [PHASE1_DOCUMENTATION.md](PHASE1_DOCUMENTATION.md) for complete technical architecture, JS module reference, design decisions, and testing checklist.

## Known Limitations (Updated)

| Limitation | Status |
|------------|--------|
| Energy calculation uses flat kWh/panel (not orientation-aware) | Phase 5 — Google Solar API |
| No visual radiation overlay on roof | Phase 5 — Google Solar API |
| Layouts not saved — lost on page refresh | Phase 6 — Design Persistence |
| No image/PDF export | Phase 6 — PDF Export |
| PVGIS API outages | Handled gracefully with admin-configured fallback |

---

## Changelog

**v1.6.7 — March 10, 2026**
- 📱 Mobile UI restructure: stats (Panels, kWh/yr, €/yr, Rate) + address search moved to a new top bar above the map (`sld-mobile-topbar`)
- 📱 Bottom floating panel now contains only action buttons (+, Duplicate, Reset) + D-pad — simpler, easier thumb reach
- 🔄 Add Panel button changed to `+` icon on all screen sizes (desktop + mobile); text label removed

**v1.6.6 — March 10, 2026**
- 🐛 Fix panel size mismatch on mobile HiDPI: `getMetersPerPixel()` now uses bounds-based calculation (`getBounds()` + `offsetWidth`) instead of the classic 256px-tile formula — panels now match real-world scale on all devices including Retina/HiDPI screens

**v1.6.5 — March 9, 2026**
- 📱 Mobile floating panel (position: fixed, bottom of viewport) containing all controls: Add Panel, Duplicate, Reset, address search, satellite toggle, stats
- 📱 D-pad for moving selected panel (3px per tap, 80ms hold-to-repeat interval)
- 📱 Map height set to 82% of viewport height via JS on mobile — overrides CSS constraints
- 📱 Stats mirrored to floating panel (panels, kWh/year, €/year)
- 🐛 Fix CSS cascade: `display:none` for floating panel was placed after media query (later rule won), moved before media query block

**v1.5.5 — March 9, 2026**
- 🔍 Default map zoom raised from 20 → 21 so panels are proportionally correct relative to rooftop on first load
- 🔍 Min panel size tuned to 25×40 px (was 40×64) — visible but no longer oversized at default zoom
- At zoom 21, a 1m panel renders at ~25px against a 176px/10m rooftop (~14% ratio, close to real-world 10%)
- At zoom 22+, panels render at true physical scale with no clamping needed

**v1.5.4 — March 9, 2026**
- 🔍 Increased minimum panel pixel size from 15×24 → 40×64 px for better visibility at all zoom levels
- 🔍 Increased maximum panel pixel size from 120×192 → 150×240 px
- 🐛 Fix duplicate panel placement: was offset diagonally (+20px right, +20px down); now places panel directly to the right (same row, +10px gap after panel edge)

**v1.5.3 — March 8, 2026**
- 📱 Mobile toolbar: icon-only buttons (44×44px touch targets) — text labels hidden on ≤768px
- 📱 Mobile hint text: touch-specific instructions ("Tap · Drag · Double-tap")
- 📱 Stats layout: keeps 2-column at 480px; Rate + Savings span full width
- 📱 Container goes edge-to-edge (no border radius / margin) at 480px
- 🎛️ Satellite view checkbox styled as a proper toggle switch (pill + sliding dot)
- ♿ `aria-label` added to all icon buttons for screen reader support

**v1.5.2 — March 8, 2026**
- 🐛 Fix rotation handle overlapping panel body on mobile — moved handle above panel top edge (`top: -14px`) so touch-to-drag no longer triggers rotation accidentally

**v1.5.1 — March 8, 2026**
- 📱 Mobile touch parity: tap-to-select, lazy drag (>5px threshold), touch rotation, double-tap-to-delete
- 🐛 Fix rotation not firing on mobile (`touchmove` now calls `_moveRotate`)
- 🐛 Fix panel selection failing on mobile (`touchstart` directly calls `_setSelected`)
- 🐛 Fix drag conflicting with select — drag now lazily initialised after 5px movement
- 🐛 Fix missing delete on mobile — double-tap within 300ms deletes selected panel
- 🐛 Fix rotation offset stale cache — `_startRotate` now stores `_areaRect`

**v1.5.0 (Phase 4) — March 4, 2026**
- 🎨 Modern UI redesign — clean minimal SaaS aesthetic
- 🎨 CSS design tokens (blue, surface, border, text hierarchy, accent colours)
- 🎨 Card-based stats grid, amber savings highlight, ghost-style secondary buttons
- 🎨 Improved responsive layout at 1024px / 768px / 480px breakpoints

**v1.4.0 (Phase 3) — March 4, 2026**
- 🐛 Fix silent data loss: `parseFloat()` for electricity rate (was `parseInt()`)
- 🐛 Fix null reference guards in drag/async handlers
- 🐛 Fix lat/lng falsy check (avoid snapping to equator on lat=0)
- 🐛 Clear ghost drag state on panel deletion
- ⚡ Performance: cache areaRect on drag/rotation (eliminate repeated DOM queries)
- 🎯 UX: Escape key deselect, click-outside deselect, grabbing cursor persistence
- 📱 Mobile: touch-action, larger rotation handle hit target, touch rotation support
- ♿ Accessibility: ARIA attributes, panel entrance animations, null-safe DOM updates
- 🗑️ Removed 30+ lines of dead code (getPanelAt, getCenter, updateMapVisibility, etc.)
- 🔒 Security: esc_url() on admin URL, AbortController for stale PVGIS requests
- 🎨 CSS: optimized transitions, mobile breakpoint fixes, animation cleanup

**v1.3.0 (Phase 2) — March 2, 2026**
- ✨ Panel rotation with visual handle
- ✨ Panel duplication
- ✨ Persistent selection state across re-renders
- ✨ Keyboard Delete/Backspace to delete selected panel

**v1.1.5 (Phase 1) — February 28, 2026**
- ✨ Core panel designer with drag-and-drop
- ✨ Real-world panel sizing with Google Maps zoom
- ✨ Energy calculator with live updates
- ✨ Location-aware PVGIS irradiance integration
- ✨ Address search with geocoding fallback
- ✨ Responsive touch-friendly UI
