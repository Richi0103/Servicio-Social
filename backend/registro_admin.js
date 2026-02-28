document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroAdminForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contrasena = document.getElementById("regContrasena").value;
    const confirmacion = document.getElementById("regContrasena2").value;
    const msg = document.getElementById("registroMsg");

    if (contrasena !== confirmacion) {
      msg.style.color = "#b0232a";
      msg.textContent = "Las contraseñas no coinciden";
      return;
    }

    msg.style.color = "#64748b";
    msg.textContent = "Creando cuenta...";

    try {
      const res = await fetch(`${API_URL}/registrar_admin_capitulo.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          nombre: document.getElementById("regNombre").value.trim(),
          apellidos: document.getElementById("regApellidos").value.trim(),
          username: document.getElementById("regUsername").value.trim(),
          email: document.getElementById("regEmail").value.trim(),
          telefono: document.getElementById("regTelefono").value.trim(),
          contrasena,
        }),
      });

      const data = await res.json();

      if (data.error) {
        msg.style.color = "#b0232a";
        msg.textContent = data.error;
        return;
      }

      form.reset();
      msg.style.color = "#1a7f37";
      msg.textContent = "Cuenta creada. Queda pendiente de verificación.";
    } catch (error) {
      console.error(error);
      msg.style.color = "#b0232a";
      msg.textContent = "Error de conexión con el servidor";
    }
  });
});
