function showShamsiDate() {
    const today = new Date();
    document.getElementById('shamsi-date').textContent = today.toLocaleDateString('fa-IR');
}
showShamsiDate();

const addBtn = document.getElementById('addBtn');
addBtn.onclick = addTodo;

async function loadTodos() {
    const res = await fetch('/api/todos', { headers:{'x-api-key':'123456'} });
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
                    await fetch(`/api/todos/${t.id}`, {
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
            await fetch(`/api/todos/${t.id}`, { method:'PUT', headers:{'x-api-key':'123456'} }); 
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
    await fetch('/api/todos',{ method:'POST', headers:{'Content-Type':'application/json','x-api-key':'123456'}, body:JSON.stringify({text}) });
    input.value='';
    loadTodos();
}

async function remove(id){
    await fetch(`/api/todos/${id}`,{ method:'DELETE', headers:{'x-api-key':'123456'} });
    loadTodos();
}

loadTodos();