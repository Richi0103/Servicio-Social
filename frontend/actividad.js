document.addEventListener("DOMContentLoaded", () => {
  const actTitle = document.getElementById("actTitle");
  if (actTitle) {
    initActividadPage();
  }
});

async function initActividadPage() {
  const usuario = getUsuario();

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  // botones
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("backBtn").addEventListener("click", goBack);

  const actividadId = localStorage.getItem("actividad_id");
  if (!actividadId) {
    window.location.href = "dashboard.html";
    return;
  }

  await cargarDetalleActividad(actividadId);
  await cargarInscritosConAsistencia(actividadId);
}

async function cargarDetalleActividad(actividadId) {
  const msg = document.getElementById("actMsg");
  msg.textContent = "";

  try {
    const res = await fetch(
      `${API_URL}/actividad_detalle.php?actividad_id=${actividadId}`,
    );
    const data = await res.json();

    if (data.error) {
      msg.textContent = data.error;
      return;
    }

    const actividad = data.actividad;
    const sesiones = data.sesiones || [];

    document.getElementById("actTitle").textContent =
      actividad.titulo || "Actividad";
    document.getElementById("actSub").textContent =
      `${actividad.tipo} | ${actividad.lugar || "Sin lugar"} | Créditos: ${actividad.otorga_creditos == 1 ? actividad.creditos : 0}`;

    // sesiones
    const cont = document.getElementById("sesionesContainer");
    if (!Array.isArray(sesiones) || sesiones.length === 0) {
      cont.innerHTML = "No hay sesiones registradas.";
      return;
    }

    cont.innerHTML = "";
    sesiones.forEach((s) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <h3>${s.descripcion || "Sesión"}</h3>
          <p>${s.titulo || ""}</p>
          <p class="small">${formatearFecha(s.fecha_inicio)} → ${formatearFecha(s.fecha_fin)}</p>
        </div>
      `;
      cont.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    msg.textContent = "Error cargando detalle de actividad";
  }
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

async function cargarInscritosConAsistencia(actividadId) {
  const msg = document.getElementById("actMsg");
  const cont = document.getElementById("inscritosContainer");
  msg.textContent = "";
  cont.innerHTML = "Cargando inscritos...";

  try {
    const res = await fetch(
      `${API_URL}/inscritos_con_asistencia.php?actividad_id=${actividadId}`,
    );
    const data = await res.json();
    console.log(data);

    if (data.error) {
      cont.innerHTML = "";
      msg.textContent = data.error;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      cont.innerHTML = "No hay inscritos.";
      return;
    }

    // armar tabla
    let html = `
      <table class="table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>% Asistencia</th>
            <th>Sesiones</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach((a) => {
      const badge = a.listo_para_credito
        ? `<span class="badge badge-green">Listo</span>`
        : `<span class="badge badge-orange">Pendiente</span>`;
      let btnHtml = "";

      if (a.credito_otorgado) {
        btnHtml = `<button class="btn-secondary" disabled>Ya otorgado</button>`;
      } else {
        const readyAttr = a.listo_para_credito ? "1" : "0";
        const btnClass = a.listo_para_credito ? "btn" : "btn btn-disabled";
        btnHtml = `
            <button
              class="${btnClass}"
              data-otorgar="${a.alumno_id}"
              data-ready="${readyAttr}"
              data-porcentaje="${a.porcentaje}"
            >
                Otorgar crédito
            </button>
        `;
      }

      html += `
        <tr>
          <td>${a.alumno}<br><span class="small">${a.numero_control || ""}</span></td>
          <td>${a.porcentaje}% ${badge}</td>
          <td>${a.asistidas}/${a.total_sesiones}</td>
          <td>${a.estado}</td>
          <td>
            <div class="actions">
             ${btnHtml}
            </div>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    cont.innerHTML = html;

    //botones otorgar crédito
    cont.querySelectorAll("button[data-otorgar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ready = btn.getAttribute("data-ready") == "1";
        const porcentaje = btn.getAttribute("data-porcentaje");

        if (!ready) {
          msg.style.color = "red";
          msg.textContent = `Debe cumplir 100% de asistencia (actual: ${porcentaje}%).`;
          return;
        }

        const alumnoId = btn.getAttribute("data-otorgar");
        await otorgarCredito(actividadId, alumnoId);
      });
    });
  } catch (e) {
    console.error(e);
    cont.innerHTML = "";
    msg.textContent = "Error cargando inscritos";
  }
}

async function otorgarCredito(actividadId, alumnoId) {
  const msg = document.getElementById("actMsg");
  msg.style.color = "red";
  msg.textContent = "Otorgando crédito...";

  const usuario = getUsuario();

  try {
    const res = await fetch(`${API_URL}/otorgar_credito.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        actividad_id: actividadId,
        alumno_id: alumnoId,
        otorgado_por: usuario.id,
      }),
    });

    const data = await res.json();

    if (data.error) {
      msg.textContent = data.error;
      return;
    }

    msg.style.color = "green";
    msg.textContent = "Crédito otorgado";
    await cargarInscritosConAsistencia(actividadId);
  } catch (e) {
    console.error(e);
    msg.textContent = "Error otorgando crédito";
  }
}
