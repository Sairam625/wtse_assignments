const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let posts = [
    {
        id: 1,
        title: "Welcome to the Future of Blogging",
        content: "This is a sample post demonstrating our premium REST API capabilities. Experience the speed and fluidity of modern web architecture.",
        author: "System",
        date: new Date().toISOString()
    },
    {
        id: 2,
        title: "RESTful Principles Explained",
        content: "Representational State Transfer (REST) is an architectural style that defines a set of constraints to be used for creating web services.",
        author: "DevTeam",
        date: new Date(Date.now() - 86400000).toISOString()
    }
];

// Auth Middleware
const API_TOKEN = "premium-token-123";

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${API_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
    }
    next();
};

// Validation Middleware
const validatePost = (req, res, next) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Validation Error: Title and content are required' });
    }
    next();
};

// Routes

// Login Route (Mock)
app.post('/api/login', (req, res) => {
    // In a real app, validate credentials here
    res.json({ token: API_TOKEN, message: 'Login successful' });
});

// GET all posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// GET single post
app.get('/api/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});

// POST new post (Protected)
app.post('/api/posts', authenticate, validatePost, (req, res) => {
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        author: req.body.author || 'Anonymous',
        date: new Date().toISOString()
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
});

// PUT update post (Protected)
app.put('/api/posts/:id', authenticate, validatePost, (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) return res.status(404).json({ error: 'Post not found' });

    posts[index] = {
        ...posts[index],
        title: req.body.title,
        content: req.body.content,
        author: req.body.author || posts[index].author // Keep existing author if not provided
    };

    res.json(posts[index]);
});

// DELETE post (Protected)
app.delete('/api/posts/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) return res.status(404).json({ error: 'Post not found' });

    const deletedPost = posts.splice(index, 1);
    res.json({ message: 'Post deleted successfully', post: deletedPost[0] });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
