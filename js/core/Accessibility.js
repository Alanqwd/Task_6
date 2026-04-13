export class AccessibilityManager {
    constructor() {
        this.liveRegion = this.#createLiveRegion();
        this.#initKeyboardFocusDetection();
    }

    #createLiveRegion() {
        let region = document.getElementById('a11y-live-region');
        if (!region) {
            region = document.createElement('div');
            region.id = 'a11y-live-region';
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
            region.setAttribute('role', 'status');
            region.className = 'visually-hidden';
            document.body.appendChild(region);
        }
        return region;
    }

    announce(message, priority = 'polite') {
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = ''; 
        setTimeout(() => { this.liveRegion.textContent = message; }, 100);
    }

    // Ловушка фокуса внутри модального окна
    trapFocus(element) {
        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(element.querySelectorAll(focusableSelectors));
        if (focusableElements.length === 0) return () => {};

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
            } else {
                if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
            }
        };

        element.addEventListener('keydown', handleTab);
        return () => element.removeEventListener('keydown', handleTab);
    }

    restoreFocus(triggerElement) {
        if (triggerElement && typeof triggerElement.focus === 'function') {
            setTimeout(() => triggerElement.focus(), 50);
        }
    }


    #initKeyboardFocusDetection() {
        let usingMouse = false;
        document.addEventListener('mousedown', () => { 
            usingMouse = true; 
            document.body.classList.add('mouse-mode'); 
        });
        document.addEventListener('keydown', (e) => {
            if (usingMouse && e.key === 'Tab') {
                usingMouse = false;
                document.body.classList.remove('mouse-mode');
            }
        });
    }
}