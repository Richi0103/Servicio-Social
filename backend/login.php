<?php
require "config.php";

$identificador = trim($_POST["email"] ?? ($_POST["username"] ?? ($_POST["identificador"] ?? "")));
$password = $_POST["password"] ?? "";

if (!$identificador || !$password) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, nombre, apellidos, username, email, password_hash, activo, foto_perfil, verificado, tecnologico
    FROM miembros
    WHERE (email = ? OR username = ?) AND eliminado_en IS NULL
    LIMIT 1
");
$stmt->execute([$identificador, $identificador]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "Miembro no existe"]);
    exit;
}

if ((int)$user["activo"] === 0) {
    echo json_encode(["error" => "Miembro inactivo"]);
    exit;
}

if ($password !== $user["password_hash"]) {
    echo json_encode(["error" => "Password incorrecta"]);
    exit;
}

/* Obtener roles */
$stmt2 = $pdo->prepare("
    SELECT r.nombre
    FROM miembros_roles mr
    JOIN roles r ON r.id = mr.rol_id
    WHERE mr.miembro_id = ?
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
        "username" => $user["username"],
        "email" => $user["email"],
        "roles" => $roles,
        "foto_perfil" => $user["foto_perfil"],
        "verificado" => (int)$user["verificado"],
        "tecnologico" => $user["tecnologico"],
    ]
]);
