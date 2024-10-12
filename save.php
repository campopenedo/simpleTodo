<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    
    $jsonData = json_decode($data, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    
    file_put_contents('texto.txt', json_encode($jsonData, JSON_PRETTY_PRINT));
    
    http_response_code(200);
    echo json_encode(['message' => 'Datos guardados correctamente']);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>