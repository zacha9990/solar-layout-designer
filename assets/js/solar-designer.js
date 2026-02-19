/**
 * Main Solar Designer Application
 * Panels are rendered as DOM div elements overlaid on Google Maps.
 */
class SolarDesigner {
    constructor(containerId, config) {
        this.container = document.querySelector(containerId);
        this.config = config;

        const containerData = this.container.dataset;
        this.designWidth  = parseInt(containerData.width)  || 800;
        this.designHeight = parseInt(containerData.height) || 600;

        // Set wrapper height explicitly (panel area uses position:absolute)
        const wrapper = this.container.querySelector('.sld-canvas-wrapper');
        if (wrapper) {
            wrapper.style.height = this.designHeight + 'px';
        }

        // Initialize Map Manager if maps are enabled
        this.mapManager = null;
        if (config.mapEnabled && typeof google !== 'undefined') {
            try {
                this.mapManager = new MapManager('sld-map', this.designWidth, this.designHeight);

                const lat  = parseFloat(containerData.lat)  || 40.4168;
                const lng  = parseFloat(containerData.lng)  || -3.7038;
                const zoom = parseInt(containerData.zoom)   || 20;

                this.mapManager.initMap(lat, lng, zoom);

                const searchInput = document.getElementById('sld-address-search');
                const searchBtn   = document.getElementById('sld-search-btn');
                if (searchInput && searchBtn) {
                    this.mapManager.setupAddressSearch(searchInput, searchBtn);
                }
            } catch (e) {
                console.error('Solar Designer: Map initialization failed, falling back to no-map mode.', e);
                this.mapManager = null;
            }
        }

        // Initialize managers — panel dimensions start from config values (treated as cm when map is active)
        this.panelManager    = new PanelManager(this.designWidth, this.designHeight, config.panelSpecs.width, config.panelSpecs.height);
        this.energyCalculator = new EnergyCalculator(config.panelSpecs.wattage);

        const panelArea   = document.getElementById('sld-panel-area');
        this.uiManager    = new UIManager(panelArea, this.panelManager, this.mapManager);

        const initialRate = parseInt(containerData.rate) || config.defaultRate;
        this.energyCalculator.setElectricityRate(initialRate);

        // Drag state
        this.isDragging      = false;
        this.draggedDiv      = null;
        this.draggedPanelId  = null;
        this.dragOffset      = { x: 0, y: 0 };

        // Selection state (for keyboard delete)
        this.selectedPanelId = null;

        // Calculate correct panel pixel size based on map zoom + latitude
        this._updatePanelSize();

        // Recalculate panel size whenever user zooms or pans the map
        if (this.mapManager && this.mapManager.map) {
            google.maps.event.addListener(this.mapManager.map, 'zoom_changed', () => {
                this._updatePanelSize();
                this.uiManager.render();
            });
        }

        this.setupEventListeners();
        this.uiManager.render();

    }

    // ─── Panel size calculation ──────────────────────────────────────────────

    /**
     * Convert real-world panel dimensions (cm) to pixels using the current
     * map zoom level and latitude.
     *
     * Formula: metersPerPixel = (156543.03392 × cos(lat × π/180)) / 2^zoom
     *
     * Min size ensures panels stay interactive even at low zoom levels.
     * Max size prevents panels from becoming enormous when zoomed in very close.
     */
    _updatePanelSize() {
        const MIN_W = 15, MIN_H = 24;
        const MAX_W = 120, MAX_H = 192;

        let widthPx, heightPx;

        if (this.mapManager && this.mapManager.map) {
            const mpp = this.mapManager.getMetersPerPixel();
            // config.panelSpecs.width/height are in centimetres (e.g. 100cm × 160cm)
            widthPx  = Math.round((this.config.panelSpecs.width  / 100) / mpp);
            heightPx = Math.round((this.config.panelSpecs.height / 100) / mpp);
            widthPx  = Math.min(MAX_W, Math.max(MIN_W, widthPx));
            heightPx = Math.min(MAX_H, Math.max(MIN_H, heightPx));
        } else {
            // No map: treat config values directly as pixels (grid mode)
            widthPx  = this.config.panelSpecs.width;
            heightPx = this.config.panelSpecs.height;
        }

        this.panelManager.resizePanels(widthPx, heightPx);
    }

    // ─── Event Listeners ────────────────────────────────────────────────────

    setupEventListeners() {
        document.getElementById('sld-add-panel').addEventListener('click', () => this.addPanel());
        document.getElementById('sld-reset').addEventListener('click', () => this.reset());
        document.getElementById('sld-rate-input').addEventListener('change', e => this.updateRate(e.target.value));

        const mapToggle = document.getElementById('sld-toggle-map');
        if (mapToggle && this.mapManager) {
            mapToggle.addEventListener('change', e => this.toggleMap(e.target.checked));
        }

        // Event delegation on panel area for drag + delete
        const panelArea = document.getElementById('sld-panel-area');

        // Single click/mousedown → start drag
        panelArea.addEventListener('mousedown', e => {
            const div = e.target.closest('.sld-panel-item');
            if (div) this._startDrag(div, e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', e => {
            if (this.isDragging) this._moveDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', () => this._endDrag());

        // Double-click → delete panel
        panelArea.addEventListener('dblclick', e => {
            const div = e.target.closest('.sld-panel-item');
            if (div) this.deletePanel(parseInt(div.dataset.panelId));
        });

        // Keyboard: Delete/Backspace on selected panel
        document.addEventListener('keydown', e => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedPanelId !== null) {
                this.deletePanel(this.selectedPanelId);
            }
        });

        // Single click → select panel (for keyboard delete)
        panelArea.addEventListener('click', e => {
            const div = e.target.closest('.sld-panel-item');
            this._setSelected(div ? parseInt(div.dataset.panelId) : null);
        });

        // Touch support
        panelArea.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!el) return;
            const div = el.closest('.sld-panel-item');
            if (div) { e.preventDefault(); this._startDrag(div, touch.clientX, touch.clientY); }
        }, { passive: false });

        document.addEventListener('touchmove', e => {
            if (this.isDragging) { e.preventDefault(); this._moveDrag(e.touches[0].clientX, e.touches[0].clientY); }
        }, { passive: false });

        document.addEventListener('touchend', () => this._endDrag());

        window.addEventListener('resize', () => { if (this.mapManager) this.mapManager.resize(); });
    }

    // ─── Drag helpers ────────────────────────────────────────────────────────

    _startDrag(div, clientX, clientY) {
        const rect = div.getBoundingClientRect();
        this.isDragging     = true;
        this.draggedDiv     = div;
        this.draggedPanelId = parseInt(div.dataset.panelId);
        this.dragOffset     = { x: clientX - rect.left, y: clientY - rect.top };
        div.style.cursor    = 'grabbing';
        div.style.zIndex    = '200';
    }

    _moveDrag(clientX, clientY) {
        if (!this.draggedDiv) return;

        const panel    = this.panelManager.panels.find(p => p.id === this.draggedPanelId);
        if (!panel) return;

        const areaRect = document.getElementById('sld-panel-area').getBoundingClientRect();
        let newX = clientX - areaRect.left - this.dragOffset.x;
        let newY = clientY - areaRect.top  - this.dragOffset.y;

        newX = Math.max(0, Math.min(newX, areaRect.width  - panel.width));
        newY = Math.max(0, Math.min(newY, areaRect.height - panel.height));

        this.draggedDiv.style.left = newX + 'px';
        this.draggedDiv.style.top  = newY + 'px';
        panel.x = newX;
        panel.y = newY;
    }

    _setSelected(panelId) {
        this.selectedPanelId = panelId;
        // Visual feedback: highlight selected panel
        document.querySelectorAll('.sld-panel-item').forEach(el => {
            el.classList.toggle('sld-panel-selected', parseInt(el.dataset.panelId) === panelId);
        });
    }

    _endDrag() {
        if (!this.isDragging) return;
        if (this.draggedDiv) {
            this.draggedDiv.style.cursor = '';
            this.draggedDiv.style.zIndex = '';
        }
        this.isDragging     = false;
        this.draggedDiv     = null;
        this.draggedPanelId = null;
    }

    // ─── Actions ─────────────────────────────────────────────────────────────

    addPanel() {
        this.panelManager.addPanel();
        this.uiManager.render();
        this.updateCalculations();
    }

    deletePanel(id) {
        this.panelManager.deletePanel(id);
        this.uiManager.render();
        this.updateCalculations();
    }

    reset() {
        if (confirm('Reset all panels?')) {
            this.panelManager.reset();
            this.uiManager.render();
            this.updateCalculations();
        }
    }

    updateRate(rate) {
        const numRate = parseFloat(rate);
        if (this.energyCalculator.setElectricityRate(numRate)) {
            this.updateCalculations();
        } else {
            alert('Please enter a valid positive number.');
            document.getElementById('sld-rate-input').value = this.energyCalculator.electricityRate;
        }
    }

    toggleMap(show) {
        if (this.mapManager) {
            this.mapManager.toggleMap(show);
        }
    }

    updateCalculations() {
        const stats = this.energyCalculator.calculate(this.panelManager.getPanelCount());
        this.uiManager.updateStats(stats);
    }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.solar-designer-container');
    if (!container || typeof solarDesignerData === 'undefined') return;

    if (solarDesignerData.mapEnabled && typeof google === 'undefined') {
        setTimeout(() => {
            new SolarDesigner('.solar-designer-container', solarDesignerData);
        }, 1000);
    } else {
        new SolarDesigner('.solar-designer-container', solarDesignerData);
    }
});
