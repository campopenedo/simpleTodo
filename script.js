const newCardBtn = document.getElementById('newCardBtn');
const modal = document.getElementById('newCardModal');
const closeBtn = document.getElementsByClassName('close')[0];
const saveTaskBtn = document.getElementById('saveTaskBtn');
const backlogColumn = document.getElementById('backlog');
const columns = document.querySelectorAll('.column');
const editTaskBtn = document.getElementById('editTaskBtn');

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
    document.getElementById("modalTitle").innerText = "Nueva Tarea";
    document.getElementById("editTaskBtn").style.display = "none";
    document.getElementById("saveTaskBtn").style.display = "block";
    document.getElementById("removeTaskBtn").style.display = "none";
    document.getElementById('taskTitle').readOnly = false;
    modal.style.display = "block";
}

editTaskBtn.onclick = function() {
    let tareas = getTareas(),
    tarea = tareas.tareas[editTaskBtn.getAttribute('data-title')];

    tarea.descripcion = document.getElementById('taskDescription').value;
    tarea.tiempoEstimado = document.getElementById('taskTime').value;

    setTareas(tareas);
    sendDataToText(tareas);

    let card = document.querySelector('.card.' + editTaskBtn.getAttribute('data-title'));

    document.querySelector('.card.' + editTaskBtn.getAttribute('data-title') + ' #card-description').textContent = tarea.descripcion;
    document.querySelector('.card.' + editTaskBtn.getAttribute('data-title') + ' #card-time').textContent = "Tiempo estimado: " + tarea.tiempoEstimado;

    modal.style.display = "none";
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskTime').value = '';


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
    card.classList.add('card');
    let regexStartLetter = /^[A-Za-z]/;
    let classTitle = regexStartLetter.test(title) ? title : "a" + title.toString();
    card.classList.add(classTitle);
    card.innerHTML = `
        <h3 class="card-title">${title}</h3>
        <p id="card-description">${description}</p>
        <p id="card-time">Tiempo estimado: ${time}</p>
        <p>Status: ${status}</p>
        <div class="card-buttons">
            <button class="move-back">◀ Atrás</button>
            <button class="move-forward">Adelante ▶</button>
            <button class="edit-btn">Editar</button>
        </div>
    `;
    const moveBackBtn = card.querySelector('.move-back');
    const moveForwardBtn = card.querySelector('.move-forward');
    const editBtn = card.querySelector('.edit-btn');

    moveBackBtn.addEventListener('click', () => moveCard(card, -1));
    moveForwardBtn.addEventListener('click', () => moveCard(card, 1));
    editBtn.addEventListener('click', () => editCard(card, classTitle));

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

function editCard(card, title) {
    let tareas = getTareas(),
    tareaTitle = card.getElementsByClassName('card-title')[0].textContent,
    tareaData = tareas.tareas[tareaTitle],
    taskTitle = document.getElementById('taskTitle');

    document.getElementById("modalTitle").textContent = "Editar Tarea";
    document.getElementById("editTaskBtn").style.display = "block";
    document.getElementById("saveTaskBtn").style.display = "none";

    editTaskBtn.setAttribute('data-title', tareaTitle);


    taskTitle.readOnly = true;
    taskTitle.value = tareaTitle + ' [no modificable]';
    document.getElementById('taskDescription').value = tareaData['descripcion'];
    document.getElementById('taskTime').value = tareaData['tiempoEstimado'];

    document.getElementById('removeTaskBtn').onclick = function() {
        deleteCard(card);
        modal.style.display = "none";
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskTime').value = '';
    };

    document.getElementById("removeTaskBtn").style.display = "block";


    modal.style.display = "block";

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

function updateTareaInfo(title) {
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