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
                this.mapManager.onLocationChange = (newLat, newLng) => this._onLocationReady(newLat, newLng);

                const searchInput = document.getElementById('sld-address-search');
                const searchBtn   = document.getElementById('sld-search-btn');
                if (searchInput && searchBtn) {
                    this.mapManager.setupAddressSearch(searchInput, searchBtn);
                }

                // Fetch irradiance for the initial map location
                this._onLocationReady(lat, lng);
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

        const initialRate = parseFloat(containerData.rate) || config.defaultRate;
        this.energyCalculator.setElectricityRate(initialRate);

        // Drag state
        this.isDragging      = false;
        this.draggedDiv      = null;
        this.draggedPanelId  = null;
        this.dragOffset      = { x: 0, y: 0 };

        // Rotation state
        this.isRotating      = false;
        this.rotatingDiv     = null;
        this.rotatingPanelId = null;

        // Selection state (for keyboard delete / rotate / duplicate)
        this.selectedPanelId = null;

        // Touch state — tap/drag/double-tap disambiguation
        this._touchStartX     = 0;
        this._touchStartY     = 0;
        this._touchPendingDiv = null;
        this._touchDragStarted = false;
        this._lastTapTime     = 0;
        this._lastTapPanelId  = null;

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

    // ─── PVGIS Location-aware irradiance ────────────────────────────────────

    /**
     * Fetch live solar irradiance from PVGIS for the given coordinates.
     * Updates the energy calculator and shows/hides the source line.
     */
    async _onLocationReady(lat, lng) {
        if (!this.mapManager) return;

        const dataEl = document.getElementById('sld-solar-data');
        const textEl = document.getElementById('sld-solar-data-text');
        if (!dataEl || !textEl) return;

        textEl.textContent = '⏳ Fetching solar irradiance data…';
        dataEl.style.display = 'block';

        const proxyUrl = this.config.ajaxUrl ? this.config.ajaxUrl + '?action=sld_pvgis' : null;
        const result = await this.mapManager.fetchSolarIrradiance(lat, lng, proxyUrl);

        if (result) {
            const E_y = result.annualKwhPerKwp;
            const peakPower = this.config.panelSpecs.peakPower;
            const energyPerPanel = Math.round((peakPower / 1000) * E_y);
            this.energyCalculator.setEnergyPerPanel(energyPerPanel);
            this.updateCalculations();
            textEl.textContent = `☀ ${Math.round(E_y).toLocaleString()} kWh/kWp/yr · ${energyPerPanel.toLocaleString()} kWh/panel/yr — source: PVGIS`;
            dataEl.style.display = 'block';
        } else {
            this.energyCalculator.setEnergyPerPanel(this.config.panelSpecs.wattage);
            this.updateCalculations();
            dataEl.style.display = 'none';
        }
    }

    // ─── Event Listeners ────────────────────────────────────────────────────

    setupEventListeners() {
        document.getElementById('sld-add-panel').addEventListener('click', () => this.addPanel());
        document.getElementById('sld-reset').addEventListener('click', () => this.reset());
        document.getElementById('sld-rate-input').addEventListener('change', e => this.updateRate(e.target.value));

        const dupBtn = document.getElementById('sld-duplicate');
        if (dupBtn) dupBtn.addEventListener('click', () => this.duplicatePanel());

        const mapToggle = document.getElementById('sld-toggle-map');
        if (mapToggle && this.mapManager) {
            mapToggle.addEventListener('change', e => this.toggleMap(e.target.checked));
        }

        // Event delegation on panel area for drag + delete
        const panelArea = document.getElementById('sld-panel-area');

        // mousedown → rotation handle takes priority, then drag
        panelArea.addEventListener('mousedown', e => {
            if (e.target.classList.contains('sld-rotate-handle')) {
                const div = e.target.closest('.sld-panel-item');
                if (div) { this._startRotate(div, e.clientX, e.clientY); return; }
            }
            const div = e.target.closest('.sld-panel-item');
            if (div) this._startDrag(div, e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', e => {
            if (this.isRotating) { this._moveRotate(e.clientX, e.clientY); return; }
            if (this.isDragging)   this._moveDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', () => { this._endDrag(); this._endRotate(); });

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
            if (e.key === 'Escape') {
                this._setSelected(null);
            }
        });

        // Single click → select panel (for keyboard delete)
        panelArea.addEventListener('click', e => {
            const div = e.target.closest('.sld-panel-item');
            this._setSelected(div ? parseInt(div.dataset.panelId) : null);
        });

        // Click outside panels → deselect
        document.addEventListener('click', e => {
            if (!e.target.closest('.sld-panel-item') && !e.target.closest('.sld-btn') && !e.target.closest('.sld-input')) {
                this._setSelected(null);
            }
        }, true);

        // Touch support — tap-to-select, drag, rotation, and double-tap-to-delete
        panelArea.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!el) return;
            const div = el.closest('.sld-panel-item');
            if (!div) return;

            // Rotation handle takes priority
            if (el.classList.contains('sld-rotate-handle')) {
                e.preventDefault();
                this._startRotate(div, touch.clientX, touch.clientY);
                return;
            }

            e.preventDefault();
            // Record start position for tap vs. drag disambiguation
            this._touchStartX      = touch.clientX;
            this._touchStartY      = touch.clientY;
            this._touchPendingDiv  = div;
            this._touchDragStarted = false;

            // Select immediately so rotation handle becomes visible for a follow-up touch
            this._setSelected(parseInt(div.dataset.panelId));
        }, { passive: false });

        document.addEventListener('touchmove', e => {
            // Rotation
            if (this.isRotating) {
                e.preventDefault();
                this._moveRotate(e.touches[0].clientX, e.touches[0].clientY);
                return;
            }

            // Drag — lazily started once finger moves > 5px
            const touch = e.touches[0];
            if (!this._touchDragStarted && this._touchPendingDiv) {
                const dx = touch.clientX - this._touchStartX;
                const dy = touch.clientY - this._touchStartY;
                if (Math.hypot(dx, dy) > 5) {
                    this._touchDragStarted = true;
                    // Use original touch-down position for correct drag offset
                    this._startDrag(this._touchPendingDiv, this._touchStartX, this._touchStartY);
                    e.preventDefault();
                    this._moveDrag(touch.clientX, touch.clientY);
                }
                return;
            }

            if (this.isDragging) {
                e.preventDefault();
                this._moveDrag(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (this.isRotating) {
                this._endRotate();
                this._touchPendingDiv  = null;
                return;
            }

            if (this.isDragging) {
                this._endDrag();
                this._touchPendingDiv  = null;
                this._touchDragStarted = false;
                return;
            }

            // It was a tap — check for double-tap (delete)
            if (this._touchPendingDiv) {
                const panelId = parseInt(this._touchPendingDiv.dataset.panelId);
                const now = Date.now();
                if (this._lastTapPanelId === panelId && (now - this._lastTapTime) < 300) {
                    this.deletePanel(panelId);
                    this._lastTapTime    = 0;
                    this._lastTapPanelId = null;
                } else {
                    this._lastTapTime    = now;
                    this._lastTapPanelId = panelId;
                }
            }

            this._touchPendingDiv  = null;
            this._touchDragStarted = false;
        });

        window.addEventListener('resize', () => { if (this.mapManager) this.mapManager.resize(); });
    }

    // ─── Drag helpers ────────────────────────────────────────────────────────

    _startDrag(div, clientX, clientY) {
        const panel = this.panelManager.panels.find(p => p.id === parseInt(div.dataset.panelId));
        if (!panel) return;

        const areaRect = document.getElementById('sld-panel-area').getBoundingClientRect();
        this.isDragging     = true;
        this.draggedDiv     = div;
        this.draggedPanelId = parseInt(div.dataset.panelId);
        this._areaRect      = areaRect;
        // Use stored panel.x/y so offset is correct even when the panel is rotated
        this.dragOffset     = {
            x: clientX - areaRect.left - panel.x,
            y: clientY - areaRect.top  - panel.y
        };
        document.body.style.cursor = 'grabbing';
        document.body.classList.add('sld-is-dragging');
        div.style.zIndex = '200';
    }

    _moveDrag(clientX, clientY) {
        if (!this.draggedDiv) return;

        const panel    = this.panelManager.panels.find(p => p.id === this.draggedPanelId);
        if (!panel) return;

        const areaRect = this._areaRect || document.getElementById('sld-panel-area').getBoundingClientRect();
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
        this.panelManager.panels.forEach(p => { p.selected = (p.id === panelId); });
        document.querySelectorAll('.sld-panel-item').forEach(el => {
            el.classList.toggle('sld-panel-selected', parseInt(el.dataset.panelId) === panelId);
        });
        // Enable/disable duplicate button
        const dupBtn = document.getElementById('sld-duplicate');
        if (dupBtn) dupBtn.disabled = (panelId === null);
    }

    _endDrag() {
        if (!this.isDragging) return;
        if (this.draggedDiv) {
            this.draggedDiv.style.zIndex = '';
        }
        document.body.style.cursor = '';
        document.body.classList.remove('sld-is-dragging');
        this.isDragging     = false;
        this.draggedDiv     = null;
        this.draggedPanelId = null;
        this._areaRect      = null;
    }

    // ─── Rotation helpers ─────────────────────────────────────────────────────

    _startRotate(panelDiv, clientX, clientY) {
        this.isRotating      = true;
        this.rotatingDiv     = panelDiv;
        this.rotatingPanelId = parseInt(panelDiv.dataset.panelId);
        this._areaRect       = document.getElementById('sld-panel-area').getBoundingClientRect();
    }

    _moveRotate(clientX, clientY) {
        const panel = this.panelManager.panels.find(p => p.id === this.rotatingPanelId);
        if (!panel) return;
        const areaRect = this._areaRect || document.getElementById('sld-panel-area').getBoundingClientRect();
        const centerX  = areaRect.left + panel.x + panel.width  / 2;
        const centerY  = areaRect.top  + panel.y + panel.height / 2;
        // +90 so that 0° = handle pointing up (north)
        const angle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI + 90;
        panel.rotation = angle;
        this.rotatingDiv.style.transform = `rotate(${angle}deg)`;
    }

    _endRotate() {
        if (!this.isRotating) return;
        this.isRotating      = false;
        this.rotatingDiv     = null;
        this.rotatingPanelId = null;
        this._areaRect       = null;
    }

    // ─── Actions ─────────────────────────────────────────────────────────────

    addPanel() {
        this.panelManager.addPanel();
        this.uiManager.render();
        this.updateCalculations();
    }

    deletePanel(id) {
        if (this.selectedPanelId === id) this._setSelected(null);
        if (id === this.draggedPanelId) this._endDrag();
        this.panelManager.deletePanel(id);
        this.uiManager.render();
        this.updateCalculations();
    }

    duplicatePanel() {
        if (this.selectedPanelId === null) return;
        const newPanel = this.panelManager.duplicatePanel(this.selectedPanelId);
        if (newPanel) {
            this.uiManager.render();
            this._setSelected(newPanel.id);
            this.updateCalculations();
        }
    }

    reset() {
        if (confirm('Reset all panels?')) {
            this._setSelected(null);
            this._endDrag();
            this._endRotate();
            this.isDragging = false;
            this.draggedDiv = null;
            this.draggedPanelId = null;
            this.dragOffset = { x: 0, y: 0 };
            this.isRotating = false;
            this.rotatingDiv = null;
            this.rotatingPanelId = null;
            this._areaRect = null;
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

    new SolarDesigner('.solar-designer-container', solarDesignerData);
});
