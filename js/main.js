import { StateManager } from './core/StateManager.js';
import { KeyboardManager } from './core/KeyboardManager.js';
import { AccessibilityManager } from './core/Accessibility.js';
import { Modal } from './components/Modal.js';
import { PostList } from './components/PostList.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация ядра
    const state = new StateManager();
    const a11y = new AccessibilityManager();
    const kbManager = new KeyboardManager();

    // 2. Инициализация компонентов
    const postList = new PostList('posts-container', state, a11y);
    
    const modal = new Modal((title, content) => {
        state.addPost(title, content);
    });

    // Подписка UI на изменения данных
    state.subscribe((posts) => {
        postList.render(posts);
        a11y.announce(`Список обновлен. Постов: ${posts.length}`);
    });
    
    // Первичный рендер
    postList.render(state.posts);

    // 3. Настройка горячих клавиш
    kbManager.register('ctrl+n', () => {
        modal.open();
    });

    kbManager.register('escape', () => {
        if (document.querySelector('dialog[open]')) {
            modal.close();
        }
    });

    kbManager.register('ctrl+/', () => {
        const searchInput = document.getElementById('search-input');
        if (document.activeElement !== searchInput) {
            searchInput.focus();
        } else {
            searchInput.blur();
        }
    });

    // 4. Логика поиска
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = state.posts.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.content.toLowerCase().includes(term)
        );
        postList.render(filtered);
        postList.selectedIndex = -1; // Сброс выделения
        if (term) a11y.announce(`Найдено постов: ${filtered.length}`);
    });
});