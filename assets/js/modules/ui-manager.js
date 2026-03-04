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
        if (panel.selected) div.classList.add('sld-panel-selected');
        div.dataset.panelId = panel.id;
        div.style.left      = panel.x + 'px';
        div.style.top       = panel.y + 'px';
        div.style.width     = panel.width + 'px';
        div.style.height    = panel.height + 'px';
        div.style.transform = `rotate(${panel.rotation}deg)`;
        div.title = 'Drag: move | Double-click: delete';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `Solar panel #${panel.id + 1}`);

        // Apply entrance animation
        div.classList.add('sld-panel-enter');
        setTimeout(() => div.classList.remove('sld-panel-enter'), 300);

        // Rotation handle — tiny circle at top-center, only visible when selected
        const handle = document.createElement('div');
        handle.className = 'sld-rotate-handle';
        div.appendChild(handle);

        // Panel number label — shown on hover via CSS
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
        const countEl = document.getElementById('sld-panel-count');
        const annualEl = document.getElementById('sld-annual-kwh');
        const monthlyEl = document.getElementById('sld-monthly-kwh');
        const savingsEl = document.getElementById('sld-annual-savings');

        if (countEl) countEl.textContent    = stats.panelCount;
        if (annualEl) annualEl.textContent     = EnergyCalculator.formatNumber(stats.annualEnergy);
        if (monthlyEl) monthlyEl.textContent    = EnergyCalculator.formatNumber(stats.monthlyAverage);
        if (savingsEl) savingsEl.textContent = EnergyCalculator.formatNumber(stats.annualSavings);
    }

}

window.UIManager = UIManager;
