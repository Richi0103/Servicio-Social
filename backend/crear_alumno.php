<?php
require "config.php";

$numero_control = trim($_POST["numero_control"] ?? "");
$nombre = trim($_POST["nombre"] ?? "");
$apellidos = trim($_POST["apellidos"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefono = trim($_POST["telefono"] ?? "");
$password = trim($_POST["password"] ?? "");
$capitulo_id = $_POST["capitulo_id"] ?? 0;

if (!$nombre || !$apellidos || !$email || !$password) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$numero_control = $numero_control !== "" ? $numero_control : null;
$telefono = $telefono !== "" ? $telefono : null;
$capitulo_id = $capitulo_id ? (int)$capitulo_id : 0;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO usuarios (numero_control, nombre, apellidos, email, telefono, password_hash, activo, verificado)
        VALUES (?, ?, ?, ?, ?, ?, 1, 0)
    ");
    $stmt->execute([$numero_control, $nombre, $apellidos, $email, $telefono, $password]);
    $usuario_id = (int)$pdo->lastInsertId();

    $rol_id = $pdo->query("SELECT id FROM roles WHERE nombre = 'Alumno'")->fetchColumn();
    if (!$rol_id) {
        throw new Exception("Rol Alumno no existe");
    }

    $stmt2 = $pdo->prepare("INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)");
    $stmt2->execute([$usuario_id, (int)$rol_id]);

    if ($capitulo_id) {
        $stmt3 = $pdo->prepare("INSERT INTO capitulos_alumnos (capitulo_id, alumno_id, estado) VALUES (?, ?, 'Activo')");
        $stmt3->execute([$capitulo_id, $usuario_id]);
    }

    $pdo->commit();

    echo json_encode(["success" => true, "usuario_id" => $usuario_id]);
} catch (PDOException $e) {
    $pdo->rollBack();
    if ((int)$e->getCode() === 23000) {
        echo json_encode(["error" => "Email o numero de control ya existe"]);
        exit;
    }
    echo json_encode(["error" => "No se pudo crear el alumno"]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "No se pudo crear el alumno"]);
}
