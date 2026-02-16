<?php
require "config.php";

$capitulo_id = $_POST["capitulo_id"] ?? 0;
$asesor_id = $_POST["asesor_id"] ?? ($_POST["profesor_id"] ?? 0);

if (!$capitulo_id || !$asesor_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stm = $pdo->prepare("
    INSERT INTO capitulos_asesores (capitulo_id, asesor_id, tipo)
    VALUES (?, ?, 'Encargado')
");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $stm->execute([$capitulo_id, $asesor_id]);
    echo json_encode(["success" => true, "msg" => "Encargado asignado"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "No se pudo asignar (quizas ya estaba asignado)."]);
}
