<?php
/**
 * Settings Page for Solar Layout Designer
 */
class SLD_Settings {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_notices', array($this, 'api_key_notice'));
    }

    public function add_settings_page() {
        add_options_page(
            'Solar Designer Settings',
            'Solar Designer',
            'manage_options',
            'solar-designer-settings',
            array($this, 'render_settings_page')
        );
    }

    public function register_settings() {
        register_setting('sld_settings_group', 'sld_google_maps_api_key', array(
            'sanitize_callback' => 'sanitize_text_field'
        ));
        register_setting('sld_settings_group', 'sld_enable_map_background');
        // Rate is a float (EUR/kWh), so we use floatval instead of absint
        register_setting('sld_settings_group', 'sld_default_rate', array(
            'sanitize_callback' => function($val) { return max(0, (float) $val); }
        ));
        register_setting('sld_settings_group', 'sld_panel_width', array(
            'sanitize_callback' => 'absint'
        ));
        register_setting('sld_settings_group', 'sld_panel_height', array(
            'sanitize_callback' => 'absint'
        ));
        register_setting('sld_settings_group', 'sld_energy_per_panel', array(
            'sanitize_callback' => 'absint'
        ));

        // API Settings Section
        add_settings_section(
            'sld_api_settings',
            'Google Maps Integration',
            array($this, 'api_settings_section_callback'),
            'solar-designer-settings'
        );

        add_settings_field(
            'sld_google_maps_api_key',
            'Google Maps API Key',
            array($this, 'api_key_field_callback'),
            'solar-designer-settings',
            'sld_api_settings'
        );

        add_settings_field(
            'sld_enable_map_background',
            'Enable Map Background',
            array($this, 'enable_map_field_callback'),
            'solar-designer-settings',
            'sld_api_settings'
        );

        // Calculator Settings Section
        add_settings_section(
            'sld_calculator_settings',
            'Energy Calculator Settings',
            array($this, 'calculator_settings_section_callback'),
            'solar-designer-settings'
        );

        add_settings_field(
            'sld_default_rate',
            'Default Electricity Rate (EUR/kWh)',
            array($this, 'default_rate_field_callback'),
            'solar-designer-settings',
            'sld_calculator_settings'
        );

        add_settings_field(
            'sld_energy_per_panel',
            'Energy Per Panel (kWh/year)',
            array($this, 'energy_per_panel_field_callback'),
            'solar-designer-settings',
            'sld_calculator_settings'
        );

        // Panel Settings Section
        add_settings_section(
            'sld_panel_settings',
            'Panel Dimensions',
            array($this, 'panel_settings_section_callback'),
            'solar-designer-settings'
        );

        add_settings_field(
            'sld_panel_width',
            'Panel Width (cm)',
            array($this, 'panel_width_field_callback'),
            'solar-designer-settings',
            'sld_panel_settings'
        );

        add_settings_field(
            'sld_panel_height',
            'Panel Height (cm)',
            array($this, 'panel_height_field_callback'),
            'solar-designer-settings',
            'sld_panel_settings'
        );
    }

    public function api_key_notice() {
        $api_key = get_option('sld_google_maps_api_key', '');
        if (empty($api_key)) {
            $settings_url = admin_url('options-general.php?page=solar-designer-settings');
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <strong>Solar Layout Designer:</strong>
                    Google Maps API key is not configured.
                    <a href="<?php echo esc_url($settings_url); ?>">Configure now</a>
                    to enable the satellite view feature.
                </p>
            </div>
            <?php
        }
    }

    public function api_settings_section_callback() {
        echo '<p>Configure the Google Maps API to display a satellite view as the design background.</p>';
        echo '<p><strong>How to get an API Key:</strong></p>';
        echo '<ol>';
        echo '<li>Open the <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>';
        echo '<li>Create a new project or select an existing one</li>';
        echo '<li>Enable the &ldquo;Maps JavaScript API&rdquo;</li>';
        echo '<li>Go to Credentials &rarr; Create API Key</li>';
        echo '<li>Copy the key and paste it in the field below</li>';
        echo '</ol>';
    }

    public function calculator_settings_section_callback() {
        echo '<p>Default values for the energy calculator.</p>';
    }

    public function panel_settings_section_callback() {
        echo '<p>Real-world dimensions of a solar panel in centimetres. Used to calculate the correct pixel size on the map at any zoom level.</p>';
    }

    public function api_key_field_callback() {
        $api_key = get_option('sld_google_maps_api_key', '');
        ?>
        <input type="text"
               name="sld_google_maps_api_key"
               value="<?php echo esc_attr($api_key); ?>"
               class="regular-text"
               placeholder="AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx">
        <p class="description">
            Required to display the Google Maps satellite view as the design background.
            <?php if (!empty($api_key)): ?>
                <span style="color: green;">&#10003; API Key is set</span>
            <?php endif; ?>
        </p>
        <?php
    }

    public function enable_map_field_callback() {
        $enabled = get_option('sld_enable_map_background', 'yes');
        ?>
        <label>
            <input type="checkbox"
                   name="sld_enable_map_background"
                   value="yes"
                   <?php checked($enabled, 'yes'); ?>>
            Enable Google Maps background (requires API key)
        </label>
        <?php
    }

    public function default_rate_field_callback() {
        $rate = get_option('sld_default_rate', 0.25);
        ?>
        <input type="number"
               name="sld_default_rate"
               value="<?php echo esc_attr($rate); ?>"
               min="0"
               step="0.01"
               class="small-text">
        <p class="description">Default electricity rate in EUR per kWh (e.g. 0.25)</p>
        <?php
    }

    public function energy_per_panel_field_callback() {
        $energy = get_option('sld_energy_per_panel', 400);
        ?>
        <input type="number"
               name="sld_energy_per_panel"
               value="<?php echo esc_attr($energy); ?>"
               min="0"
               step="50"
               class="small-text">
        <p class="description">Estimated energy production per panel per year (kWh)</p>
        <?php
    }

    public function panel_width_field_callback() {
        $width = get_option('sld_panel_width', 100);
        ?>
        <input type="number"
               name="sld_panel_width"
               value="<?php echo esc_attr($width); ?>"
               min="50"
               max="300"
               class="small-text">
        <p class="description">Panel width in centimetres (standard panel: 100 cm)</p>
        <?php
    }

    public function panel_height_field_callback() {
        $height = get_option('sld_panel_height', 160);
        ?>
        <input type="number"
               name="sld_panel_height"
               value="<?php echo esc_attr($height); ?>"
               min="50"
               max="300"
               class="small-text">
        <p class="description">Panel height in centimetres (standard panel: 160 cm)</p>
        <?php
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (isset($_GET['settings-updated'])) {
            add_settings_error('sld_messages', 'sld_message', 'Settings saved.', 'updated');
        }

        settings_errors('sld_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('sld_settings_group');
                do_settings_sections('solar-designer-settings');
                submit_button('Save Settings');
                ?>
            </form>

            <hr>

            <h2>Usage</h2>
            <p>Add this shortcode to any page or post:</p>
            <code>[solar_designer]</code>
            <p>Optional attributes: <code>[solar_designer width="900" height="600" zoom="20" lat="40.4168" lng="-3.7038"]</code></p>
        </div>
        <?php
    }
}
