function App() {
    // ===== DOM Elements =====
    const btnSubmit = document.getElementById('add-todo-btn');
    const todoInput = document.getElementById('todo-input');
    const todoListContainer = document.getElementById('todo-list');
    const paginationContainer = document.getElementById('pagination');
    const darkModeToggle = document.getElementById('dark-mode-toggle'); // thêm

    // ===== Config =====
    const STORAGE_KEY = 'todoList';
    const DARKMODE_KEY = 'darkModeEnabled'; // key lưu dark mode
    let currentPage = 1;
    const itemsPerPage = 8;

    // ===== App State =====
    let isEditing = false;
    let editId = null;
    let todoLists = loadTodos();

    // ===== Storage Functions =====
    function loadTodos() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todoLists));
    }

    // ===== CRUD Functions =====
    function addTodo(todoText) {
        todoLists.push(todoText);
        saveTodos();
    }

    function updateTodo(id, newText) {
        todoLists[id] = newText;
        saveTodos();
    }

    function deleteTodo(id) {
        todoLists.splice(id, 1);
        saveTodos();
    }

    function getTodoById(id) {
        return todoLists[id];
    }

    function resetForm() {
        todoInput.value = '';
        todoInput.focus();
        isEditing = false;
        editId = null;
        btnSubmit.innerText = 'Add';
        btnSubmit.classList.remove('btn-warning');
        btnSubmit.classList.add('btn-primary');
    }

    // ===== Rendering =====
    function renderTodoList() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const visibleTodos = todoLists.slice(start, end);

        let html = '';
        visibleTodos.forEach((todo, index) => {
            const globalIndex = start + index;
            html += `
                <li class="todo-list-item list-group-item d-flex justify-content-between align-items-center" data-id="${globalIndex}">
                    ${todo}
                    <div>
                        <button class="btn btn-sm btn-primary edit-btn me-2"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-danger delete-btn"><i class="bi bi-trash"></i></button>
                    </div>
                </li>
            `;
        });

        todoListContainer.innerHTML = html;
    }

    function renderPagination() {
        const totalPages = Math.ceil(todoLists.length / itemsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        paginationContainer.innerHTML = html;
    }

    // ===== Dark Mode Logic =====
    function applyDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem(DARKMODE_KEY, isDark);
    }

    // Khởi tạo dark mode từ localStorage
    const darkModeStored = localStorage.getItem(DARKMODE_KEY) === 'true';
    applyDarkMode(darkModeStored);

    darkModeToggle.addEventListener('change', () => {
        applyDarkMode(darkModeToggle.checked);
    });

    // ===== Events =====
    btnSubmit.addEventListener('click', () => {
        const todoText = todoInput.value.trim();

        if (todoText === '') {
            Swal.fire({ icon: 'error', title: 'Invalid Input', text: 'Please enter your todo!' });
            return;
        }

        if (isEditing) {
            updateTodo(editId, todoText);
            Swal.fire({ title: 'Updated Successfully!', icon: 'success' });
        } else {
            addTodo(todoText);
            Swal.fire({ title: 'Added Successfully!', icon: 'success' });
        }

        resetForm();
        renderTodoList();
        renderPagination();
    });

    todoListContainer.addEventListener('click', (event) => {
        const li = event.target.closest('.todo-list-item');
        if (!li) return;

        const id = parseInt(li.getAttribute('data-id'), 10);
        const deleteBtn = event.target.closest('.delete-btn');
        const editBtn = event.target.closest('.edit-btn');

        if (deleteBtn) {
            Swal.fire({
                title: 'Are you sure?',
                text: 'This task will be deleted!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteTodo(id);

                    const totalPages = Math.ceil(todoLists.length / itemsPerPage);
                    if (currentPage > totalPages) currentPage = totalPages;

                    Swal.fire('Deleted!', '', 'success');
                    renderTodoList();
                    renderPagination();
                }
            });
        }

        if (editBtn) {
            todoInput.value = getTodoById(id);
            isEditing = true;
            editId = id;
            btnSubmit.innerText = 'Update';
            btnSubmit.classList.remove('btn-primary');
            btnSubmit.classList.add('btn-warning');
        }
    });

    paginationContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            const page = parseInt(event.target.getAttribute('data-page'), 10);
            if (!isNaN(page)) {
                currentPage = page;
                renderTodoList();
                renderPagination();
            }
        }
    });

    // ===== Initial Render =====
    renderTodoList();
    renderPagination();
}

document.addEventListener('DOMContentLoaded', App);
