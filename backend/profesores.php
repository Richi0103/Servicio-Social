<?php
require "config.php";

$stmt = $pdo->prepare("
  SELECT DISTINCT m.id, m.nombre, m.apellidos, m.email, m.verificado, m.tecnologico
  FROM miembros m
  JOIN miembros_roles mr ON mr.miembro_id = m.id
  JOIN roles r ON r.id = mr.rol_id
  WHERE r.nombre IN ('Asesor', 'Encargado')
    AND m.activo = 1
    AND m.eliminado_en IS NULL
  ORDER BY m.nombre ASC, m.apellidos ASC
");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
