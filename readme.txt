=== Solar Layout Designer ===
Contributors: yourusername
Tags: solar, energy, calculator, interactive, layout, google maps
Requires at least: 5.8
Tested up to: 6.7
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Interactive solar panel layout designer with Google Maps satellite view and real-time energy calculations.

== Description ==

Solar Layout Designer lets users place solar panels over a Google Maps satellite image of any rooftop, then instantly calculates estimated annual energy production and financial savings in EUR.

**Key Features:**

* **Satellite View** — uses Google Maps to show the real rooftop as the design background
* **Realistic Panel Sizing** — panels scale automatically with map zoom to match real-world dimensions (default: 100 cm × 160 cm)
* **Solar Cell Grid Visual** — panels render as dark-navy photovoltaic cells with a realistic cell grid
* **Drag & Drop** — move panels freely across the rooftop; boundaries prevent going out of bounds
* **Intuitive Delete** — double-click a panel to remove it, or click to select then press Delete/Backspace
* **Energy Calculator** — annual kWh, monthly average, and EUR savings update in real time
* **Address Search** — navigate the map by typing any address
* **Shortcode Powered** — add `[solar_designer]` to any page or post
* **Responsive** — touch-drag support; adapts to desktop, tablet, and mobile

== Installation ==

1. Upload the `solar-layout-designer` folder to `/wp-content/plugins/`
2. Activate the plugin through the Plugins menu in WordPress
3. Go to Settings → Solar Designer and enter your Google Maps API key
4. Add the shortcode `[solar_designer]` to any page or post

The designer works without an API key (blank canvas mode) but requires Google Maps for satellite view.

== Frequently Asked Questions ==

= Do I need a Google Maps API key? =
Only for the satellite view feature. Without a key, the tool still works as a blank-canvas designer where you can add, drag, and delete panels and see energy calculations.

= Are panel layouts saved? =
Not in Phase 1. Layouts are held in memory and are lost on page refresh. Save/load functionality is planned for Phase 2.

= Can I change panel dimensions? =
Yes. Go to Settings → Solar Designer → Panel Dimensions. Enter the real-world width and height in centimetres. The plugin converts these to pixels based on the current map zoom level.

= Is it mobile friendly? =
Yes. The plugin includes touch event support for dragging panels on tablets and smartphones, and controls reflow to a single column on narrow screens.

= Can I use EUR or another currency? =
The plugin uses EUR (€) by default. The electricity rate field accepts any decimal number, so you can enter your local tariff regardless of currency; only the label shows EUR.

== Screenshots ==

1. Designer with Google Maps satellite view and solar panels placed on a rooftop
2. Statistics panel showing panel count, annual kWh, and EUR savings
3. Admin settings page for API key and calculator defaults
4. Mobile view with responsive controls

== Changelog ==

= 1.2.0 =
* Location-aware energy calculations via PVGIS API (EU JRC) — no API key required
* New admin setting: Panel Peak Power (Wp) for accurate irradiance-based calculations
* Solar data source line displayed below stats showing kWh/kWp/yr and kWh/panel/yr
* Graceful fallback to admin-configured value when PVGIS is unreachable

= 1.1.5 =
* Added solar cell grid visual (CSS repeating-gradient, 3 cols × 5 rows)
* Removed all debug console.log statements

= 1.1.4 =
* Internationalized all UI to English
* Changed currency from IDR to EUR (rate default: 0.25 EUR/kWh)
* Changed default map location from Jakarta to Madrid, Spain

= 1.1.3 =
* Panel number labels now hidden by default, shown on hover only

= 1.1.2 =
* Replaced delete button with double-click and keyboard Delete/Backspace interactions
* Added selected-panel highlight (red border) for keyboard delete

= 1.1.1 =
* Panel size now scales with map zoom to match real-world dimensions
* Added min/max pixel clamps (15×24 px min, 120×192 px max)

= 1.1.0 =
* Replaced canvas rendering with DOM div-based panels
* Resolved Google Maps z-index conflicts that prevented panels from appearing

= 1.0.0 =
* Initial release
* Core panel add/drag/delete functionality
* Energy calculator with kWh and savings
* Google Maps satellite view integration
* Admin settings page

== Upgrade Notice ==

= 1.1.5 =
Adds solar cell grid visual to panels and removes debug output. Recommended for all users.
