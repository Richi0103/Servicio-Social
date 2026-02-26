<?php
require "config.php";

$capitulo_id = $_GET["capitulo_id"] ?? 0;

if (!$capitulo_id) {
    echo json_encode(["error" => "Falta capitulo_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT m.id, m.nombre, m.apellidos, m.numero_control, m.email, m.tecnologico,
           m.verificado, cm.estado, cm.motivo
    FROM capitulos_miembros cm
    JOIN miembros m ON m.id = cm.miembro_id
    WHERE cm.capitulo_id = ?
      AND cm.estado = 'Inactivo'
      AND m.verificado = 0
    ORDER BY m.creado_en DESC
");

$stmt->execute([$capitulo_id]);
$solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($solicitudes);
