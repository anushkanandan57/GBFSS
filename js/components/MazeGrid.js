/**
 * Interactive Maze Grid Component
 * Supports Drag-to-Draw walls, dynamic 3D isometric view, and interactive Node Placement Tools (Start, Goal, Wall, Erase).
 */
class MazeGrid {
    constructor(containerId = 'mazeGrid', onGridChange = null) {
        this.container = document.getElementById(containerId);
        this.onGridChange = onGridChange;

        this.rows = 20;
        this.cols = 20;
        this.start = { row: 1, col: 1 };
        this.goal = { row: 18, col: 18 };

        this.matrix = []; // 0 = empty, 1 = wall
        this.cells = [];  // DOM elements

        this.activeTool = 'wall'; // 'start' | 'goal' | 'wall' | 'erase'
        this.isMouseDown = false;
        this.dragMode = null;

        this._setupGlobalMouseEvents();
    }

    init(rows = 20, cols = 20) {
        this.rows = rows;
        this.cols = cols;
        this.start = { row: 1, col: 1 };
        this.goal = { row: rows - 2, col: cols - 2 };

        this.matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
        this.cells = Array.from({ length: rows }, () => Array(cols).fill(null));

        this._renderGrid();
    }

    setActiveTool(tool) {
        this.activeTool = tool;
        if (this.container) {
            this.container.classList.remove('grid-mode-start', 'grid-mode-goal', 'grid-mode-wall', 'grid-mode-erase');
            this.container.classList.add(`grid-mode-${tool}`);
        }
    }

    _renderGrid() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        const cellSize = this._calculateCellSize();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;

                if (r === this.start.row && c === this.start.col) {
                    cell.classList.add('start');
                } else if (r === this.goal.row && c === this.goal.col) {
                    cell.classList.add('goal');
                }

                this._attachCellListeners(cell, r, c);
                this.cells[r][c] = cell;
                this.container.appendChild(cell);
            }
        }
    }

    _calculateCellSize() {
        if (this.cols <= 12) return 34;
        if (this.cols <= 16) return 28;
        if (this.cols <= 20) return 23;
        if (this.cols <= 26) return 18;
        return 14;
    }

    _attachCellListeners(cell, r, c) {
        cell.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isMouseDown = true;

            // Direct tool application or dragging
            if (this.activeTool === 'start') {
                if (!(r === this.goal.row && c === this.goal.col)) {
                    this.moveStart(r, c);
                }
            } else if (this.activeTool === 'goal') {
                if (!(r === this.start.row && c === this.start.col)) {
                    this.moveGoal(r, c);
                }
            } else if (r === this.start.row && c === this.start.col) {
                this.dragMode = 'drag-start';
                cell.classList.add('dragging');
            } else if (r === this.goal.row && c === this.goal.col) {
                this.dragMode = 'drag-goal';
                cell.classList.add('dragging');
            } else if (this.activeTool === 'erase' || this.matrix[r][c] === 1) {
                this.dragMode = 'erase-wall';
                this.setWall(r, c, false);
            } else {
                this.dragMode = 'draw-wall';
                this.setWall(r, c, true);
            }
        });

        cell.addEventListener('mouseenter', () => {
            if (!this.isMouseDown) return;

            if (this.dragMode === 'drag-start' || this.activeTool === 'start') {
                if (!(r === this.goal.row && c === this.goal.col)) {
                    this.moveStart(r, c);
                }
            } else if (this.dragMode === 'drag-goal' || this.activeTool === 'goal') {
                if (!(r === this.start.row && c === this.start.col)) {
                    this.moveGoal(r, c);
                }
            } else if (this.dragMode === 'draw-wall' || this.activeTool === 'wall') {
                if (!(r === this.start.row && c === this.start.col) && !(r === this.goal.row && c === this.goal.col)) {
                    this.setWall(r, c, true);
                }
            } else if (this.dragMode === 'erase-wall' || this.activeTool === 'erase') {
                this.setWall(r, c, false);
            }
        });
    }

    _setupGlobalMouseEvents() {
        window.addEventListener('mouseup', () => {
            if (this.isMouseDown) {
                this.isMouseDown = false;
                if (this.cells[this.start.row][this.start.col]) {
                    this.cells[this.start.row][this.start.col].classList.remove('dragging');
                }
                if (this.cells[this.goal.row][this.goal.col]) {
                    this.cells[this.goal.row][this.goal.col].classList.remove('dragging');
                }
                this.dragMode = null;
                if (this.onGridChange) this.onGridChange();
            }
        });
    }

    setWall(r, c, isWall) {
        if ((r === this.start.row && c === this.start.col) || (r === this.goal.row && c === this.goal.col)) {
            return;
        }
        this.matrix[r][c] = isWall ? 1 : 0;
        const cell = this.cells[r][c];
        if (cell) {
            cell.classList.toggle('wall', isWall);
            cell.classList.remove('visited', 'frontier', 'current', 'path-greedy', 'path-astar', 'backtrack');
        }
    }

    moveStart(newR, newC) {
        const oldCell = this.cells[this.start.row][this.start.col];
        if (oldCell) oldCell.classList.remove('start', 'dragging');

        this.matrix[newR][newC] = 0;
        const newCell = this.cells[newR][newC];
        newCell.classList.remove('wall');
        newCell.classList.add('start');
        this.start = { row: newR, col: newC };
        if (this.onGridChange) this.onGridChange();
    }

    moveGoal(newR, newC) {
        const oldCell = this.cells[this.goal.row][this.goal.col];
        if (oldCell) oldCell.classList.remove('goal', 'dragging');

        this.matrix[newR][newC] = 0;
        const newCell = this.cells[newR][newC];
        newCell.classList.remove('wall');
        newCell.classList.add('goal');
        this.goal = { row: newR, col: newC };
        if (this.onGridChange) this.onGridChange();
    }

    applyWalls(wallsList, animate = true) {
        this.clearWalls();
        if (!animate) {
            wallsList.forEach(({ row, col }) => this.setWall(row, col, true));
            return;
        }

        const delay = Math.max(3, Math.min(10, 800 / wallsList.length));
        wallsList.forEach(({ row, col }, idx) => {
            setTimeout(() => {
                this.setWall(row, col, true);
            }, idx * delay);
        });
    }

    clearWalls() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.matrix[r][c] === 1) {
                    this.matrix[r][c] = 0;
                    this.cells[r][c].classList.remove('wall');
                }
            }
        }
    }

    clearSearchStates() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.cells[r][c];
                cell.classList.remove('visited', 'frontier', 'current', 'path-greedy', 'path-astar', 'backtrack');
            }
        }
    }

    toggle3D(enable = null) {
        if (!this.container) return;
        if (enable === null) {
            this.container.classList.toggle('isometric-3d');
        } else {
            this.container.classList.toggle('isometric-3d', enable);
        }
    }

    getMatrix() {
        return this.matrix;
    }

    getCell(r, c) {
        return this.cells[r] ? this.cells[r][c] : null;
    }
}

if (typeof window !== 'undefined') {
    window.MazeGrid = MazeGrid;
}
