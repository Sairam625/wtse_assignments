const API_URL = '/api';
let authToken = localStorage.getItem('authToken');
let editingPostId = null;

// DOM Elements
const authBtn = document.getElementById('authBtn');
const adminPanel = document.getElementById('adminPanel');
const postForm = document.getElementById('postForm');
const postsGrid = document.getElementById('postsGrid');
const postTitleInput = document.getElementById('postTitle');
const postContentInput = document.getElementById('postContent');
const submitBtn = postForm.querySelector('.btn-submit');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const notification = document.getElementById('notification');

// Initialize
checkAuth();
fetchPosts();

// Auth Logic
authBtn.addEventListener('click', async () => {
    if (authToken) {
        // Logout
        authToken = null;
        localStorage.removeItem('authToken');
        checkAuth();
        showNotification('Logged out successfully');
    } else {
        // Login (Mock)
        try {
            const response = await fetch(`${API_URL}/login`, { method: 'POST' });
            const data = await response.json();
            if (data.token) {
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                checkAuth();
                showNotification('Logged in successfully');
            }
        } catch (error) {
            console.error('Login failed', error);
        }
    }
});

function checkAuth() {
    if (authToken) {
        authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        adminPanel.classList.remove('hidden');
        document.body.classList.add('authenticated');
    } else {
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        adminPanel.classList.add('hidden');
        document.body.classList.remove('authenticated');
        cancelEdit(); // Reset form if editing
    }
    // Re-render posts to show/hide actions
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(card => renderPostActions(card));
}

// Fetch Posts
async function fetchPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        postsGrid.innerHTML = '<div class="loading-state">Error loading posts</div>';
    }
}

function renderPosts(posts) {
    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="loading-state">No posts found.</div>';
        return;
    }

    postsGrid.innerHTML = posts.map(post => `
        <article class="post-card" data-id="${post.id}">
            <div class="post-meta">
                <i class="far fa-user-circle"></i> ${post.author} • 
                <i class="far fa-clock"></i> ${new Date(post.date).toLocaleDateString()}
            </div>
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-actions ${authToken ? '' : 'hidden'}">
                <button class="btn-secondary" onclick="startEdit(${post.id})">
                    <i class="fas fa-pen"></i> Edit
                </button>
                <button class="btn-secondary btn-delete" onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </article>
    `).join('');
}

function renderPostActions(card) {
    const actions = card.querySelector('.post-actions');
    if (authToken) {
        actions.classList.remove('hidden');
    } else {
        actions.classList.add('hidden');
    }
}

// Create / Update Post
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();

    if (!title || !content) return;

    const payload = { title, content };
    const method = editingPostId ? 'PUT' : 'POST';
    const url = editingPostId ? `${API_URL}/posts/${editingPostId}` : `${API_URL}/posts`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            postForm.reset();
            if (editingPostId) cancelEdit();
            fetchPosts();
            showNotification(editingPostId ? 'Post updated' : 'Post published');
        } else {
            const err = await response.json();
            alert(err.error);
        }
    } catch (error) {
        console.error('Error saving post', error);
    }
});

// Edit & Delete Handlers
window.startEdit = async (id) => {
    try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        const post = await response.json();

        postTitleInput.value = post.title;
        postContentInput.value = post.content;
        editingPostId = id;

        submitBtn.textContent = 'Update Post';
        cancelEditBtn.classList.remove('hidden');

        // Scroll to form
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching post for edit', error);
    }
};

window.deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            fetchPosts();
            showNotification('Post deleted');
        }
    } catch (error) {
        console.error('Error deleting post', error);
    }
};

cancelEditBtn.addEventListener('click', cancelEdit);

function cancelEdit() {
    editingPostId = null;
    postForm.reset();
    submitBtn.textContent = 'Publish Post';
    cancelEditBtn.classList.add('hidden');
}

// Utility
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
