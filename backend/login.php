<?php
require "config.php";

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

if (!$email || !$password) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, nombre, apellidos, email, password_hash, activo, foto_perfil, verificado, tecnologico
    FROM usuarios
    WHERE email = ? AND eliminado_en IS NULL
");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "Usuario no existe"]);
    exit;
}

if ((int)$user["activo"] === 0) {
    echo json_encode(["error" => "Usuario inactivo"]);
    exit;
}

if ($password !== $user["password_hash"]) {
    echo json_encode(["error" => "Password incorrecta"]);
    exit;
}

/* Obtener roles */
$stmt2 = $pdo->prepare("
    SELECT r.nombre
    FROM usuarios_roles ur
    JOIN roles r ON r.id = ur.rol_id
    WHERE ur.usuario_id = ?
");
$stmt2->execute([$user["id"]]);
$roles = $stmt2->fetchAll(PDO::FETCH_COLUMN);

/* Respuesta */
echo json_encode([
    "success" => true,
    "user" => [
        "id" => (int)$user["id"],
        "nombre" => $user["nombre"],
        "apellidos" => $user["apellidos"],
        "email" => $user["email"],
        "roles" => $roles,
        "foto_perfil" => $user["foto_perfil"],
        "verificado" => (int)$user["verificado"],
        "tecnologico" => $user["tecnologico"],
    ]
]);