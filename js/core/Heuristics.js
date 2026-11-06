/**
 * Heuristic Distance Metrics for Informed Search Algorithms
 */
const Heuristics = {
    /**
     * Manhattan distance (ideal for 4-directional grid movement)
     * h(n) = |x1 - x2| + |y1 - y2|
     */
    manhattan: (a, b) => {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    },

    /**
     * Euclidean distance (straight-line Euclidean metric)
     * h(n) = sqrt((x1 - x2)^2 + (y1 - y2)^2)
     */
    euclidean: (a, b) => {
        const dRow = a.row - b.row;
        const dCol = a.col - b.col;
        return Math.sqrt(dRow * dRow + dCol * dCol);
    },

    /**
     * Chebyshev distance (grid movement with diagonal moves)
     */
    chebyshev: (a, b) => {
        return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
    }
};

if (typeof window !== 'undefined') {
    window.Heuristics = Heuristics;
}
