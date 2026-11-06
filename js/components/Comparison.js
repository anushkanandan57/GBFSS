/**
 * Comparison Component: Greedy Best-First vs A* Optimal Search
 * Evaluates path suboptimality, extra step cost, and controls the A* optimal path overlay.
 */
class Comparison {
    constructor({ onOverlayToggle }) {
        this.onOverlayToggle = onOverlayToggle;
        this.isOverlayActive = false;

        this.greedyResult = null;
        this.astarResult = null;

        this.dom = {
            overlayToggle: document.getElementById('overlayToggleInput'),
            greedyLength: document.getElementById('cmpGreedyLength'),
            greedyExpanded: document.getElementById('cmpGreedyExpanded'),
            astarLength: document.getElementById('cmpAstarLength'),
            astarExpanded: document.getElementById('cmpAstarExpanded'),
            optimalityVerdict: document.getElementById('optimalityVerdictBox')
        };

        this._bindEvents();
    }

    _bindEvents() {
        if (this.dom.overlayToggle) {
            this.dom.overlayToggle.addEventListener('change', (e) => {
                this.isOverlayActive = e.target.checked;
                if (this.onOverlayToggle) {
                    this.onOverlayToggle(this.isOverlayActive);
                }
            });
        }
    }

    setResults(greedyResult, astarResult) {
        this.greedyResult = greedyResult;
        this.astarResult = astarResult;

        if (greedyResult) {
            if (this.dom.greedyLength) this.dom.greedyLength.textContent = greedyResult.pathLength > 0 ? `${greedyResult.pathCost} steps` : 'No Path';
            if (this.dom.greedyExpanded) this.dom.greedyExpanded.textContent = greedyResult.expandedNodes;
        }

        if (astarResult) {
            if (this.dom.astarLength) this.dom.astarLength.textContent = astarResult.pathLength > 0 ? `${astarResult.pathCost} steps` : 'No Path';
            if (this.dom.astarExpanded) this.dom.astarExpanded.textContent = astarResult.expandedNodes;
        }

        this._updateOptimalityVerdict();
    }

    _updateOptimalityVerdict() {
        if (!this.dom.optimalityVerdict) return;

        if (!this.greedyResult || !this.astarResult) {
            this.dom.optimalityVerdict.innerHTML = 'Run search to compare Greedy suboptimality against A*.';
            return;
        }

        if (!this.greedyResult.found) {
            this.dom.optimalityVerdict.innerHTML = '<span style="color:#e11d48; font-weight:700;">No path found to goal.</span>';
            return;
        }

        const gCost = this.greedyResult.pathCost;
        const aCost = this.astarResult.pathCost;
        const diff = gCost - aCost;

        if (diff > 0) {
            const pct = ((diff / aCost) * 100).toFixed(0);
            this.dom.optimalityVerdict.innerHTML = `
                <div style="color: #ea580c; font-weight: 700; margin-bottom: 0.25rem;">
                    ⚠️ Suboptimal Path Found (+${diff} extra steps, ${pct}% longer)
                </div>
                <span>Greedy Best-First followed greedy heuristic gradient <strong>h(n)</strong> into an obstacle detour instead of finding the global minimum path.</span>
            `;
        } else {
            this.dom.optimalityVerdict.innerHTML = `
                <div style="color: #0d9488; font-weight: 700; margin-bottom: 0.25rem;">
                    ✓ Optimal Path Reached (${gCost} steps)
                </div>
                <span>In this topology, Greedy's heuristic path coincided with A*'s optimal shortest path.</span>
            `;
        }
    }

    reset() {
        this.greedyResult = null;
        this.astarResult = null;
        this.isOverlayActive = false;

        if (this.dom.overlayToggle) this.dom.overlayToggle.checked = false;
        if (this.dom.greedyLength) this.dom.greedyLength.textContent = '-';
        if (this.dom.greedyExpanded) this.dom.greedyExpanded.textContent = '-';
        if (this.dom.astarLength) this.dom.astarLength.textContent = '-';
        if (this.dom.astarExpanded) this.dom.astarExpanded.textContent = '-';
        if (this.dom.optimalityVerdict) {
            this.dom.optimalityVerdict.innerHTML = 'Run search to compare Greedy suboptimality against A*.';
        }
    }
}

if (typeof window !== 'undefined') {
    window.Comparison = Comparison;
}
