<?php
require "config.php";

$actividad_id = $_POST["actividad_id"] ?? 0;
$miembro_id = $_POST["miembro_id"] ?? ($_POST["alumno_id"] ?? 0);
$otorgado_por = $_POST["otorgado_por"] ?? null;

if (!$actividad_id || !$miembro_id) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

/* 1) Datos de la actividad */
$stmt = $pdo->prepare("SELECT otorga_creditos, creditos FROM actividades WHERE id = ? AND eliminado_en IS NULL");
$stmt->execute([$actividad_id]);
$act = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$act) {
    echo json_encode(["error" => "Actividad no existe"]);
    exit;
}

if ((int)$act["otorga_creditos"] === 0) {
    echo json_encode(["error" => "Esta actividad no otorga creditos"]);
    exit;
}

/* 2) Calcular asistencia */
$stmt = $pdo->prepare("
    SELECT 
      COUNT(s.id) AS total_sesiones,
      SUM(CASE WHEN aas.asistio = 1 THEN 1 ELSE 0 END) AS asistidas
    FROM actividades_sesiones s
    LEFT JOIN actividades_asistencia_sesiones aas
      ON aas.sesion_id = s.id AND aas.miembro_id = ?
    WHERE s.actividad_id = ?
");
$stmt->execute([$miembro_id, $actividad_id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

$total = (int)($row["total_sesiones"] ?? 0);
$asistidas = (int)($row["asistidas"] ?? 0);

if ($total === 0) {
    echo json_encode(["error" => "La actividad no tiene sesiones"]);
    exit;
}

$porcentaje = ($asistidas / $total) * 100;

if ($porcentaje < 100) {
    echo json_encode([
        "error" => "No tiene 100% asistencia",
        "porcentaje" => round($porcentaje, 2)
    ]);
    exit;
}

/* 3) Dar crédito */
try {
    $stmt = $pdo->prepare("
        INSERT INTO miembros_creditos_historial (miembro_id, actividad_id, creditos_otorgados, motivo, otorgado_por)
        VALUES (?, ?, ?, 'Asistencia 100%', ?)
    ");
    $stmt->execute([$miembro_id, $actividad_id, (int)$act["creditos"], $otorgado_por]);

    echo json_encode([
        "success" => true,
        "msg" => "Credito otorgado",
        "creditos" => (int)$act["creditos"]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "error" => "No se pudo otorgar (quizas ya se otorgo antes, revisar)"
    ]);
}
