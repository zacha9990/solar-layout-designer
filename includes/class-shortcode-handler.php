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
            'zoom'   => '20' // Default zoom level for satellite view
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
                    <button id="sld-add-panel" class="sld-btn sld-btn-primary">
                        &#10010; Add Panel
                    </button>
                    <button id="sld-reset" class="sld-btn sld-btn-secondary">
                        &#8635; Reset All
                    </button>
                </div>

                <?php if ($has_maps): ?>
                <div class="sld-controls-right">
                    <div class="sld-map-controls">
                        <label for="sld-address-search">Search Location:</label>
                        <input type="text"
                               id="sld-address-search"
                               class="sld-input"
                               placeholder="Enter address or place...">
                        <button id="sld-search-btn" class="sld-btn sld-btn-primary">
                            &#128269; Search
                        </button>
                    </div>
                    <div class="sld-toggle-controls">
                        <label>
                            <input type="checkbox" id="sld-toggle-map" checked>
                            Show Satellite View
                        </label>
                    </div>
                </div>
                <?php else: ?>
                <div class="sld-controls-right">
                    <p class="sld-notice">
                        &#128161; <a href="<?php echo admin_url('options-general.php?page=solar-designer-settings'); ?>">
                            Configure Google Maps API
                        </a> to enable satellite view background
                    </p>
                </div>
                <?php endif; ?>
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
                    Drag: move &nbsp;|&nbsp; Double-click: delete &nbsp;|&nbsp; Click + Delete key: delete
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
            <?php endif; ?>

        </div>

        <?php
        return ob_get_clean();
    }
}
