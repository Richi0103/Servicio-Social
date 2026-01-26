<?php
require "config.php";

$capitulo_id = $_POST["capitulo_id"] ?? 0;
$profesor_id = $_POST["profesor_id"] ?? 0;

if (!$capitulo_id || !$profesor_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stm = $pdo->prepare("
    INSERT INTO capitulos_profesores (capitulo_id, profesor_id, tipo)
    VALUES (?, ?, 'Encargado')
");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $stm->execute([$capitulo_id, $profesor_id]);
    echo json_encode(["success" => true, "msg" => "Profesor asignado"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "No se pudo asignar (quizas ya estaba asignado)."]);
}
