/**
 * Animation & Playback Controls Component
 * Utilizes requestAnimationFrame with discrete speed multipliers (0.25x, 0.5x, 1x, 2x, 4x).
 */
class Controls {
    constructor({ onStep, onStateChange }) {
        this.onStep = onStep;
        this.onStateChange = onStateChange;

        this.isPlaying = false;
        this.multiplier = 1.0; // 0.25, 0.5, 1, 2, 4
        this.currentIndex = 0;
        this.totalSteps = 0;
        
        this.rafId = null;
        this.lastFrameTime = 0;

        this._dom = {
            playBtn: document.getElementById('canvasPlayBtn'),
            stepFwdBtn: document.getElementById('canvasStepFwdBtn'),
            stepBackBtn: document.getElementById('canvasStepBackBtn'),
            restartBtn: document.getElementById('canvasRestartBtn'),
            stepBadge: document.getElementById('canvasStepBadge')
        };

        this._bindEvents();
    }

    _bindEvents() {
        if (this._dom.playBtn) {
            this._dom.playBtn.addEventListener('click', () => this.togglePlay());
        }
        if (this._dom.stepFwdBtn) {
            this._dom.stepFwdBtn.addEventListener('click', () => this.stepForward());
        }
        if (this._dom.stepBackBtn) {
            this._dom.stepBackBtn.addEventListener('click', () => this.stepBack());
        }
        if (this._dom.restartBtn) {
            this._dom.restartBtn.addEventListener('click', () => this.restart());
        }
    }

    setMultiplier(mult) {
        this.multiplier = parseFloat(mult);
    }

    load(totalSteps) {
        this.pause();
        this.totalSteps = totalSteps;
        this.currentIndex = 0;
        this._updateStepBadge();
    }

    play() {
        if (this.totalSteps <= 0) return;
        if (this.currentIndex >= this.totalSteps - 1) {
            this.currentIndex = 0;
        }

        this.isPlaying = true;
        this._updatePlayButtonUI(true);
        this.lastFrameTime = performance.now();
        this._loop(performance.now());
        if (this.onStateChange) this.onStateChange(true);
    }

    pause() {
        this.isPlaying = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this._updatePlayButtonUI(false);
        if (this.onStateChange) this.onStateChange(false);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    stepForward() {
        this.pause();
        if (this.currentIndex < this.totalSteps - 1) {
            this.currentIndex++;
            this._updateStepBadge();
            if (this.onStep) this.onStep(this.currentIndex);
        }
    }

    stepBack() {
        this.pause();
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this._updateStepBadge();
            if (this.onStep) this.onStep(this.currentIndex);
        }
    }

    restart() {
        this.pause();
        this.currentIndex = 0;
        this._updateStepBadge();
        if (this.onStep) this.onStep(0);
    }

    _loop(timestamp) {
        if (!this.isPlaying) return;

        // Multipliers: 0.25x = 280ms, 0.5x = 140ms, 1x = 65ms, 2x = 28ms, 4x = 8ms
        let baseDelay = 65;
        if (this.multiplier === 0.25) baseDelay = 320;
        else if (this.multiplier === 0.5) baseDelay = 160;
        else if (this.multiplier === 1) baseDelay = 70;
        else if (this.multiplier === 2) baseDelay = 25;
        else if (this.multiplier === 4) baseDelay = 8;

        const elapsed = timestamp - this.lastFrameTime;

        if (elapsed >= baseDelay) {
            this.lastFrameTime = timestamp;

            if (this.currentIndex < this.totalSteps - 1) {
                this.currentIndex++;
                this._updateStepBadge();
                if (this.onStep) this.onStep(this.currentIndex);
            } else {
                this.pause();
                return;
            }
        }

        this.rafId = requestAnimationFrame((ts) => this._loop(ts));
    }

    _updateStepBadge() {
        if (this._dom.stepBadge) {
            this._dom.stepBadge.textContent = `Step ${this.currentIndex + 1} / ${Math.max(1, this.totalSteps)}`;
        }
    }

    _updatePlayButtonUI(isPlaying) {
        if (!this._dom.playBtn) return;
        if (isPlaying) {
            this._dom.playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>`;
            this._dom.playBtn.setAttribute('data-tooltip', 'Pause (Space)');
        } else {
            this._dom.playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>`;
            this._dom.playBtn.setAttribute('data-tooltip', 'Play (Space)');
        }
    }
}

if (typeof window !== 'undefined') {
    window.Controls = Controls;
}
