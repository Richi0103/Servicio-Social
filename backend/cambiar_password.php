<?php
require "config.php";

$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$contrasena_nueva = trim($_POST["contrasena_nueva"] ?? ($_POST["password_nueva"] ?? ""));

if (!$username || !$email || !$contrasena_nueva) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["error" => "Correo electrónico inválido"]);
    exit;
}

if (strlen($contrasena_nueva) < 6) {
    echo json_encode(["error" => "La nueva contraseña debe tener al menos 6 caracteres"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, activo, password_hash
    FROM miembros
    WHERE username = ? AND email = ? AND eliminado_en IS NULL
    LIMIT 1
");
$stmt->execute([$username, $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "No existe una cuenta con ese usuario y correo"]);
    exit;
}

if ((int)$user["activo"] === 0) {
    echo json_encode(["error" => "Cuenta inactiva"]);
    exit;
}

if (password_get_info($user["password_hash"])["algo"] !== 0 && password_verify($contrasena_nueva, $user["password_hash"])) {
    echo json_encode(["error" => "La nueva contraseña debe ser diferente a la actual"]);
    exit;
}

if ($contrasena_nueva === $user["password_hash"]) {
    echo json_encode(["error" => "La nueva contraseña debe ser diferente a la actual"]);
    exit;
}

$nuevo_hash = password_hash($contrasena_nueva, PASSWORD_DEFAULT);
$update = $pdo->prepare("UPDATE miembros SET password_hash = ? WHERE id = ?");
$update->execute([$nuevo_hash, $user["id"]]);

echo json_encode(["success" => true, "mensaje" => "Contraseña actualizada"]);
