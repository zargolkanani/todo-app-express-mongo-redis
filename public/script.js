function showShamsiDate() {
    const today = new Date();
    document.getElementById('shamsi-date').textContent = today.toLocaleDateString('fa-IR');
}
showShamsiDate();

let currentBackend = 'mongo';
const backendSelect = document.getElementById('backend-select');
backendSelect.onchange = e => {
    currentBackend = e.target.value;
    loadTodos();
};

const addBtn = document.getElementById('addBtn');
addBtn.onclick = addTodo;

function getApiUrl() {
    return currentBackend === 'mongo' ? 
           'http://localhost:3000/api/mongo/todos' : 
           'http://localhost:3001/api/redis/todos';
}

async function loadTodos() {
    const res = await fetch(getApiUrl(), { headers:{'x-api-key':'123456'} });
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

        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = e => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type='text';
            input.value=t.text;
            input.onblur=async()=>{
                const newText = input.value.trim();
                if(newText!==''){
                    await fetch(`${getApiUrl()}/${t.id}`, {
                        method:'PUT',
                        headers:{'Content-Type':'application/json','x-api-key':'123456'},
                        body: JSON.stringify({text:newText})
                    });
                    loadTodos();
                } else li.replaceChild(textSpan,input);
            };
            li.replaceChild(input,textSpan);
            input.focus();
        };
        li.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent='×';
        delBtn.classList.add('delete-btn');
        delBtn.onclick = e => { e.stopPropagation(); remove(t.id); };
        li.appendChild(delBtn);

        textSpan.onclick = async()=>{ 
            await fetch(`${getApiUrl()}/${t.id}`, { 
                method:'PUT', 
                headers:{'x-api-key':'123456'}, 
                body: JSON.stringify({done: !t.done}) 
            }); 
            loadTodos();
        };

        if(t.done) doneList.appendChild(li);
        else todoList.appendChild(li);
    });
}

async function addTodo(){
    const input=document.getElementById('newTodo');
    const text=input.value.trim();
    if(!text) return;
    await fetch(getApiUrl(),{ 
        method:'POST', 
        headers:{'Content-Type':'application/json','x-api-key':'123456'}, 
        body:JSON.stringify({text}) 
    });
    input.value='';
    loadTodos();
}

async function remove(id){
    await fetch(`${getApiUrl()}/${id}`,{ method:'DELETE', headers:{'x-api-key':'123456'} });
    loadTodos();
}

loadTodos();
