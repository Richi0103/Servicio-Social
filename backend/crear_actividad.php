<?php
require "config.php";

function leerEntrada() {
    $data = $_POST;
    if (empty($data)) {
        $raw = file_get_contents("php://input");
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $data = $json;
        }
    }
    return $data;
}

function fechaSoloDia($valor) {
    if (!$valor) return null;
    $fecha = substr($valor, 0, 10);
    if (!$fecha) return null;
    return DateTime::createFromFormat("Y-m-d", $fecha) ?: null;
}

function validarRangoFechas($inicioValor, $finValor, $etiqueta, &$errores) {
    $inicio = fechaSoloDia($inicioValor);
    $fin = fechaSoloDia($finValor);
    $hoy = new DateTime("today");

    if (!$inicio || !$fin) {
        $errores[] = "$etiqueta: fecha inicio y fin son obligatorias.";
        return;
    }

    if ($inicio < $hoy) {
        $errores[] = "$etiqueta: la fecha de inicio no puede ser anterior a hoy.";
    }

    if ($fin < $inicio) {
        $errores[] = "$etiqueta: la fecha de fin no puede ser anterior a la fecha de inicio.";
    }
}

$data = leerEntrada();

$capitulo_id = (int)($data["capitulo_id"] ?? 0);
$tipo = trim($data["tipo"] ?? "");
$titulo = trim($data["titulo"] ?? "");
$descripcion = trim($data["descripcion"] ?? "");
$lugar = trim($data["lugar"] ?? "");
$cupo = $data["cupo"] ?? null;
$otorga_creditos = $data["otorga_creditos"] ?? 0;
$creditos = $data["creditos"] ?? 0;
$fecha_inicio = $data["fecha_inicio"] ?? "";
$fecha_fin = $data["fecha_fin"] ?? "";
$creado_por = $data["creado_por"] ?? null;

$sesiones = $data["sesiones"] ?? [];
if (is_string($sesiones)) {
    $sesiones = json_decode($sesiones, true) ?: [];
}

$errores = [];

if (!$capitulo_id) $errores[] = "Actividad: selecciona un capítulo.";
if (!$tipo) $errores[] = "Actividad: selecciona un tipo.";
if (!$titulo) $errores[] = "Actividad: el título es obligatorio.";
if (!$descripcion) $errores[] = "Actividad: la descripción es obligatoria.";
if (!$lugar) $errores[] = "Actividad: el lugar es obligatorio.";

if ($cupo === null || $cupo === "") {
    $errores[] = "Actividad: el cupo es obligatorio.";
} else {
    $cupo = (int)$cupo;
    if ($cupo < 1 || $cupo > 30) {
        $errores[] = "Actividad: el cupo debe estar entre 1 y 30.";
    }
}

validarRangoFechas($fecha_inicio, $fecha_fin, "Actividad", $errores);

if (!is_array($sesiones) || count($sesiones) < 1) {
    $errores[] = "Sesiones: debe existir al menos una sesión.";
}

if (is_array($sesiones)) {
    foreach ($sesiones as $idx => $s) {
        $titulo_s = trim($s["titulo"] ?? "");
        $desc_s = trim($s["descripcion"] ?? "");
        $inicio_s = $s["fecha_inicio"] ?? "";
        $fin_s = $s["fecha_fin"] ?? "";

        if (!$titulo_s || !$desc_s || !$inicio_s || !$fin_s) {
            $errores[] = "Sesión " . ($idx + 1) . ": todos los campos son obligatorios.";
            continue;
        }

        validarRangoFechas($inicio_s, $fin_s, "Sesión " . ($idx + 1), $errores);
    }
}

$otorga_creditos = filter_var($otorga_creditos, FILTER_VALIDATE_BOOLEAN) ? 1 : (int)$otorga_creditos;
$creditos = (int)$creditos;
if ($otorga_creditos === 0) {
    $creditos = 0;
} else if ($creditos <= 0) {
    $errores[] = "Actividad: si otorga crédito, los créditos deben ser mayor a 0.";
}

if (!empty($errores)) {
    echo json_encode(["error" => implode(" | ", $errores)]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO actividades
          (capitulo_id, tipo, titulo, descripcion, lugar, cupo, otorga_creditos, creditos, fecha_inicio, fecha_fin, estado, creado_por, actualizado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Publicado', ?, ?)
    ");
    $stmt->execute([
        $capitulo_id,
        $tipo,
        $titulo,
        $descripcion,
        $lugar,
        $cupo,
        $otorga_creditos,
        $creditos,
        $fecha_inicio,
        $fecha_fin,
        $creado_por,
        $creado_por,
    ]);

    $actividad_id = (int)$pdo->lastInsertId();

    $stmtSes = $pdo->prepare("
        INSERT INTO actividades_sesiones (actividad_id, titulo, descripcion, fecha_inicio, fecha_fin)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($sesiones as $s) {
        $stmtSes->execute([
            $actividad_id,
            trim($s["titulo"] ?? ""),
            trim($s["descripcion"] ?? ""),
            $s["fecha_inicio"] ?? "",
            $s["fecha_fin"] ?? "",
        ]);
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "actividad_id" => $actividad_id
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(["error" => "No se pudo guardar la actividad."]);
}
