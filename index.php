<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tareas</title>
    <link rel="stylesheet" href="styles.css"> <!-- Asumiendo que tienes estilos -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <button id="newCardBtn">Nueva Tarea</button>
    <div class="board">
        <div class="column" id="backlog">
            <h2>Backlog</h2>
        </div>
        <div class="column" id="doing">
            <h2>Doing</h2>
        </div>
        <div class="column" id="testing">
            <h2>Testing</h2>
        </div>
        <div class="column" id="done">
            <h2>Done</h2>
        </div>
    </div>

    <div id="newCardModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Nueva Tarea</h2>
            <input type="text" id="taskTitle" placeholder="Título">
            <textarea id="taskDescription" placeholder="Descripción"></textarea>
            <input type="text" id="taskTime" placeholder="Tiempo estimado (HH:MM)">
            <button id="saveTaskBtn">Guardar</button>
        </div>
    </div>
    <pre id="fileContent"></pre>
    <script src="script.js" defer></script>
</body>
</html>