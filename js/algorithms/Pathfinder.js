/**
 * Pathfinder Engine: Greedy Best-First Search & A* Search
 * Implements heuristic-only evaluation h(n) for GBFS and f(n) = g(n) + h(n) for A*.
 * Detailed step telemetry includes node expansion order, frontier/open-list, visited/closed-list, and backtracking detection.
 */
class Pathfinder {
    /**
     * Run search algorithm on grid
     * @param {Array<Array<number>>} grid - 2D grid matrix (0=empty, 1=wall)
     * @param {Object} start - {row, col}
     * @param {Object} goal - {row, col}
     * @param {'greedy'|'astar'} algorithm - 'greedy' or 'astar'
     * @param {string} heuristicType - 'manhattan'
     * @returns {Object} Complete trajectory and evaluation metrics
     */
    static run(grid, start, goal, algorithm = 'greedy', heuristicType = 'manhattan') {
        const startTime = performance.now();
        const rows = grid.length;
        const cols = grid[0].length;
        const heuristicFn = Heuristics[heuristicType] || Heuristics.manhattan;

        const frontier = new PriorityQueue();
        const startH = heuristicFn(start, goal);

        // Enqueue start node
        frontier.enqueue(start, algorithm === 'greedy' ? startH : startH);

        const visited = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const expandedSet = new Set();
        const history = [];

        const startKey = `${start.row},${start.col}`;
        gScore.set(startKey, 0);

        let found = false;
        let goalNode = null;
        let expansionCount = 0;
        let prevNode = null;

        // Initial snapshot
        history.push({
            currentNode: start,
            expansionOrder: 0,
            visitedNodes: new Set(),
            frontier: [start],
            expandedNodes: new Set(),
            currentPath: [start],
            heuristic: startH,
            gScore: 0,
            fScore: startH,
            isBacktracking: false,
            found: false
        });

        while (!frontier.isEmpty()) {
            const current = frontier.dequeue();
            const currentKey = `${current.row},${current.col}`;

            if (visited.has(currentKey)) continue;
            visited.add(currentKey);
            expandedSet.add(currentKey);
            expansionCount++;

            // Backtracking detection: if current node is not orthogonal neighbor of previous node
            let isBacktracking = false;
            if (prevNode) {
                const distFromPrev = Math.abs(current.row - prevNode.row) + Math.abs(current.col - prevNode.col);
                if (distFromPrev > 1) {
                    isBacktracking = true; // Retreating from dead-end to another frontier branch
                }
            }
            prevNode = current;

            const currH = heuristicFn(current, goal);
            const currG = gScore.get(currentKey) || 0;
            const currF = currG + currH;

            // Target reached
            if (current.row === goal.row && current.col === goal.col) {
                found = true;
                goalNode = current;
                const path = this.reconstructPath(cameFrom, current);
                history.push({
                    currentNode: current,
                    expansionOrder: expansionCount,
                    visitedNodes: new Set(visited),
                    frontier: frontier.toArray(),
                    expandedNodes: new Set(expandedSet),
                    currentPath: path,
                    heuristic: 0,
                    gScore: currG,
                    fScore: algorithm === 'greedy' ? 0 : currG,
                    isBacktracking: false,
                    found: true
                });
                break;
            }

            // Expand 4-way neighbors (North, East, South, West)
            const neighbors = this.getNeighbors(grid, current, rows, cols);

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.row},${neighbor.col}`;
                const tentativeG = currG + 1;

                if (algorithm === 'greedy') {
                    // Greedy Best-First: considers ONLY h(n), completely ignores path cost g(n)
                    if (!visited.has(neighborKey)) {
                        cameFrom.set(neighborKey, current);
                        const h = heuristicFn(neighbor, goal);
                        frontier.enqueue(neighbor, h);
                    }
                } else {
                    // A* Search: considers f(n) = g(n) + h(n)
                    if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                        cameFrom.set(neighborKey, current);
                        gScore.set(neighborKey, tentativeG);
                        const h = heuristicFn(neighbor, goal);
                        const f = tentativeG + h;
                        frontier.enqueue(neighbor, f);
                    }
                }
            }

            // Snapshot step for interactive animation scrubber
            history.push({
                currentNode: current,
                expansionOrder: expansionCount,
                visitedNodes: new Set(visited),
                frontier: frontier.toArray(),
                expandedNodes: new Set(expandedSet),
                currentPath: this.reconstructPath(cameFrom, current),
                heuristic: currH,
                gScore: currG,
                fScore: algorithm === 'greedy' ? currH : currF,
                isBacktracking: isBacktracking,
                found: false
            });
        }

        const endTime = performance.now();
        const finalPath = found ? this.reconstructPath(cameFrom, goalNode) : [];
        const pathLength = finalPath.length;

        return {
            algorithm,
            found,
            path: finalPath,
            pathLength: pathLength,
            pathCost: pathLength > 0 ? pathLength - 1 : 0,
            expandedNodes: expandedSet.size,
            executionTime: endTime - startTime,
            history
        };
    }

    static getNeighbors(grid, node, rows, cols) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 0, col: -1 }
        ];

        for (const dir of directions) {
            const nextRow = node.row + dir.row;
            const nextCol = node.col + dir.col;

            if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
                if (grid[nextRow][nextCol] !== 1) {
                    neighbors.push({ row: nextRow, col: nextCol });
                }
            }
        }
        return neighbors;
    }

    static reconstructPath(cameFrom, current) {
        if (!current) return [];
        const path = [current];
        let currKey = `${current.row},${current.col}`;

        while (cameFrom.has(currKey)) {
            const prev = cameFrom.get(currKey);
            path.unshift(prev);
            currKey = `${prev.row},${prev.col}`;
        }
        return path;
    }
}

if (typeof window !== 'undefined') {
    window.Pathfinder = Pathfinder;
}
