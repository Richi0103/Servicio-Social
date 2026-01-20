const API_URL = "http://localhost:8888/capitulos_api";

document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  // DASHBOARD
  const capituloSelect = document.getElementById("capituloSelect");
  if (capituloSelect) {
    initDashboard();
  }

  //ACTICIDAD
  const actTitle = document.getElementById("actTitle");
  if (actTitle) {
    initActividadPage();
  }

  // CREAR CAPITULO
  const crearCap = document.getElementById("capituloForm");
  if (crearCap) {
    initCapCrear();
  }

  const sesionesForm = document.getElementById("sesionesForm");
  const addSesionBtn = document.getElementById("addSesionBtn");
  if (sesionesForm && addSesionBtn) {
    initSesionesForm(sesionesForm, addSesionBtn);
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

    //sesión en localStorage
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

function getUsuario() {
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

async function initDashboard() {
  const usuario = getUsuario();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  //carga foto de perfil
  const avatar = document.getElementById("avatar");
  if (avatar) {
    if (usuario.foto_perfil) {
      avatar.style.backgroundImage = `url(${usuario.foto_perfil})`;
    } else {
      avatar.style.backgroundImage = "none"; // se queda gris
    }
  }

  //mostrar usuario
  const userInfo = document.getElementById("userInfo");
  userInfo.textContent = `Sesión: ${usuario.nombre} ${usuario.apellidos} | ${(usuario.roles || []).join(", ")}`;

  //subir foto de perfil
  const fotoInput = document.getElementById("fotoInput");
  const fotoMsg = document.getElementById("fotoMsg");
  if (fotoInput && fotoMsg) {
    fotoInput.addEventListener("change", () => {
      const file = fotoInput.files && fotoInput.files[0];
      if (!file) return;

      fotoMsg.style.color = "#666";
      fotoMsg.textContent = "";

      if (!file.type.startsWith("image/")) {
        //verifica si es imagen
        fotoMsg.style.color = "red";
        fotoMsg.textContent = "Selecciona un archivo de imagen.";
        fotoInput.value = "";
        return;
      }

      const maxBytes = 1024 * 1024; // 1 MB
      if (file.size > maxBytes) {
        fotoMsg.style.color = "red";
        fotoMsg.textContent = "La imagen debe ser menor a 1 MB.";
        fotoInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        fotoMsg.style.color = "#666";
        fotoMsg.textContent = "Guardando foto...";

        try {
          const data = await actualizarFotoPerfil(usuario.id, base64); //manda id y la base64
          if (data.error) {
            fotoMsg.style.color = "red";
            fotoMsg.textContent = data.error;
            return;
          }

          const foto = data.foto_perfil || base64;
          const avatar = document.getElementById("avatar");
          if (avatar) {
            avatar.style.backgroundImage = `url(${foto})`;
          }

          const updatedUser = { ...usuario, foto_perfil: foto };
          localStorage.setItem("usuario", JSON.stringify(updatedUser));

          fotoMsg.style.color = "green";
          fotoMsg.textContent = "Foto actualizada.";
        } catch (e) {
          console.error(e);
          fotoMsg.style.color = "red";
          fotoMsg.textContent = "Error al guardar la foto.";
        } finally {
          fotoInput.value = "";
        }
      };

      reader.onerror = () => {
        fotoMsg.style.color = "red";
        fotoMsg.textContent = "No se pudo leer la imagen.";
        fotoInput.value = "";
      };

      reader.readAsDataURL(file); //convertir a base64
    });
  }

  //botón logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", logout);

  //boton crear capitulo
  const capBtn = document.getElementById("adminBtn");
  capBtn.addEventListener("click", crearCapitulo);

  //cargar capítulos
  await cargarCapitulosEnSelect();

  //cargar actividades
  const capituloSelect = document.getElementById("capituloSelect");
  capituloSelect.addEventListener("change", async () => {
    const id = capituloSelect.value;
    if (!id) return;
    await cargarActividades(id);
  });

  if (capituloSelect.value) {
    await cargarActividades(capituloSelect.value);
  }
}

function crearCapitulo() {
  window.location.href = "admin_capitulos_crear.html";
}

async function actualizarFotoPerfil(usuarioId, fotoBase64) {
  const res = await fetch(`${API_URL}/actualizar_foto.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      usuario_id: usuarioId,
      foto_base64: fotoBase64,
    }),
  });

  return await res.json();
}

async function cargarCapitulosEnSelect() {
  const select = document.getElementById("capituloSelect");
  const msg = document.getElementById("dashMsg");
  msg.textContent = "";

  const usuario = getUsuario();
  const roles = usuario?.roles || [];
  const esAdmin = roles.includes("Admin");

  const url = esAdmin
    ? `${API_URL}/capitulos.php`
    : `${API_URL}/capitulos_por_profesor.php?profesor_id=${usuario.id}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    select.innerHTML = "";

    if (data.error) {
      select.innerHTML = `<option value="">Error</option>`;
      msg.textContent = data.error;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      select.innerHTML = `<option value="">No hay capítulos asignados</option>`;
      return;
    }

    select.innerHTML = `<option value="">-- Selecciona --</option>`;

    for (const c of data) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.nombre} (${c.area || "Sin área"})`;
      select.appendChild(opt);
    }
  } catch (e) {
    console.error(e);
    select.innerHTML = `<option value="">Error</option>`;
    msg.textContent = "Error cargando capítulos";
  }
}

async function cargarActividades(capituloId) {
  const cont = document.getElementById("actividadesContainer");
  const msg = document.getElementById("dashMsg");
  msg.textContent = "";
  cont.innerHTML = "Cargando actividades...";

  try {
    const res = await fetch(
      `${API_URL}/actividades.php?capitulo_id=${capituloId}`,
    );
    const data = await res.json();

    if (data.error) {
      cont.innerHTML = "";
      msg.textContent = data.error;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      cont.innerHTML = "No hay actividades publicadas en este capítulo.";
      return;
    }

    cont.innerHTML = "";
    for (const a of data) {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <h3>${a.titulo}</h3>
          <p>${a.tipo} | ${a.lugar || "Sin lugar"} | Cupo: ${a.cupo ?? "N/A"}</p>
        </div>
        <button class="btn" data-id="${a.id}">Ver detalle</button>
      `;
      cont.appendChild(div);
    }

    // Botones "Ver detalle"
    cont.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const actividadId = btn.getAttribute("data-id");
        localStorage.setItem("actividad_id", actividadId);
        window.location.href = "actividad.html";
      });
    });
  } catch (e) {
    console.error(e);
    cont.innerHTML = "";
    msg.textContent = "Error cargando actividades";
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}

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
    msg.textContent = `Crédito otorgado`;
    await cargarInscritosConAsistencia(actividadId);
  } catch (e) {
    console.error(e);
    msg.textContent = "Error otorgando crédito";
  }
}

function initSesionesForm(form, addBtn) {
  let sessionCount = form.querySelectorAll(".session-card").length || 1;

  addBtn.addEventListener("click", () => {
    sessionCount += 1;

    const card = document.createElement("div");
    card.className = "full session-card";
    card.innerHTML = `
      <h3 class="session-title">Sesión ${sessionCount}</h3>
      <div class="form-grid">
        <div>
          <label>Título</label>
          <input id="sesTitulo${sessionCount}" type="text" />
        </div>
        <div>
          <label>Descripción</label>
          <input id="sesDescripcion${sessionCount}" type="text" />
        </div>
        <div>
          <label>Fecha inicio</label>
          <input id="sesFechaInicio${sessionCount}" type="datetime-local" />
        </div>
        <div>
          <label>Fecha fin</label>
          <input id="sesFechaFin${sessionCount}" type="datetime-local" />
        </div>
      </div>
    `;

    const actions = form.querySelector(".form-actions");
    if (actions) {
      form.insertBefore(card, actions);
    } else {
      form.appendChild(card);
    }
  });
}

async function initCapCrear() {
  const usuario = getUsuario();
  const msg1 = document.getElementById("adminMsg1");
  const msg = document.getElementById("adminMsg");
  const capForm = document.getElementById("capituloForm");

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  if (capForm) {
    capForm.addEventListener("submit", (e) => {
      e.preventDefault();
      msg1.textContent = "Capítulo creado.";
    });
  }

  //botones
  document.getElementById("backBtn2").addEventListener("click", goBack);
}
