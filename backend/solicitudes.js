document.addEventListener("DOMContentLoaded", async () => {
  const usuario = getUsuario();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  const userInfo = document.getElementById("userInfo");
  if (userInfo) {
    userInfo.textContent = `Sesión: ${usuario.nombre} ${usuario.apellidos} | ${(usuario.roles || []).join(", ")}`;
  }

  const avatar = document.getElementById("avatar");
  if (avatar) {
    avatar.style.backgroundImage = usuario.foto_perfil
      ? `url(${usuario.foto_perfil})`
      : "none";
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const capituloSelect = document.getElementById("capituloSelectSolicitudes");
  const solicitudesBody = document.getElementById("solicitudesBody");
  const solicitudesMsg = document.getElementById("solicitudesMsg");
  const searchInput = document.getElementById("solicitudSearch");

  let solicitudes = [];

  const setMsg = (text, color = "#b0232a") => {
    if (!solicitudesMsg) return;
    solicitudesMsg.style.color = color;
    solicitudesMsg.textContent = text;
  };

  const renderSolicitudes = (lista) => {
    if (!solicitudesBody) return;
    solicitudesBody.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="7">No hay solicitudes pendientes.</td>
      `;
      solicitudesBody.appendChild(tr);
      return;
    }

    lista.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.nombre} ${s.apellidos}</td>
        <td>${s.numero_control || "-"}</td>
        <td>${s.email || "-"}</td>
        <td>${s.tecnologico || "-"}</td>
        <td>${s.motivo || "-"}</td>
        <td><span class="badge badge-orange">No verificado</span></td>
        <td>
          <div class="actions">
            <button class="btn" data-action="aprobar" data-id="${s.id}">
              Aprobar
            </button>
            <button class="btn-secondary" data-action="rechazar" data-id="${s.id}">
              Rechazar
            </button>
          </div>
        </td>
      `;
      solicitudesBody.appendChild(tr);
    });
  };

  const filtrarSolicitudes = () => {
    const term = (searchInput?.value || "").trim().toLowerCase();
    if (!term) {
      renderSolicitudes(solicitudes);
      return;
    }
    const filtered = solicitudes.filter((s) => {
      return (
        `${s.nombre} ${s.apellidos}`.toLowerCase().includes(term) ||
        (s.numero_control || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term)
      );
    });
    renderSolicitudes(filtered);
  };

  const cargarSolicitudes = async (capituloId) => {
    if (!capituloId) {
      solicitudes = [];
      renderSolicitudes([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/solicitudes_pendientes.php?capitulo_id=${capituloId}`,
      );
      const data = await res.json();

      if (data.error) {
        setMsg(data.error);
        solicitudes = [];
        renderSolicitudes([]);
        return;
      }

      solicitudes = Array.isArray(data) ? data : [];
      renderSolicitudes(solicitudes);
      setMsg("", "#666");
    } catch (e) {
      console.error(e);
      setMsg("Error al cargar solicitudes.");
    }
  };

  await cargarCapitulosSelect("capituloSelectSolicitudes");

  if (capituloSelect) {
    capituloSelect.addEventListener("change", () => {
      cargarSolicitudes(capituloSelect.value);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", filtrarSolicitudes);
  }

  if (solicitudesBody) {
    solicitudesBody.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const miembroId = btn.dataset.id;
      const capituloId = capituloSelect?.value;

      if (!miembroId || !capituloId) {
        setMsg("Selecciona un capítulo.");
        return;
      }

      if (action === "aprobar") {
        try {
          const res = await fetch(`${API_URL}/aprobar_solicitud.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              miembro_id: miembroId,
              capitulo_id: capituloId,
            }),
          });
          const data = await res.json();
          if (data.error) {
            setMsg(data.error);
            return;
          }
          setMsg("Solicitud aprobada.", "green");
          solicitudes = solicitudes.filter((s) => String(s.id) !== miembroId);
          filtrarSolicitudes();
        } catch (err) {
          console.error(err);
          setMsg("Error al aprobar solicitud.");
        }
        return;
      }

      if (action === "rechazar") {
        setMsg("Solicitud rechazada (sin cambios).", "#666");
      }
    });
  }
});

async function cargarCapitulosSelect(selectId) {
  const select = document.getElementById(selectId);
  const usuario = getUsuario();
  if (!select) return;

  try {
    const res = await fetch(
      `${API_URL}/capitulos_por_profesor.php?miembro_id=${usuario.id}`,
    );
    const data = await res.json();

    select.innerHTML = "";

    if (data.error) {
      select.innerHTML = `<option value="">Error</option>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      select.innerHTML = `<option value="">Sin capítulos</option>`;
      return;
    }

    select.innerHTML = `<option value="">-- Selecciona --</option>`;
    data.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    select.innerHTML = `<option value="">Error</option>`;
  }
}
