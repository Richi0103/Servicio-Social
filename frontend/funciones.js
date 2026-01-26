const API_URL = "http://localhost:8888/capitulos_api";

function getUsuario() {
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

function goBack() {
  window.location.href = "dashboard.html";
}
