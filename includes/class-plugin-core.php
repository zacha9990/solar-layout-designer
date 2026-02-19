<?php
/**
 * Core plugin functionality with Google Maps integration
 */
class SLD_Plugin_Core {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }
    
    /**
     * Enqueue CSS and JavaScript with Google Maps API
     */
    public function enqueue_assets() {
        // Only load on pages with shortcode
        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'solar_designer')) {
            return;
        }
        
        // Get API key
        $api_key = get_option('sld_google_maps_api_key', '');
        $map_enabled = get_option('sld_enable_map_background', 'yes');
        
        // Enqueue Google Maps API FIRST if enabled and API key exists
        if ($map_enabled === 'yes' && !empty($api_key)) {
            wp_enqueue_script(
                'google-maps-api',
                'https://maps.googleapis.com/maps/api/js?key=' . esc_attr($api_key) . '&libraries=places',
                array(),
                null,
                false // Load in header
            );
        }
        
        // Enqueue CSS
        wp_enqueue_style(
            'solar-designer-css',
            SLD_PLUGIN_URL . 'assets/css/solar-designer.css',
            array(),
            SLD_VERSION
        );
        
        // Enqueue JavaScript modules (ORDER MATTERS!)
        // 1. Panel Manager (no dependencies)
        wp_enqueue_script(
            'solar-panel-manager',
            SLD_PLUGIN_URL . 'assets/js/modules/panel-manager.js',
            array(),
            SLD_VERSION,
            true
        );
        
        // 2. Energy Calculator (no dependencies)
        wp_enqueue_script(
            'solar-energy-calculator',
            SLD_PLUGIN_URL . 'assets/js/modules/energy-calculator.js',
            array(),
            SLD_VERSION,
            true
        );
        
        // 3. Map Manager (depends on Google Maps API)
        $map_deps = array();
        if ($map_enabled === 'yes' && !empty($api_key)) {
            $map_deps[] = 'google-maps-api';
        }
        
        wp_enqueue_script(
            'solar-map-manager',
            SLD_PLUGIN_URL . 'assets/js/modules/map-manager.js',
            $map_deps,
            SLD_VERSION,
            true
        );
        
        // 4. UI Manager (depends on PanelManager, EnergyCalculator, MapManager)
        wp_enqueue_script(
            'solar-ui-manager',
            SLD_PLUGIN_URL . 'assets/js/modules/ui-manager.js',
            array('solar-panel-manager', 'solar-energy-calculator', 'solar-map-manager'),
            SLD_VERSION,
            true
        );
        
        // 5. Main app (depends on all modules)
        wp_enqueue_script(
            'solar-designer-main',
            SLD_PLUGIN_URL . 'assets/js/solar-designer.js',
            array('solar-panel-manager', 'solar-energy-calculator', 'solar-map-manager', 'solar-ui-manager'),
            SLD_VERSION,
            true
        );
        
        // Localize script with data
        wp_localize_script('solar-designer-main', 'solarDesignerData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('solar_designer_nonce'),
            'defaultRate' => get_option('sld_default_rate', 0.25),
            'googleMapsApiKey' => $api_key,
            'mapEnabled' => ($map_enabled === 'yes' && !empty($api_key)),
            'panelSpecs' => array(
                'width' => get_option('sld_panel_width', 100),
                'height' => get_option('sld_panel_height', 160),
                'wattage' => get_option('sld_energy_per_panel', 400)
            )
        ));
    }
}
