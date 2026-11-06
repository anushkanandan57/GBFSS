/**
 * High-Performance Binary Min-Heap Priority Queue
 * Implements O(log N) insertion and extraction for lightning-fast graph searches.
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    /**
     * Enqueue element with given numerical priority (lower = higher priority)
     * @param {*} element 
     * @param {number} priority 
     */
    enqueue(element, priority) {
        const node = { element, priority };
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    /**
     * Dequeue element with lowest priority value
     * @returns {*} Element with minimum priority
     */
    dequeue() {
        if (this.isEmpty()) return null;
        const min = this.heap[0].element;
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this._sinkDown(0);
        }
        return min;
    }

    /**
     * Inspect lowest priority element without removing
     */
    peek() {
        return this.isEmpty() ? null : this.heap[0].element;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    size() {
        return this.heap.length;
    }

    toArray() {
        return this.heap.map(node => node.element);
    }

    clear() {
        this.heap = [];
    }

    _bubbleUp(index) {
        const item = this.heap[index];
        while (index > 0) {
            const parentIdx = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIdx];
            if (item.priority >= parent.priority) break;
            this.heap[index] = parent;
            this.heap[parentIdx] = item;
            index = parentIdx;
        }
    }

    _sinkDown(index) {
        const length = this.heap.length;
        const item = this.heap[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let swapIdx = null;

            if (leftChildIdx < length) {
                if (this.heap[leftChildIdx].priority < item.priority) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                const rightPri = this.heap[rightChildIdx].priority;
                const comparePri = swapIdx === null ? item.priority : this.heap[leftChildIdx].priority;
                if (rightPri < comparePri) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            this.heap[index] = this.heap[swapIdx];
            this.heap[swapIdx] = item;
            index = swapIdx;
        }
    }
}

// Global scope export for zero-tooling vanilla compatibility
if (typeof window !== 'undefined') {
    window.PriorityQueue = PriorityQueue;
}
