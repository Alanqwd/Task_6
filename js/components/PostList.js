export class PostList {
    constructor(containerId, stateManager, a11yManager) {
        this.container = document.getElementById(containerId);
        this.state = stateManager;
        this.a11y = a11yManager;
        this.selectedIndex = -1; 
        
        // Делегирование кликов
        this.container.addEventListener('click', (e) => this.handleClick(e));
        
        // Глобальная обработка клавиш для навигации по списку
        // (вызывается из main.js или здесь, если проверять условия)
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    render(posts) {
        this.container.innerHTML = '';
        if (posts.length === 0) {
            this.container.innerHTML = '<p>Постов не найдено.</p>';
            this.selectedIndex = -1;
            return;
        }

        posts.forEach((post, index) => {
            const article = document.createElement('article');
            article.className = 'post';
            article.dataset.id = post.id;
            article.dataset.index = index;
            article.setAttribute('tabindex', '0'); 
            article.setAttribute('aria-label', `Пост: ${post.title}. Лайков: ${post.likes}`);
            
            article.innerHTML = `
                <div class="post-header">
                    <h3>${escapeHtml(post.title)}</h3>
                    <span class="likes-count" aria-hidden="true">❤️ ${post.likes}</span>
                </div>
                <p>${escapeHtml(post.content)}</p>
                <div class="post-actions">
                    <button class="btn-like" data-id="${post.id}" tabindex="-1">Лайк</button>
                    <button class="btn-delete" data-id="${post.id}" tabindex="-1">Удалить</button>
                </div>
            `;
            this.container.appendChild(article);
        });

        // Сброс выделения при перерисовке, если индекс вышел за границы
        if (this.selectedIndex >= posts.length) {
            this.selectedIndex = posts.length > 0 ? 0 : -1;
        }
        this.updateSelectionVisuals();
    }

    handleClick(e) {
        const target = e.target;
        const postElement = target.closest('.post');
        
        if (!postElement) return;

        const id = Number(postElement.dataset.id);
        const index = Number(postElement.dataset.index);

        // Клик выбирает пост
        this.selectPost(index);

        // Действия по кнопкам
        if (target.classList.contains('btn-like')) {
            this.state.likePost(id);
            this.a11y.announce("Лайк поставлен");
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('Удалить этот пост?')) {
                this.state.deletePost(id);
                this.a11y.announce("Пост удален");
            }
        }
    }

    handleKeydown(e) {
        // Игнорируем, если открыта модалка или фокус в поиске/форме
        if (document.querySelector('dialog[open]') || 
            ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return;
        }

        const posts = document.querySelectorAll('.post');
        if (posts.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectPost(Math.min(this.selectedIndex + 1, posts.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectPost(Math.max(this.selectedIndex - 1, 0));
                break;
            case ' ':
            case 'Enter':
                if (this.selectedIndex !== -1) {
                    e.preventDefault();
                    const id = Number(posts[this.selectedIndex].dataset.id);
                    this.state.likePost(id);
                    this.a11y.announce("Лайк поставлен");
                }
                break;
            case 'Delete':
                if (this.selectedIndex !== -1) {
                    e.preventDefault();
                    const id = Number(posts[this.selectedIndex].dataset.id);
                    if (confirm('Удалить выбранный пост?')) {
                        this.state.deletePost(id);
                        this.a11y.announce("Пост удален");
                        // Коррекция индекса
                        if (this.selectedIndex >= posts.length - 1) {
                            this.selectedIndex = Math.max(0, posts.length - 2);
                        }
                    }
                }
                break;
        }
    }

    selectPost(index) {
        this.selectedIndex = index;
        this.updateSelectionVisuals();
        
        const posts = document.querySelectorAll('.post');
        if (posts[index]) {
            posts[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            posts[index].focus();
        }
    }

    updateSelectionVisuals() {
        const posts = document.querySelectorAll('.post');
        posts.forEach((p, i) => {
            if (i === this.selectedIndex) {
                p.classList.add('selected');
                p.setAttribute('aria-current', 'true');
            } else {
                p.classList.remove('selected');
                p.removeAttribute('aria-current');
            }
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}