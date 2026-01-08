document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const taskCountSpan = document.getElementById('taskCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const filterBtns = document.querySelectorAll('.filters span');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Initialize
    renderTasks();
    updateStats();

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    clearAllBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveAndRender();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active filter UI
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter state
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Functions
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.unshift(newTask);
        taskInput.value = '';
        saveAndRender();
        
        // Focus back on input
        taskInput.focus();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveAndRender();
    }

    function deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id !== id);
                saveAndRender();
            });
        }
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        const textElement = taskElement.querySelector('.task-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-input';
        
        textElement.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
                saveAndRender();
            } else {
                renderTasks(); // Revert if empty
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStats();
    }

    function updateStats() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        taskCountSpan.textContent = activeTasks;
        
        if (tasks.length === 0) {
            emptyState.classList.add('visible');
        } else {
            const filtered = filterTasks();
            if (filtered.length === 0) {
                // If we have tasks but none match filter, still might want to show empty state or specific message
                // For now, let's keep it simple
                 emptyState.classList.remove('visible'); 
            } else {
                emptyState.classList.remove('visible');
            }
            
            // Special case logic for empty state during filtering
             if (tasks.length > 0 && filterTasks().length === 0) {
                emptyState.innerHTML = '<i class="fas fa-search"></i><p>No tasks found in this category.</p>';
                emptyState.classList.add('visible');
            } else if (tasks.length > 0) {
                 emptyState.innerHTML = '<i class="fas fa-clipboard-list"></i><p>No tasks yet. Add one above!</p>';
            }
        }
    }

    function filterTasks() {
        switch (currentFilter) {
            case 'pending': return tasks.filter(t => !t.completed);
            case 'completed': return tasks.filter(t => t.completed);
            default: return tasks;
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filteredTasks = filterTasks();

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="custom-checkbox" onclick="window.handleToggle(${task.id})">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-action btn-edit" onclick="window.handleEdit(${task.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="window.handleDelete(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Expose functions to global scope for onclick handlers
    window.handleToggle = toggleTask;
    window.handleEdit = editTask;
    window.handleDelete = deleteTask;
});
