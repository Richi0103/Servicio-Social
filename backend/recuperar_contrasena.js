document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperacionForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contrasena = document.getElementById("recContrasena").value;
    const confirmacion = document.getElementById("recContrasena2").value;
    const msg = document.getElementById("recMsg");

    if (contrasena !== confirmacion) {
      msg.style.color = "#b0232a";
      msg.textContent = "Las contraseñas no coinciden";
      return;
    }

    msg.style.color = "#64748b";
    msg.textContent = "Actualizando contraseña...";

    try {
      const res = await fetch(`${API_URL}/cambiar_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: document.getElementById("recUsername").value.trim(),
          email: document.getElementById("recEmail").value.trim(),
          contrasena_nueva: contrasena,
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
      msg.textContent = "Contraseña actualizada. Ya puedes iniciar sesión.";
    } catch (error) {
      console.error(error);
      msg.style.color = "#b0232a";
      msg.textContent = "Error de conexión con el servidor";
    }
  });
});
