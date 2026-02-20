<?php
/**
 * Plugin Name: Solar Layout Designer
 * Plugin URI: https://example.com
 * Description: Interactive solar panel layout designer with energy calculations and Google Maps integration
 * Version: 1.2.1
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL2
 * Text Domain: solar-layout-designer
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SLD_VERSION', '1.2.1');
define('SLD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SLD_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include core classes
require_once SLD_PLUGIN_DIR . 'includes/class-plugin-core.php';
require_once SLD_PLUGIN_DIR . 'includes/class-shortcode-handler.php';
require_once SLD_PLUGIN_DIR . 'includes/class-settings.php';

// Initialize plugin
function solar_layout_designer_init() {
    $plugin = new SLD_Plugin_Core();
    $shortcode = new SLD_Shortcode_Handler();
    $settings = new SLD_Settings();
}
add_action('plugins_loaded', 'solar_layout_designer_init');

// Activation hook
register_activation_hook(__FILE__, 'solar_layout_designer_activate');
function solar_layout_designer_activate() {
    // Set default options
    add_option('sld_default_rate', 0.25);
    add_option('sld_panel_width', 100);
    add_option('sld_panel_height', 160);
    add_option('sld_energy_per_panel', 400);
    add_option('sld_google_maps_api_key', ''); // Google Maps API Key
    add_option('sld_enable_map_background', 'yes'); // Enable map by default
    add_option('sld_panel_wattage', 400); // Panel peak power in Wp
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'solar_layout_designer_deactivate');
function solar_layout_designer_deactivate() {
    // Cleanup if needed
}
