<?php
require "config.php";

$stmt = $pdo->prepare("
  SELECT m.id, m.numero_control, m.nombre, m.apellidos, m.email
  FROM miembros m
  JOIN miembros_roles mr ON mr.miembro_id = m.id
  JOIN roles r ON r.id = mr.rol_id
  WHERE r.nombre = 'Miembro'
    AND m.activo = 1
    AND m.eliminado_en IS NULL
  ORDER BY m.nombre ASC, m.apellidos ASC
");
/* Compatibilidad con frontend actual: se mantiene endpoint alumnos.php */
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
