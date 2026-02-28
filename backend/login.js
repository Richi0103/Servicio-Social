document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", login);
});

async function login(e) {
  e.preventDefault();

  const identificadorInput =
    document.getElementById("loginIdentificador") || document.getElementById("email");
  const contrasenaInput =
    document.getElementById("loginContrasena") || document.getElementById("password");
  const msg = document.getElementById("loginMsg");

  if (!identificadorInput || !contrasenaInput || !msg) {
    console.error("Faltan elementos del formulario de login");
    return;
  }

  const identificador = identificadorInput.value.trim();
  const contrasena = contrasenaInput.value;

  msg.style.color = "#64748b";
  msg.textContent = "Validando acceso...";

  try {
    const res = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        identificador,
        contrasena,
      }),
    });

    const data = await res.json();

    if (data.error) {
      msg.style.color = "#b0232a";
      msg.textContent = data.error;
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(data.user));

    msg.style.color = "#1a7f37";
    msg.textContent = "Acceso correcto, redirigiendo...";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 900);
  } catch (error) {
    console.error(error);
    msg.style.color = "#b0232a";
    msg.textContent = "Error de conexión con el servidor";
  }
}
