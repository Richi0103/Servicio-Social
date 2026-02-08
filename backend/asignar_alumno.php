<?php
require "config.php";

$capitulo_id = $_POST["capitulo_id"] ?? 0;
$alumno_id = $_POST["alumno_id"] ?? 0;

if (!$capitulo_id || !$alumno_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $pdo->beginTransaction();

    $stm = $pdo->prepare("
        INSERT INTO capitulos_alumnos (capitulo_id, alumno_id, estado)
        VALUES (?, ?, 'Activo')
    ");
    $stm->execute([$capitulo_id, $alumno_id]);

    // Inscribir al alumno en todas las actividades del capítulo
    $stmIns = $pdo->prepare("
        INSERT IGNORE INTO actividades_inscripciones (actividad_id, alumno_id, estado)
        SELECT a.id, ?, 'Inscrito'
        FROM actividades a
        WHERE a.capitulo_id = ?
          AND a.eliminado_en IS NULL
    ");
    $stmIns->execute([$alumno_id, $capitulo_id]);

    // Crear registros de asistencia por sesión (asistio = 0)
    $stmAsist = $pdo->prepare("
        INSERT IGNORE INTO actividades_asistencia_sesiones (actividad_id, sesion_id, alumno_id, asistio)
        SELECT s.actividad_id, s.id, ?, 0
        FROM actividades_sesiones s
        JOIN actividades a ON a.id = s.actividad_id
        WHERE a.capitulo_id = ?
          AND a.eliminado_en IS NULL
    ");
    $stmAsist->execute([$alumno_id, $capitulo_id]);

    $pdo->commit();
    echo json_encode(["success" => true, "msg" => "Alumno asignado"]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "No se pudo asignar (quizas ya estaba asignado)."]);
}
