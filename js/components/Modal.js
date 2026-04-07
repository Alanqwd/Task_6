import { AccessibilityManager } from '../core/Accessibility.js';

export class Modal {
    constructor(onSubmit) {
        this.dialog = document.getElementById('post-modal');
        this.form = document.getElementById('post-form');
        this.titleInput = document.getElementById('post-title');
        this.contentInput = document.getElementById('post-content');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.onSubmit = onSubmit;
        
        this.a11y = new AccessibilityManager();
        this.cleanupFocusTrap = null;
        this.triggerElement = null;

        this.initEvents();
    }

    initEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        });

        this.cancelBtn.addEventListener('click', () => this.close());

        // Обработка Ctrl+Enter в textarea
        this.contentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.submit();
            }
        });

        // Enter в заголовке перекидывает фокус в контент
        this.titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.contentInput.focus();
            }
        });
    }

    open(triggerEl = null) {
        this.triggerElement = triggerEl || document.activeElement;
        this.dialog.showModal();
        this.cleanupFocusTrap = this.a11y.trapFocus(this.dialog);
        this.a11y.announce("Открыта форма создания поста");
        
        // Фокус на первое поле
        setTimeout(() => this.titleInput.focus(), 50); 
    }

    close() {
        this.dialog.close();
        if (this.cleanupFocusTrap) this.cleanupFocusTrap();
        this.a11y.restoreFocus(this.triggerElement);
    }

    submit() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (title && content) {
            this.onSubmit(title, content);
            this.a11y.announce("Пост успешно создан");
            this.close();
        } else {
            this.a11y.announce("Ошибка: заполните все поля", "assertive");
        }
    }
}