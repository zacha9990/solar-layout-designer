# Solar Layout Designer

Interactive solar panel layout designer for WordPress. Place panels over a Google Maps satellite view of any rooftop and instantly calculate energy production and savings.

**Version:** 1.2.0 | **Phase:** 1 of 3 | **License:** GPL2

---

## Project Roadmap

This plugin is developed in three phases. Each phase is reviewed and approved by the client before the next begins.

| Phase | Scope | Value |
|-------|-------|-------|
| **Phase 1** *(current)* | Core panel system + energy calculator + Google Maps | $800 |
| Phase 2 | Panel rotation, duplication, and selection system | $450 |
| Phase 3 | Performance optimisation, mobile polish, production hardening | $350 |
| **Total** | | **$1,600** |

---

## Phase 1 — Delivered Features

Everything below is complete and working in this version.

### Core Panel System
- Add solar panels to the design area with one click
- Drag panels freely to position over the rooftop; boundaries enforced
- Delete panels by double-clicking, or click to select then press Delete/Backspace
- Reset all panels at once (with confirmation)
- Panel count updates in real time

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

---

## Quick Start

1. Upload plugin to `/wp-content/plugins/` and activate
2. Go to **Settings → Solar Designer** and paste your Google Maps API key
3. Add `[solar_designer]` to any page or post

## Shortcode

```
[solar_designer]
[solar_designer width="900" height="600" zoom="20" lat="40.4168" lng="-3.7038"]
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `width` | `800` | Designer width (px) |
| `height` | `600` | Designer height (px) |
| `zoom` | `20` | Initial map zoom (18–21 for rooftops) |
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

## Known Limitations (Phase 1)

| Limitation | Planned Fix |
|------------|-------------|
| Layouts not saved — lost on page refresh | Phase 2: database persistence |
| No panel rotation | Phase 2: rotation with handle UI |
| No panel duplication | Phase 2: duplicate feature |
| No image/PDF export | Phase 3 |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map not showing | Check API key in Settings; verify APIs enabled in Google Cloud Console |
| Map shows grey boxes | Enable billing in Google Cloud Console (free tier is sufficient, card required) |
| Address search not working | Enable Places API; note: Autocomplete deprecated for new accounts since March 2025 — geocoder fallback is active |
| Panels disappear on refresh | Expected in Phase 1 — persistence is a Phase 2 feature |

## Full Documentation

See [PHASE1_DOCUMENTATION.md](PHASE1_DOCUMENTATION.md) for complete technical architecture, JS module reference, design decisions, and full testing checklist.
