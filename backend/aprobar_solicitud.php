<?php
require "config.php";

$miembro_id = $_POST["miembro_id"] ?? 0;
$capitulo_id = $_POST["capitulo_id"] ?? 0;

if (!$miembro_id || !$capitulo_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt1 = $pdo->prepare("UPDATE miembros SET verificado = 1, activo = 1 WHERE id = ?");
    $stmt1->execute([$miembro_id]);

    $stmt2 = $pdo->prepare("
        UPDATE capitulos_miembros
        SET estado = 'Activo'
        WHERE capitulo_id = ? AND miembro_id = ?
    ");
    $stmt2->execute([$capitulo_id, $miembro_id]);

    if ($stmt2->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode(["error" => "No se encontró la solicitud."]);
        exit;
    }

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
    echo json_encode(["ok" => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["error" => "No se pudo aprobar la solicitud."]);
}
