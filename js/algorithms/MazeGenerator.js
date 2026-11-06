/**
 * Maze Generator Algorithms
 * Provides procedural mazes and textbook heuristic trap configurations.
 */
class MazeGenerator {
    /**
     * Creates a textbook concave obstacle trap demonstrating Greedy Best-First suboptimality and backtracking.
     * Greedy rushes into the concave cup driven by lower h(n), hits a dead end, backtracks, and takes a suboptimal winding route.
     * A* finds the optimal shortest path around the obstacle.
     */
    static createSuboptimalTrap(rows, cols, start, goal) {
        const walls = [];

        // 1. Concave U-Cup in the center:
        const cupBottomR = Math.min(rows - 6, 11);
        const cupTopR = Math.max(2, 3);
        const cupLeftC = 3;
        const cupRightC = Math.min(cols - 4, 16);

        // Bottom wall
        for (let c = cupLeftC; c <= cupRightC; c++) {
            walls.push({ row: cupBottomR, col: c });
        }
        // Left wing
        for (let r = cupTopR; r <= cupBottomR; r++) {
            walls.push({ row: r, col: cupLeftC });
        }
        // Right wing
        for (let r = cupTopR; r <= cupBottomR; r++) {
            walls.push({ row: r, col: cupRightC });
        }

        // 2. Asymmetric detour on right side below cup
        const detour1R = Math.min(rows - 4, cupBottomR + 3);
        const detour2R = Math.min(rows - 2, cupBottomR + 5);

        for (let c = Math.floor(cols * 0.6); c < cols; c++) {
            walls.push({ row: detour1R, col: c });
        }
        for (let c = Math.floor(cols * 0.45); c < cols - 2; c++) {
            walls.push({ row: detour2R, col: c });
        }

        return walls;
    }

    /**
     * Procedural Labyrinth Generator (Recursive Backtracker)
     * Guaranteed 100% solvable with authentic branching corridors.
     */
    static recursiveDivision(rows, cols, start, goal) {
        const grid = Array.from({ length: rows }, () => Array(cols).fill(1));

        function carve(r, c) {
            grid[r][c] = 0;

            const dirs = [
                [-2, 0], [2, 0], [0, -2], [0, 2]
            ].sort(() => Math.random() - 0.5);

            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                    grid[r + dr / 2][c + dc / 2] = 0;
                    carve(nr, nc);
                }
            }
        }

        carve(start.row % 2 === 0 ? start.row : start.row - 1, start.col % 2 === 0 ? start.col : start.col - 1);

        grid[start.row][start.col] = 0;
        grid[goal.row][goal.col] = 0;

        // Neighbor connectivity to goal
        const goalNeighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let hasOpenNeighbor = false;
        for (const [dr, dc] of goalNeighbors) {
            const gr = goal.row + dr;
            const gc = goal.col + dc;
            if (gr >= 0 && gr < rows && gc >= 0 && gc < cols && grid[gr][gc] === 0) {
                hasOpenNeighbor = true;
                break;
            }
        }
        if (!hasOpenNeighbor) {
            if (goal.row > 0) grid[goal.row - 1][goal.col] = 0;
            else if (goal.col > 0) grid[goal.row][goal.col - 1] = 0;
        }

        // Add loops for alternative paths
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (grid[r][c] === 1 && Math.random() < 0.15) {
                    grid[r][c] = 0;
                }
            }
        }

        const walls = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    if (!(r === start.row && c === start.col) && !(r === goal.row && c === goal.col)) {
                        walls.push({ row: r, col: c });
                    }
                }
            }
        }

        return walls;
    }

    /**
     * Random obstacle scatter based on density percentage
     */
    static randomDensity(rows, cols, density = 0.28, start, goal) {
        const walls = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if ((r === start.row && c === start.col) || (r === goal.row && c === goal.col)) {
                    continue;
                }
                if ((Math.abs(r - start.row) <= 1 && Math.abs(c - start.col) <= 1) && Math.random() > 0.15) {
                    continue;
                }
                if (Math.random() < density) {
                    walls.push({ row: r, col: c });
                }
            }
        }
        return walls;
    }
}

if (typeof window !== 'undefined') {
    window.MazeGenerator = MazeGenerator;
}
