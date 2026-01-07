<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;
$sesion_id = $_POST["sesion_id"] ?? 0;
$alumno_id = $_POST["alumno_id"] ?? 0;
$asistio = $_POST["asistio"] ?? 0;

if (!$actividad_id || !$sesion_id || !$alumno_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

/* 1) Verificar inscripción */
$stmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM actividades_inscripciones 
    WHERE actividad_id = ? AND alumno_id = ? AND estado IN ('Inscrito','Finalizado')
");
$stmt->execute([$actividad_id, $alumno_id]);
$inscrito = (int)$stmt->fetchColumn();

if ($inscrito === 0) {
    echo json_encode(["error" => "El alumno no esta inscrito en esta actividad"]);
    exit;
}

/* 2) Verificar que sesión pertenece a actividad */
$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM actividades_sesiones
    WHERE id = ? AND actividad_id = ?
");
$stmt->execute([$sesion_id, $actividad_id]);
$sesion_ok = (int)$stmt->fetchColumn();

if ($sesion_ok === 0) {
    echo json_encode(["error" => "La sesion no pertenece a la actividad"]);
    exit;
}

/* 3) Insertar o actualizar asistencia (upsert) */
try {
    $stmt = $pdo->prepare("
        INSERT INTO actividades_asistencia_sesiones (actividad_id, sesion_id, alumno_id, asistio)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE asistio = VALUES(asistio)
    ");
    $stmt->execute([$actividad_id, $sesion_id, $alumno_id, $asistio]);

    echo json_encode(["success" => true, "msg" => "Asistencia registrada"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error al guardar asistencia"]);
}