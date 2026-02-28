<?php
require "config.php";

$nombre = trim($_POST["nombre"] ?? "");
$apellidos = trim($_POST["apellidos"] ?? "");
$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefono = trim($_POST["telefono"] ?? "");
$contrasena = trim($_POST["contrasena"] ?? ($_POST["password"] ?? ""));

if (!$nombre || !$apellidos || !$username || !$email || !$telefono || !$contrasena) {
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["error" => "Correo electrónico inválido"]);
    exit;
}

if (strlen($contrasena) < 6) {
    echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres"]);
    exit;
}

function normalizarUsername($valor) {
    $valor = strtolower(trim($valor));
    $valor = str_replace(" ", ".", $valor);
    $valor = preg_replace('/[^a-z0-9._-]/', '', $valor);
    return $valor;
}

$username = normalizarUsername($username);
if ($username === "") {
    echo json_encode(["error" => "El nombre de usuario no es válido"]);
    exit;
}

try {
    $existeEmailStmt = $pdo->prepare("SELECT id FROM miembros WHERE email = ? AND eliminado_en IS NULL LIMIT 1");
    $existeEmailStmt->execute([$email]);
    if ($existeEmailStmt->fetchColumn()) {
        echo json_encode(["error" => "Ya existe una cuenta con ese correo"]);
        exit;
    }

    $existeUserStmt = $pdo->prepare("SELECT id FROM miembros WHERE username = ? AND eliminado_en IS NULL LIMIT 1");
    $existeUserStmt->execute([$username]);
    if ($existeUserStmt->fetchColumn()) {
        echo json_encode(["error" => "Ese nombre de usuario ya está en uso"]);
        exit;
    }

    $pdo->beginTransaction();

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO miembros (numero_control, nombre, apellidos, username, email, telefono, password_hash, activo, verificado, tecnologico)
        VALUES (NULL, ?, ?, ?, ?, ?, ?, 1, 0, NULL)
    ");
    $stmt->execute([$nombre, $apellidos, $username, $email, $telefono, $hash]);
    $miembro_id = (int)$pdo->lastInsertId();

    $rolAdmin = $pdo->query("SELECT id FROM roles WHERE nombre = 'Admin' LIMIT 1")->fetchColumn();
    if (!$rolAdmin) {
        throw new Exception("Rol Admin no existe");
    }

    $stmtRol = $pdo->prepare("INSERT INTO miembros_roles (miembro_id, rol_id) VALUES (?, ?)");
    $stmtRol->execute([$miembro_id, (int)$rolAdmin]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "miembro_id" => $miembro_id,
        "username" => $username,
        "mensaje" => "Cuenta creada. Pendiente de verificación"
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ((int)$e->getCode() === 23000) {
        echo json_encode(["error" => "No se pudo registrar por datos duplicados"]);
        exit;
    }
    echo json_encode(["error" => "No se pudo registrar el administrador"]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "No se pudo registrar el administrador"]);
}
