document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }
});

async function login(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("loginMsg");

  msg.textContent = "Cargando...";

  try {
    const res = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.error) {
      msg.textContent = data.error;
      return;
    }

    //sesion en localStorage
    localStorage.setItem("usuario", JSON.stringify(data.user));

    msg.style.color = "green";
    msg.textContent = "Verificado, redirigiendo...";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    msg.textContent = "Error de conexión con el servidor";
  }
}
