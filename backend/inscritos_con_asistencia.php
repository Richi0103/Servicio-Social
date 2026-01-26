<?php
require "config.php";
$actividad_id = $_GET["actividad_id"] ?? 0;

if (!$actividad_id) {
    echo json_encode(["error" => "Falta actividad_id"]);
    exit;
}

/* Total de sesiones */
$stmt = $pdo->prepare("SELECT COUNT(*) FROM actividades_sesiones WHERE actividad_id = ?");
$stmt->execute([$actividad_id]);
$total_sesiones = (int)$stmt->fetchColumn();

if ($total_sesiones === 0) {
    echo json_encode(["error" => "La actividad no tiene sesiones"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT
      u.id AS alumno_id,
      u.numero_control,
      CONCAT(u.nombre, ' ', u.apellidos) AS alumno,
      u.email,
      u.verificado,
      u.tecnologico,
      ai.estado,

      SUM(CASE WHEN aas.asistio = 1 THEN 1 ELSE 0 END) AS asistidas,

      CASE WHEN ach.id IS NULL THEN 0 ELSE 1 END AS credito_otorgado

    FROM actividades_inscripciones ai
    JOIN usuarios u ON u.id = ai.alumno_id
    LEFT JOIN actividades_asistencia_sesiones aas
      ON aas.alumno_id = u.id AND aas.actividad_id = ai.actividad_id

    LEFT JOIN alumnos_creditos_historial ach
      ON ach.alumno_id = u.id AND ach.actividad_id = ai.actividad_id

    WHERE ai.actividad_id = ?
    GROUP BY u.id, u.numero_control, alumno, u.email, u.verificado, u.tecnologico, ai.estado, credito_otorgado
    ORDER BY alumno ASC
");
$stmt->execute([$actividad_id]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* Agregar porcentaje */
$resultado = [];
foreach ($rows as $r) {
    $asistidas = (int)($r["asistidas"] ?? 0);
    $porcentaje = round(($asistidas / $total_sesiones) * 100, 2);
    $creditoOtorgado = (int)($r["credito_otorgado"] ?? 0);

    $resultado[] = [
        "alumno_id" => (int)$r["alumno_id"],
        "numero_control" => $r["numero_control"],
        "alumno" => $r["alumno"],
        "email" => $r["email"],
        "verificado" => (int)$r["verificado"],
        "tecnologico" => $r["tecnologico"],
        "estado" => $r["estado"],
        "asistidas" => $asistidas,
        "total_sesiones" => $total_sesiones,
        "porcentaje" => $porcentaje,
        "listo_para_credito" => ($porcentaje == 100),
        "credito_otorgado" => ($creditoOtorgado === 1)
    ];
}

echo json_encode($resultado);
