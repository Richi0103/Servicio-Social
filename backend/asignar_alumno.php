<?php
require "config.php";

$capitulo_id = $_POST["capitulo_id"] ?? 0;
$miembro_id = $_POST["miembro_id"] ?? ($_POST["alumno_id"] ?? 0);

if (!$capitulo_id || !$miembro_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $pdo->beginTransaction();

    $stm = $pdo->prepare("
        INSERT INTO capitulos_miembros (capitulo_id, miembro_id, estado)
        VALUES (?, ?, 'Activo')
    ");
    $stm->execute([$capitulo_id, $miembro_id]);

    // Inscribir al miembro en todas las actividades del capitulo
    $stmIns = $pdo->prepare("
        INSERT IGNORE INTO actividades_inscripciones (actividad_id, miembro_id, estado)
        SELECT a.id, ?, 'Inscrito'
        FROM actividades a
        WHERE a.capitulo_id = ?
          AND a.eliminado_en IS NULL
    ");
    $stmIns->execute([$miembro_id, $capitulo_id]);

    // Crear registros de asistencia por sesion (asistio = 0)
    $stmAsist = $pdo->prepare("
        INSERT IGNORE INTO actividades_asistencia_sesiones (actividad_id, sesion_id, miembro_id, asistio)
        SELECT s.actividad_id, s.id, ?, 0
        FROM actividades_sesiones s
        JOIN actividades a ON a.id = s.actividad_id
        WHERE a.capitulo_id = ?
          AND a.eliminado_en IS NULL
    ");
    $stmAsist->execute([$miembro_id, $capitulo_id]);

    $pdo->commit();
    echo json_encode(["success" => true, "msg" => "Miembro asignado"]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "No se pudo asignar (quizas ya estaba asignado)."]);
}
