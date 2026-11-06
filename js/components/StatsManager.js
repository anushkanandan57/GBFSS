/**
 * Telemetry & Statistics Manager Component
 * Tracks Expansion Order, Frontier/Open-list, Visited/Closed-list, Heuristic Score, and Backtracking State.
 */
class StatsManager {
    constructor() {
        this.dom = {
            expansionOrder: document.getElementById('statExpansionOrder'),
            currentNode: document.getElementById('statCurrentNode'),
            frontierSize: document.getElementById('statFrontierSize'),
            visitedCount: document.getElementById('statVisitedCount'),
            heuristicVal: document.getElementById('statHeuristicVal'),
            execTime: document.getElementById('statExecTime'),
            backtrackAlert: document.getElementById('statBacktrackAlert')
        };
    }

    updateLiveTelemetry(step) {
        if (!step) return;

        if (this.dom.expansionOrder) {
            this.dom.expansionOrder.textContent = `#${step.expansionOrder}`;
        }
        if (this.dom.currentNode) {
            this.dom.currentNode.textContent = `(${step.currentNode.row}, ${step.currentNode.col})`;
        }
        if (this.dom.frontierSize) {
            this.dom.frontierSize.textContent = `${step.frontier.length} nodes`;
        }
        if (this.dom.visitedCount) {
            this.dom.visitedCount.textContent = `${step.visitedNodes.size} nodes`;
        }
        if (this.dom.heuristicVal) {
            this.dom.heuristicVal.textContent = `h = ${step.heuristic}`;
        }

        // Backtracking alert
        if (this.dom.backtrackAlert) {
            if (step.isBacktracking) {
                this.dom.backtrackAlert.className = 'backtrack-alert-box active';
                this.dom.backtrackAlert.innerHTML = `
                    <span style="font-size: 1rem;">⚠️</span>
                    <span><strong>Dead End!</strong> Backtracking to next best frontier node</span>
                `;
            } else {
                this.dom.backtrackAlert.className = 'backtrack-alert-box';
                this.dom.backtrackAlert.innerHTML = `
                    <span>🔍</span>
                    <span>Greedy forward expansion via min h(n)</span>
                `;
            }
        }
    }

    setExecutionTime(ms) {
        if (this.dom.execTime) {
            this.dom.execTime.textContent = `${ms.toFixed(1)} ms`;
        }
    }

    reset() {
        if (this.dom.expansionOrder) this.dom.expansionOrder.textContent = '#0';
        if (this.dom.currentNode) this.dom.currentNode.textContent = '-';
        if (this.dom.frontierSize) this.dom.frontierSize.textContent = '0 nodes';
        if (this.dom.visitedCount) this.dom.visitedCount.textContent = '0 nodes';
        if (this.dom.heuristicVal) this.dom.heuristicVal.textContent = 'h = -';
        if (this.dom.execTime) this.dom.execTime.textContent = '0.0 ms';
        if (this.dom.backtrackAlert) {
            this.dom.backtrackAlert.className = 'backtrack-alert-box';
            this.dom.backtrackAlert.innerHTML = `
                <span>ℹ️</span>
                <span>Ready to search maze</span>
            `;
        }
    }
}

if (typeof window !== 'undefined') {
    window.StatsManager = StatsManager;
}
