// ==============================
// script.js - اصلاح شده
// ==============================

const BASE_URL = '/api/todos';  // مسیر API
const API_KEY = '123456';       // کلید API

// نمایش تاریخ شمسی
function showShamsiDate() {
    const today = new Date();
    document.getElementById('shamsi-date').textContent = today.toLocaleDateString('fa-IR');
}
showShamsiDate();

// دکمه Add
const addBtn = document.getElementById('addBtn');
addBtn.onclick = addTodo;

// بارگذاری همه تودوها
async function loadTodos() {
    try {
        const res = await fetch(BASE_URL, { headers:{ 'x-api-key': API_KEY } });
        const todos = await res.json();

        const todoList = document.getElementById('todo-list');
        const doneList = document.getElementById('done-list');
        todoList.innerHTML = '';
        doneList.innerHTML = '';

        todos.data.forEach(t => {
            const li = document.createElement('li');

            const textSpan = document.createElement('span');
            textSpan.textContent = t.text;
            if(t.done) textSpan.classList.add('done-text');
            li.appendChild(textSpan);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = '✎';
            editBtn.classList.add('edit-btn');
            editBtn.onclick = e => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type='text';
                input.value = t.text;
                input.onblur = async () => {
                    const newText = input.value.trim();
                    if(newText !== ''){
                        await fetch(`${BASE_URL}/${t.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type':'application/json', 'x-api-key': API_KEY },
                            body: JSON.stringify({ text: newText, done: t.done })
                        });
                        loadTodos();
                    } else li.replaceChild(textSpan, input);
                };
                li.replaceChild(input, textSpan);
                input.focus();
            };
            li.appendChild(editBtn);

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = '×';
            delBtn.classList.add('delete-btn');
            delBtn.onclick = e => { e.stopPropagation(); remove(t.id); };
            li.appendChild(delBtn);

            // Click on text to toggle done
            textSpan.onclick = async () => {
                await fetch(`${BASE_URL}/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type':'application/json', 'x-api-key': API_KEY },
                    body: JSON.stringify({ text: t.text, done: !t.done })
                });
                loadTodos();
            };

            if(t.done) doneList.appendChild(li);
            else todoList.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading todos:', err);
    }
}

// Add Todo
async function addTodo() {
    const input = document.getElementById('newTodo');
    const text = input.value.trim();
    if(!text) return;

    try {
        const res = await fetch(BASE_URL, {
            method:'POST',
            headers: { 'Content-Type':'application/json', 'x-api-key': API_KEY },
            body: JSON.stringify({ text })
        });

        if(!res.ok){
            const error = await res.json();
            console.error('Add Todo Error:', error);
            return;
        }

        input.value = '';
        loadTodos();
    } catch (err) {
        console.error('Add Todo Error:', err);
    }
}

// Delete Todo
async function remove(id){
    try {
        const res = await fetch(`${BASE_URL}/${id}`, { method:'DELETE', headers:{ 'x-api-key': API_KEY } });
        if(!res.ok){
            const error = await res.json();
            console.error('Delete Todo Error:', error);
            return;
        }
        loadTodos();
    } catch(err) {
        console.error('Delete Todo Error:', err);
    }
}

// Load todos on page load
loadTodos();
