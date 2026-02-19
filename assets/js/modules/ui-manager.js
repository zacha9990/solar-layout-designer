/**
 * UI Manager Class - DOM-based panel rendering
 * Panels are rendered as absolutely-positioned divs, not canvas drawing.
 */
class UIManager {
    constructor(panelArea, panelManager, mapManager = null) {
        this.panelArea = panelArea;
        this.panelManager = panelManager;
        this.mapManager = mapManager;
    }

    /**
     * Full render - rebuild all panel divs from panelManager state
     */
    render() {
        // Remove existing panel divs
        const existing = this.panelArea.querySelectorAll('.sld-panel-item');
        existing.forEach(el => el.remove());

        const helper = this.panelArea.querySelector('.sld-helper-text');

        if (this.panelManager.panels.length === 0) {
            if (!helper) {
                const p = document.createElement('p');
                p.className = 'sld-helper-text';
                p.textContent = 'Click "Add Panel" to start designing';
                this.panelArea.appendChild(p);
            }
            return;
        }

        if (helper) helper.remove();

        this.panelManager.panels.forEach(panel => {
            this.panelArea.appendChild(this._createPanelDiv(panel));
        });
    }

    /**
     * Create the div element for one panel
     */
    _createPanelDiv(panel) {
        const div = document.createElement('div');
        div.className = 'sld-panel-item';
        div.dataset.panelId = panel.id;
        div.style.left   = panel.x + 'px';
        div.style.top    = panel.y + 'px';
        div.style.width  = panel.width + 'px';
        div.style.height = panel.height + 'px';
        div.title = 'Drag: pindah panel | Double-click: hapus panel';

        // Panel number label — always present, shown on hover via CSS
        const label = document.createElement('span');
        label.className = 'sld-panel-label';
        label.textContent = '#' + (panel.id + 1);
        div.appendChild(label);

        return div;
    }

    /**
     * Update statistics display
     */
    updateStats(stats) {
        document.getElementById('sld-panel-count').textContent    = stats.panelCount;
        document.getElementById('sld-annual-kwh').textContent     = EnergyCalculator.formatNumber(stats.annualEnergy);
        document.getElementById('sld-monthly-kwh').textContent    = EnergyCalculator.formatNumber(stats.monthlyAverage);
        document.getElementById('sld-annual-savings').textContent = EnergyCalculator.formatNumber(stats.annualSavings);
    }

    /**
     * Toggle map visibility (delegated to MapManager)
     */
    updateMapVisibility(isVisible) {
        if (this.mapManager) {
            this.mapManager.toggleMap(isVisible);
        }
    }
}

window.UIManager = UIManager;
