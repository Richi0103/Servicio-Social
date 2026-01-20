<?php
require "config.php";

$usuario_id = $_POST["usuario_id"] ?? 0;
$foto_base64 = $_POST["foto_base64"] ?? "";

if (!$usuario_id || !$foto_base64) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

if (strpos($foto_base64, "data:image/") !== 0) {
    echo json_encode(["error" => "Formato de imagen no valido"]);
    exit;
}

if (strlen($foto_base64) > (2 * 1024 * 1024)) {
    echo json_encode(["error" => "Imagen muy grande"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id = ?");
    $stmt->execute([$foto_base64, $usuario_id]);

    echo json_encode([
        "success" => true,
        "foto_perfil" => $foto_base64
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "No se pudo guardar la foto"]);
}
