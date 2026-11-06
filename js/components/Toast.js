/**
 * Toast Notification Component
 */
class Toast {
    static host = null;

    static init() {
        if (!this.host) {
            this.host = document.getElementById('toastHost');
            if (!this.host) {
                this.host = document.createElement('div');
                this.host.id = 'toastHost';
                this.host.className = 'toast-host';
                document.body.appendChild(this.host);
            }
        }
    }

    /**
     * Show floating toast notification
     * @param {string} message 
     * @param {'info'|'success'|'warn'} type 
     */
    static show(message, type = 'info') {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'warn' ? '⚠' : 'ℹ';
        toast.innerHTML = `<span style="font-weight: bold;">${icon}</span><span>${message}</span>`;
        
        this.host.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }
}

if (typeof window !== 'undefined') {
    window.Toast = Toast;
}
