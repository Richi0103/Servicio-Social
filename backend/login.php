<?php
require "config.php";

$identificador = trim($_POST["email"] ?? ($_POST["username"] ?? ($_POST["identificador"] ?? "")));
$contrasena = $_POST["contrasena"] ?? ($_POST["password"] ?? "");

if (!$identificador || !$contrasena) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

function contrasenaValida(string $ingresada, string $hashGuardado): bool {
    if ($ingresada === $hashGuardado) {
        return true;
    }

    if (password_get_info($hashGuardado)["algo"] !== 0) {
        return password_verify($ingresada, $hashGuardado);
    }

    return false;
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
    echo json_encode(["error" => "Cuenta inactiva"]);
    exit;
}

if ((int)$user["verificado"] === 0) {
    echo json_encode(["error" => "Tu cuenta está pendiente de verificación"]);
    exit;
}

if (!contrasenaValida($contrasena, $user["password_hash"])) {
    echo json_encode(["error" => "Contraseña incorrecta"]);
    exit;
}

if ($contrasena === $user["password_hash"]) {
    $nuevoHash = password_hash($contrasena, PASSWORD_DEFAULT);
    $update = $pdo->prepare("UPDATE miembros SET password_hash = ? WHERE id = ?");
    $update->execute([$nuevoHash, $user["id"]]);
}

$stmt2 = $pdo->prepare("
    SELECT r.nombre
    FROM miembros_roles mr
    JOIN roles r ON r.id = mr.rol_id
    WHERE mr.miembro_id = ?
");
$stmt2->execute([$user["id"]]);
$roles = $stmt2->fetchAll(PDO::FETCH_COLUMN);

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
