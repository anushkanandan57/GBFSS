/**
 * Application Master Orchestrator: Greedy Best-First Search Visualizer
 * Focuses strictly on Greedy Best-First Search, heuristic traps, backtracking, and A* optimal comparison.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management (Light / Dark with LocalStorage persistence)
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('gbfs_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('gbfs_theme', next);
            updateThemeIcon(next);
            Toast.show(`Switched to ${next} mode`, 'info');
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>`;
            themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
        } else {
            themeToggleBtn.innerHTML = `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>`;
            themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
        }
    }

    // 2. State & Component Instances
    let currentHistory = [];
    let greedyResult = null;
    let astarResult = null;
    let gridSize = 20;

    const stats = new StatsManager();
    const comparison = new Comparison({
        onOverlayToggle: (active) => {
            renderCurrentStepWithOverlay();
            Toast.show(active ? 'A* optimal path overlay visible (Cyan)' : 'A* overlay hidden', 'info');
        }
    });

    const grid = new MazeGrid('mazeGrid', () => {
        onGridModified();
    });

    const controls = new Controls({
        onStep: (index) => renderStep(index),
        onStateChange: (isPlaying) => {
            const playBtn = document.getElementById('canvasPlayBtn');
            if (playBtn) playBtn.classList.toggle('active-play', isPlaying);
        }
    });

    // Initialize Grid with default 20x20
    grid.init(gridSize, gridSize);
    stats.reset();

    // 3. Tool Picker: Start Node, Goal Node, Draw Wall, Erase Wall
    const toolBtns = {
        start: document.getElementById('toolStartBtn'),
        goal: document.getElementById('toolGoalBtn'),
        wall: document.getElementById('toolWallBtn'),
        erase: document.getElementById('toolEraseBtn')
    };

    function selectTool(tool) {
        Object.keys(toolBtns).forEach(t => {
            if (toolBtns[t]) toolBtns[t].classList.toggle('active', t === tool);
        });
        grid.setActiveTool(tool);
    }

    if (toolBtns.start) toolBtns.start.addEventListener('click', () => selectTool('start'));
    if (toolBtns.goal) toolBtns.goal.addEventListener('click', () => selectTool('goal'));
    if (toolBtns.wall) toolBtns.wall.addEventListener('click', () => selectTool('wall'));
    if (toolBtns.erase) toolBtns.erase.addEventListener('click', () => selectTool('erase'));

    // 4. 3D View Mode Segmented Switch
    const btnView2D = document.getElementById('btnView2D');
    const btnView3D = document.getElementById('btnView3D');

    function setViewMode(is3D) {
        grid.toggle3D(is3D);
        if (btnView2D) btnView2D.classList.toggle('active', !is3D);
        if (btnView3D) btnView3D.classList.toggle('active', is3D);
        Toast.show(is3D ? '3D Isometric View enabled' : '2D Flat View enabled', 'info');
    }

    if (btnView2D) btnView2D.addEventListener('click', () => setViewMode(false));
    if (btnView3D) btnView3D.addEventListener('click', () => setViewMode(true));

    // 5. Speed Multiplier Steps (0.25x, 0.5x, 1x, 2x, 4x)
    const speedStepBtns = document.querySelectorAll('.speed-step-btn');
    speedStepBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            speedStepBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const mult = parseFloat(e.currentTarget.dataset.speed);
            controls.setMultiplier(mult);
            Toast.show(`Animation speed set to ${mult}x`, 'info');
        });
    });

    // 6. Grid Size Slider
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gridSizeLabel = document.getElementById('gridSizeLabel');
    if (gridSizeSlider) {
        gridSizeSlider.addEventListener('input', (e) => {
            gridSize = parseInt(e.target.value, 10);
            if (gridSizeLabel) gridSizeLabel.textContent = `${gridSize} × ${gridSize}`;
            controls.pause();
            currentHistory = [];
            grid.init(gridSize, gridSize);
            stats.reset();
            comparison.reset();
        });
    }

    // 7. Core Algorithm Execution: Run Greedy Best-First Search
    const runGreedyBtn = document.getElementById('runGreedyBtn');
    if (runGreedyBtn) {
        runGreedyBtn.addEventListener('click', () => triggerGreedySearch());
    }

    function triggerGreedySearch() {
        controls.pause();
        clearSearchOnly();

        const matrix = grid.getMatrix();

        // 1. Run Greedy Best-First Search (using strictly h(n), ignoring path cost)
        greedyResult = Pathfinder.run(matrix, grid.start, grid.goal, 'greedy', 'manhattan');

        // 2. Concurrently compute A* optimal benchmark for comparison overlay
        astarResult = Pathfinder.run(matrix, grid.start, grid.goal, 'astar', 'manhattan');

        // Update statistics and comparison matrix
        stats.setExecutionTime(greedyResult.executionTime);
        comparison.setResults(greedyResult, astarResult);

        if (!greedyResult.found) {
            Toast.show('No reachable path! Greedy hit dead ends on all branches.', 'warn');
        } else {
            const diff = greedyResult.pathCost - astarResult.pathCost;
            if (diff > 0) {
                Toast.show(`Greedy took a SUBOPTIMAL path (+${diff} extra steps vs A*)!`, 'warn');
            } else {
                Toast.show(`Greedy found path in ${greedyResult.executionTime.toFixed(1)}ms!`, 'success');
            }
        }

        currentHistory = greedyResult.history;
        controls.load(currentHistory.length);

        if (currentHistory.length > 0) {
            renderStep(0);
            controls.play();
        }
    }

    // 8. Preset Suboptimal Trap Maze & Other Maze Generators
    const loadTrapBtn = document.getElementById('loadTrapBtn');
    if (loadTrapBtn) {
        loadTrapBtn.addEventListener('click', () => {
            controls.pause();
            clearSearchOnly();
            const trapWalls = MazeGenerator.createSuboptimalTrap(grid.rows, grid.cols, grid.start, grid.goal);
            grid.applyWalls(trapWalls, true);
            Toast.show('Loaded concave obstacle trap! Greedy will be lured into the cup.', 'info');
        });
    }

    const generateMazeBtn = document.getElementById('generateMazeBtn');
    if (generateMazeBtn) {
        generateMazeBtn.addEventListener('click', () => {
            controls.pause();
            clearSearchOnly();
            const walls = MazeGenerator.recursiveDivision(grid.rows, grid.cols, grid.start, grid.goal);
            grid.applyWalls(walls, true);
            Toast.show('Procedural labyrinth maze generated!', 'success');
        });
    }

    const randomWallsBtn = document.getElementById('randomWallsBtn');
    if (randomWallsBtn) {
        randomWallsBtn.addEventListener('click', () => {
            controls.pause();
            clearSearchOnly();
            const walls = MazeGenerator.randomDensity(grid.rows, grid.cols, 0.28, grid.start, grid.goal);
            grid.applyWalls(walls, true);
            Toast.show('Random wall cluster generated!', 'info');
        });
    }

    const clearGridBtn = document.getElementById('clearGridBtn');
    if (clearGridBtn) {
        clearGridBtn.addEventListener('click', () => {
            controls.pause();
            currentHistory = [];
            greedyResult = null;
            astarResult = null;
            grid.clearWalls();
            grid.clearSearchStates();
            stats.reset();
            comparison.reset();
            Toast.show('Grid cleared.', 'info');
        });
    }

    const resetAllBtn = document.getElementById('resetAllBtn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            controls.pause();
            currentHistory = [];
            greedyResult = null;
            astarResult = null;
            gridSize = 20;
            if (gridSizeSlider) gridSizeSlider.value = 20;
            if (gridSizeLabel) gridSizeLabel.textContent = '20 × 20';
            selectTool('wall');
            grid.init(20, 20);
            stats.reset();
            comparison.reset();
            Toast.show('Reset visualizer to defaults.', 'info');
        });
    }

    // 9. Frame-by-frame Step Rendering
    function renderStep(index) {
        const step = currentHistory[index];
        if (!step) return;

        grid.clearSearchStates();

        // Render A* optimal path overlay if checked
        if (comparison.isOverlayActive && astarResult && astarResult.path) {
            astarResult.path.forEach(node => {
                const cell = grid.getCell(node.row, node.col);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                    cell.classList.add('path-astar');
                }
            });
        }

        // Render Visited / Closed-List Nodes
        step.visitedNodes.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const cell = grid.getCell(r, c);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                cell.classList.add('visited');
            }
        });

        // Render Frontier / Open-List Nodes
        step.frontier.forEach(node => {
            const cell = grid.getCell(node.row, node.col);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                cell.classList.add('frontier');
            }
        });

        // Render Current Evaluating Node
        const currCell = grid.getCell(step.currentNode.row, step.currentNode.col);
        if (currCell && !currCell.classList.contains('start') && !currCell.classList.contains('goal')) {
            currCell.classList.add('current');
            if (step.isBacktracking) {
                currCell.classList.add('backtrack');
            }
        }

        // Render Final Greedy Path if Goal Reached
        if (step.found && step.currentPath) {
            step.currentPath.forEach(node => {
                const cell = grid.getCell(node.row, node.col);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                    cell.classList.add('path-greedy');
                }
            });
        }

        // Update live assignment telemetry
        stats.updateLiveTelemetry(step);
    }

    function renderCurrentStepWithOverlay() {
        if (currentHistory.length > 0) {
            renderStep(controls.currentIndex);
        } else {
            grid.clearSearchStates();
            if (comparison.isOverlayActive && astarResult && astarResult.path) {
                astarResult.path.forEach(node => {
                    const cell = grid.getCell(node.row, node.col);
                    if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                        cell.classList.add('path-astar');
                    }
                });
            }
        }
    }

    function clearSearchOnly() {
        controls.pause();
        currentHistory = [];
        grid.clearSearchStates();
        stats.reset();
    }

    function onGridModified() {
        if (currentHistory.length > 0) {
            controls.pause();
            clearSearchOnly();
            comparison.reset();
        }
    }

    // 10. Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (currentHistory.length === 0) triggerGreedySearch();
                else controls.togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                controls.stepForward();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                controls.stepBack();
                break;
            case 'g':
            case 'G':
                e.preventDefault();
                generateMazeBtn?.click();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                resetAllBtn?.click();
                break;
        }
    });

    // Default to wall tool
    selectTool('wall');

    // Welcome banner
    setTimeout(() => {
        Toast.show('Greedy Best-First Search Visualizer ready.', 'info');
    }, 300);
});
