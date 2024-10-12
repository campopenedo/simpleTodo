const newCardBtn = document.getElementById('newCardBtn');
const modal = document.getElementById('newCardModal');
const closeBtn = document.getElementsByClassName('close')[0];
const saveTaskBtn = document.getElementById('saveTaskBtn');
const backlogColumn = document.getElementById('backlog');
const columns = document.querySelectorAll('.column');

function getTareas() {
    const tareas = localStorage.getItem('tareas');
    return tareas ? JSON.parse(tareas) : JSON.parse({ tareas: {tareas : {}} });
}

function setTareas(tareas) {
    localStorage.setItem('tareas', JSON.stringify(tareas));
    sendDataToText(tareas);
}

function addTarea(title, description, time) {
    const tareas = getTareas();
    if (!tareas.tareas) {
        tareas.tareas = {};
    }
    if(tareas.tareas[title] != null) return false;
    tareas.tareas[title] = { descripcion: description, tiempoEstimado: time, status: 'backlog' };
    setTareas(tareas);
    return true;
}

function sendDataToText(tareas) {
    fetch('save.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tareas)
    })
    .then(response => {
        if (!response.ok) {
            alert('Error al guardar la info.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function loadTasksFromFile() {
    const timestamp = new Date().getTime();
    fetch(`/texto.txt?ts=${timestamp}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar el archivo');
            return response.text();
        })
        .then(data => {
            const tareas = JSON.parse(data);
            if(tareas.tareas.length == 0) tareas.tareas = {}
            console.log(tareas);
            localStorage.setItem('tareas', JSON.stringify(tareas));
            loadExistingTasks(tareas);
        })
        .catch(error => console.error('Error:', error));
}

function loadExistingTasks(tareas) {
    for (const [title, data] of Object.entries(tareas.tareas)) {
        const card = createCard(title, data.descripcion, data.tiempoEstimado, data.status);
        const column = document.getElementById(data.status);
        if (column) {
            column.appendChild(card);
        } else {
            backlogColumn.appendChild(card);
        }
    }
}

newCardBtn.onclick = function() {
    modal.style.display = "block";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

saveTaskBtn.onclick = function() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const time = document.getElementById('taskTime').value;

    if (title && description && time) {
        var isTareaAdded = addTarea(title, description, time);
        if(!isTareaAdded) {
            alert('Título existente. Por favor ponga un título diferente.');
        } else {
            const card = createCard(title, description, time, 'backlog');
            backlogColumn.appendChild(card);
            modal.style.display = "none";
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskTime').value = '';
        }
    } else {
        alert('Por favor, completa todos los campos.');
    }
}

function createCard(title, description, time, status) {
    const card = document.createElement('div');
    card.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <p>Tiempo estimado: ${time}</p>
        <p>Status: ${status}</p>
        <div class="card-buttons">
            <button class="move-back">◀ Atrás</button>
            <button class="move-forward">Adelante ▶</button>
            <button class="delete-btn">Eliminar</button>
        </div>
    `;
    const moveBackBtn = card.querySelector('.move-back');
    const moveForwardBtn = card.querySelector('.move-forward');
    const deleteBtn = card.querySelector('.delete-btn');

    moveBackBtn.addEventListener('click', () => moveCard(card, -1));
    moveForwardBtn.addEventListener('click', () => moveCard(card, 1));
    deleteBtn.addEventListener('click', () => deleteCard(card));

    return card;
}
function moveCard(card, direction) {
    const currentColumn = card.parentElement;
    const columnIndex = Array.from(columns).indexOf(currentColumn);
    const newColumnIndex = columnIndex + direction;

    if (newColumnIndex >= 0 && newColumnIndex < columns.length) {
        columns[newColumnIndex].appendChild(card);
        const title = card.querySelector('h3').textContent;
        const newStatus = columns[newColumnIndex].id;
        updateTareaStatus(title, newStatus);
        card.querySelector('p:nth-child(4)').textContent = `Status: ${newStatus}`;
    }
}

function deleteCard(card) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        const title = card.querySelector('h3').textContent;
        card.remove();
        removeTarea(title);
    }
}

function updateTareaStatus(title, newStatus) {
    const tareas = getTareas();
    if (tareas.tareas[title]) {
        tareas.tareas[title].status = newStatus;
        setTareas(tareas);
        sendDataToText(tareas);
    }
}

function removeTarea(title) {
    const tareas = getTareas();
    delete tareas.tareas[title];
    setTareas(tareas);
    sendDataToText(tareas);
}

document.addEventListener('DOMContentLoaded', loadTasksFromFile);