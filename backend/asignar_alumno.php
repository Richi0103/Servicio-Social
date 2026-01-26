<?php
require "config.php";

$capitulo_id = $_POST["capitulo_id"] ?? 0;
$alumno_id = $_POST["alumno_id"] ?? 0;

if (!$capitulo_id || !$alumno_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stm = $pdo->prepare("
    INSERT INTO capitulos_alumnos (capitulo_id, alumno_id, estado)
    VALUES (?, ?, 'Activo')
");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $stm->execute([$capitulo_id, $alumno_id]);
    echo json_encode(["success" => true, "msg" => "Alumno asignado"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "No se pudo asignar (quizas ya estaba asignado)."]);
}
