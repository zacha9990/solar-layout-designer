<?php
/**
 * Shortcode handler with Google Maps integration
 */
class SLD_Shortcode_Handler {

    public function __construct() {
        add_shortcode('solar_designer', array($this, 'render_shortcode'));
    }

    /**
     * Render the solar designer interface with map integration
     */
    public function render_shortcode($atts) {
        // Parse attributes with defaults
        $atts = shortcode_atts(array(
            'width'  => '800',
            'height' => '600',
            'rate'   => get_option('sld_default_rate', 0.25),
            'lat'    => '',   // Default latitude (optional, falls back to Madrid in JS)
            'lng'    => '',   // Default longitude (optional, falls back to Madrid in JS)
            'zoom'   => '22' // Default zoom level for satellite view (max for rooftop detail)
        ), $atts);

        $map_enabled = get_option('sld_enable_map_background', 'yes') === 'yes';
        $api_key     = get_option('sld_google_maps_api_key', '');
        $has_maps    = $map_enabled && !empty($api_key);

        ob_start();
        ?>

        <div class="solar-designer-container"
             data-width="<?php echo esc_attr($atts['width']); ?>"
             data-height="<?php echo esc_attr($atts['height']); ?>"
             data-rate="<?php echo esc_attr($atts['rate']); ?>"
             data-lat="<?php echo esc_attr($atts['lat']); ?>"
             data-lng="<?php echo esc_attr($atts['lng']); ?>"
             data-zoom="<?php echo esc_attr($atts['zoom']); ?>"
             data-map-enabled="<?php echo $has_maps ? '1' : '0'; ?>">

            <!-- Controls -->
            <div class="sld-controls">
                <div class="sld-controls-left">
                    <div class="sld-btn-group">
                        <button id="sld-add-panel" class="sld-btn sld-btn-primary" title="Add a new solar panel" aria-label="Add Panel">
                            <span class="sld-btn-icon" aria-hidden="true">+</span>
                            <span class="sld-btn-label">Add Panel</span>
                        </button>
                        <button id="sld-duplicate" class="sld-btn sld-btn-secondary" disabled title="Select a panel first" aria-label="Duplicate">
                            <span class="sld-btn-icon" aria-hidden="true">&#x29C9;</span>
                            <span class="sld-btn-label">Duplicate</span>
                        </button>
                        <button id="sld-delete" class="sld-btn sld-btn-secondary" disabled title="Delete selected panel" aria-label="Delete panel">
                            <span class="sld-btn-icon" aria-hidden="true">&#x2715;</span>
                            <span class="sld-btn-label">Delete</span>
                        </button>
                        <button id="sld-reset" class="sld-btn sld-btn-secondary" title="Remove all panels" aria-label="Reset All">
                            <span class="sld-btn-icon" aria-hidden="true">↻</span>
                            <span class="sld-btn-label">Reset All</span>
                        </button>
                    </div>
                </div>

                <?php if ($has_maps): ?>
                <div class="sld-controls-right">
                    <div class="sld-map-controls">
                        <label for="sld-address-search">Location:</label>
                        <input type="text"
                               id="sld-address-search"
                               class="sld-input"
                               placeholder="Search address...">
                        <button id="sld-search-btn" class="sld-btn sld-btn-primary" title="Search for location" aria-label="Search">
                            <span class="sld-btn-icon" aria-hidden="true">🔍</span>
                            <span class="sld-btn-label">Go</span>
                        </button>
                    </div>
                    <div class="sld-toggle-controls">
                        <label for="sld-toggle-map">
                            <input type="checkbox" id="sld-toggle-map" checked>
                            Satellite View
                        </label>
                    </div>
                </div>
                <?php else: ?>
                <div class="sld-controls-right">
                    <p class="sld-notice">
                        &#128161; <a href="<?php echo esc_url(admin_url('options-general.php?page=solar-designer-settings')); ?>">
                            Configure Google Maps API
                        </a> to enable satellite view background
                    </p>
                </div>
                <?php endif; ?>
            </div>

            <!-- Mobile Address Bar (scrolls with page — mobile only) -->
            <div class="sld-mobile-address-bar" id="sld-mobile-address-bar">
                <?php if ($has_maps): ?>
                <div class="sld-mf-btn-row">
                    <input type="text" id="sld-address-search-mob" class="sld-mf-search" placeholder="Search address…">
                    <button id="sld-search-btn-mob" class="sld-btn sld-btn-primary" title="Search" aria-label="Search">
                        <span class="sld-btn-icon" aria-hidden="true">🔍</span>
                    </button>
                </div>
                <?php endif; ?>
                <p class="sld-mt-hint">Tap to select &middot; Drag to move &middot; Double-tap to delete</p>
            </div>

            <!-- Mobile Top Bar (sticky — stats only) -->
            <div class="sld-mobile-topbar" id="sld-mobile-topbar">
                <div class="sld-mf-stats">
                    <div class="sld-mf-stat">
                        <span class="sld-mf-label">Panels</span>
                        <span id="sld-panel-count-mob" class="sld-mf-val">0</span>
                    </div>
                    <div class="sld-mf-stat">
                        <span class="sld-mf-label">kWh/yr</span>
                        <span id="sld-annual-kwh-mob" class="sld-mf-val">0</span>
                    </div>
                    <div class="sld-mf-stat sld-mf-highlight">
                        <span class="sld-mf-label">€/yr</span>
                        <span id="sld-annual-savings-mob" class="sld-mf-val">0</span>
                    </div>
                    <div class="sld-mf-stat">
                        <span class="sld-mf-label">Rate</span>
                        <input type="number" id="sld-rate-input-mob"
                               value="<?php echo esc_attr($atts['rate']); ?>"
                               min="0" step="0.01" class="sld-mf-rate">
                    </div>
                </div>
            </div>

            <!-- Map + Panel Container -->
            <div class="sld-canvas-wrapper">
                <?php if ($has_maps): ?>
                <!-- Google Map Background -->
                <div id="sld-map" class="sld-map-background"></div>
                <?php endif; ?>

                <!-- Panel Area (div-based) -->
                <div id="sld-panel-area" class="sld-panel-area">
                    <p class="sld-helper-text">Click &ldquo;Add Panel&rdquo; to start designing</p>
                </div>
                <div class="sld-panel-hint">
                    <span class="sld-hint-desktop">Drag to move · Double-click to delete · Select → Delete/Backspace key to remove · Drag handle to rotate</span>
                    <span class="sld-hint-mobile">Tap to select · Drag to move · Double-tap to delete</span>
                </div>
            </div>

            <!-- Statistics Panel -->
            <div class="sld-stats">
                <div class="sld-stat-item">
                    <label>Total Panels:</label>
                    <span id="sld-panel-count" class="sld-stat-value">0</span>
                </div>
                <div class="sld-stat-item">
                    <label>Annual Production:</label>
                    <span id="sld-annual-kwh" class="sld-stat-value">0</span> kWh/year
                </div>
                <div class="sld-stat-item">
                    <label>Monthly Average:</label>
                    <span id="sld-monthly-kwh" class="sld-stat-value">0</span> kWh/month
                </div>
                <div class="sld-stat-item">
                    <label>Electricity Rate:</label>
                    <input type="number"
                           id="sld-rate-input"
                           value="<?php echo esc_attr($atts['rate']); ?>"
                           min="0"
                           step="0.01"
                           class="sld-input-number"> EUR/kWh
                </div>
                <div class="sld-stat-item sld-stat-highlight">
                    <label>Annual Savings:</label>
                    &euro;<span id="sld-annual-savings" class="sld-stat-value">0</span>/year
                </div>
            </div>

            <?php if ($has_maps): ?>
            <!-- Current Location Display -->
            <div class="sld-location-info">
                <small id="sld-current-location">Loading location...</small>
            </div>
            <!-- PVGIS Solar Irradiance Data -->
            <div class="sld-solar-data" id="sld-solar-data" style="display:none;">
                <small id="sld-solar-data-text"></small>
            </div>
            <?php endif; ?>

            <!-- Mobile Floating Panel (hidden on desktop via CSS) -->
            <div class="sld-mobile-float" id="sld-mobile-float">

                <!-- Actions + D-pad row -->
                <div class="sld-mf-body">

                    <div class="sld-mf-btns">
                        <!-- Default actions -->
                        <div class="sld-mf-btn-row">
                            <button id="sld-add-panel-mob" class="sld-btn sld-btn-primary" title="Add Panel" aria-label="Add Panel">
                                <span class="sld-btn-icon" aria-hidden="true">+</span>
                            </button>
                            <button id="sld-duplicate-mob" class="sld-btn sld-btn-secondary" disabled title="Duplicate selected panel" aria-label="Duplicate">
                                <span class="sld-btn-icon" aria-hidden="true">&#x29C9;</span>
                            </button>
                            <button id="sld-reset-mob" class="sld-btn sld-btn-danger" title="Remove all panels" aria-label="Reset All">
                                <span class="sld-btn-icon" aria-hidden="true">↻</span>
                            </button>
                        </div>
                        <!-- Contextual row — visible only when a panel is selected -->
                        <div class="sld-mf-btn-row sld-mf-ctx-row" id="sld-ctx-row">
                            <button id="sld-delete-mob" class="sld-btn sld-btn-danger" title="Delete selected panel" aria-label="Delete panel">
                                <span class="sld-btn-icon" aria-hidden="true">&#x2715;</span>
                            </button>
                            <button id="sld-rotate-ccw-mob" class="sld-btn sld-btn-secondary" title="Rotate 15° counter-clockwise" aria-label="Rotate left">
                                <span class="sld-btn-icon" aria-hidden="true">&#x27F2;</span>
                            </button>
                            <button id="sld-rotate-cw-mob" class="sld-btn sld-btn-secondary" title="Rotate 15° clockwise" aria-label="Rotate right">
                                <span class="sld-btn-icon" aria-hidden="true">&#x27F3;</span>
                            </button>
                        </div>
                    </div>

                    <!-- Directional pad — active only when a panel is selected -->
                    <div class="sld-dpad" id="sld-dpad" aria-label="Move selected panel">
                        <button class="sld-dpad-btn" data-dir="up"    aria-label="Move up">↑</button>
                        <button class="sld-dpad-btn" data-dir="left"  aria-label="Move left">←</button>
                        <button class="sld-dpad-btn" data-dir="right" aria-label="Move right">→</button>
                        <button class="sld-dpad-btn" data-dir="down"  aria-label="Move down">↓</button>
                    </div>

                </div>
            </div>
            <!-- Toast notification -->
            <div id="sld-toast" class="sld-toast" role="status" aria-live="polite"></div>

        </div>

        <?php
        return ob_get_clean();
    }
}
