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
      m.id AS miembro_id,
      m.id AS alumno_id,
      m.numero_control,
      CONCAT(m.nombre, ' ', m.apellidos) AS alumno,
      m.email,
      m.verificado,
      m.tecnologico,
      ai.estado,

      SUM(CASE WHEN aas.asistio = 1 THEN 1 ELSE 0 END) AS asistidas,

      CASE WHEN ach.id IS NULL THEN 0 ELSE 1 END AS credito_otorgado

    FROM actividades_inscripciones ai
    JOIN miembros m ON m.id = ai.miembro_id
    LEFT JOIN actividades_asistencia_sesiones aas
      ON aas.miembro_id = m.id AND aas.actividad_id = ai.actividad_id

    LEFT JOIN miembros_creditos_historial ach
      ON ach.miembro_id = m.id AND ach.actividad_id = ai.actividad_id

    WHERE ai.actividad_id = ?
    GROUP BY m.id, m.numero_control, alumno, m.email, m.verificado, m.tecnologico, ai.estado, credito_otorgado
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
        "miembro_id" => (int)$r["miembro_id"],
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
