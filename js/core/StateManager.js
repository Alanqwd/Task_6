export class StateManager {
    constructor() {
        this.posts = this.loadFromStorage();
        this.listeners = [];
    }

    loadFromStorage() {
        const data = localStorage.getItem('blog_posts');
        return data ? JSON.parse(data) : [
            { id: 1, title: 'Привет, мир!', content: 'Это первый пост. Попробуйте управлять им с клавиатуры.', likes: 0 },
            { id: 2, title: 'Горячие клавиши', content: 'Нажмите Ctrl+N чтобы создать новый пост.', likes: 5 }
        ];
    }

    saveToStorage() {
        localStorage.setItem('blog_posts', JSON.stringify(this.posts));
    }

    addPost(title, content) {
        const newPost = {
            id: Date.now(),
            title,
            content,
            likes: 0
        };
        this.posts.unshift(newPost);
        this.saveToStorage();
        this.notify();
        return newPost;
    }

    likePost(id) {
        const post = this.posts.find(p => p.id === id);
        if (post) {
            post.likes++;
            this.saveToStorage();
            this.notify();
        }
    }

    deletePost(id) {
        this.posts = this.posts.filter(p => p.id !== id);
        this.saveToStorage();
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.posts));
    }
}