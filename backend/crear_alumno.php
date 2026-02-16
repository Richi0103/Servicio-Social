<?php
require "config.php";

$numero_control = trim($_POST["numero_control"] ?? "");
$nombre = trim($_POST["nombre"] ?? "");
$apellidos = trim($_POST["apellidos"] ?? "");
$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefono = trim($_POST["telefono"] ?? "");
$password = trim($_POST["password"] ?? "");
$verificado = (int)($_POST["verificado"] ?? 0);
$tecnologico = trim($_POST["tecnologico"] ?? "");
$capitulo_id = $_POST["capitulo_id"] ?? 0;

if (!$nombre || !$apellidos || !$email || !$password) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

function normalizarUsername($valor) {
    $valor = strtolower(trim($valor));
    $valor = str_replace(" ", ".", $valor);
    $valor = preg_replace('/[^a-z0-9._-]/', '', $valor);
    return $valor ?: "miembro";
}

function generarUsername(PDO $pdo, $base) {
    $username = normalizarUsername($base);
    $candidato = $username;
    $i = 1;

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM miembros WHERE username = ?");
    while (true) {
        $stmt->execute([$candidato]);
        if ((int)$stmt->fetchColumn() === 0) {
            return $candidato;
        }
        $candidato = $username . $i;
        $i++;
    }
}

$numero_control = $numero_control !== "" ? $numero_control : null;
$telefono = $telefono !== "" ? $telefono : null;
$tecnologico = $tecnologico !== "" ? $tecnologico : null;
$capitulo_id = $capitulo_id ? (int)$capitulo_id : 0;

if ($username === "") {
    $base = $numero_control ?: ($email ? explode("@", $email)[0] : ($nombre . "." . $apellidos));
    $username = generarUsername($pdo, $base);
} else {
    $username = generarUsername($pdo, $username);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO miembros (numero_control, nombre, apellidos, username, email, telefono, password_hash, activo, verificado, tecnologico)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    ");
    $stmt->execute([$numero_control, $nombre, $apellidos, $username, $email, $telefono, $password, $verificado, $tecnologico]);
    $miembro_id = (int)$pdo->lastInsertId();

    $rol_id = $pdo->query("SELECT id FROM roles WHERE nombre = 'Miembro'")->fetchColumn();
    if (!$rol_id) {
        throw new Exception("Rol Miembro no existe");
    }

    $stmt2 = $pdo->prepare("INSERT INTO miembros_roles (miembro_id, rol_id) VALUES (?, ?)");
    $stmt2->execute([$miembro_id, (int)$rol_id]);

    if ($capitulo_id) {
        $stmt3 = $pdo->prepare("INSERT INTO capitulos_miembros (capitulo_id, miembro_id, estado) VALUES (?, ?, 'Activo')");
        $stmt3->execute([$capitulo_id, $miembro_id]);
    }

    $pdo->commit();

    echo json_encode(["success" => true, "miembro_id" => $miembro_id, "usuario_id" => $miembro_id, "username" => $username]);
} catch (PDOException $e) {
    $pdo->rollBack();
    if ((int)$e->getCode() === 23000) {
        echo json_encode(["error" => "Email, numero de control o username ya existe"]);
        exit;
    }
    echo json_encode(["error" => "No se pudo crear el miembro"]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "No se pudo crear el miembro"]);
}
