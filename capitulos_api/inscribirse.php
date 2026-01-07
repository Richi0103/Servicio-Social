<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;
$alumno_id = $_POST["alumno_id"] ?? 0;

if (!$actividad_id || !$alumno_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO actividades_inscripciones (actividad_id, alumno_id, estado)
        VALUES (?, ?, 'Inscrito')
    ");
    $stmt->execute([$actividad_id, $alumno_id]);

    echo json_encode(["success" => true, "msg" => "Alumno inscrito"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "No se pudo inscribir (ya estaba inscrito o revisar error)."]);
}