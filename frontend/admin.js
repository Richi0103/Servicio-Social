document.addEventListener("DOMContentLoaded", () => {
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

async function initCapCrear() {
  const usuario = getUsuario();
  const msg1 = document.getElementById("adminMsg1");
  const msg2 = document.getElementById("adminMsg2");
  const msgAl = document.getElementById("adminMsgAl");
  const msgAl2 = document.getElementById("adminMsgAl2");
  const msg = document.getElementById("adminMsg");
  const capForm = document.getElementById("capituloForm");
  const encargadoForm = document.getElementById("encargadoForm");
  const alumnosForm = document.getElementById("alumnosForm");
  const asignarAlumnoForm = document.getElementById("asignarAlumnoForm");

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  await cargarCapitulosSelectAdmin("encCapitulo");
  await cargarProfesoresSelect("encProfesor");
  await cargarCapitulosSelectAdmin("selectCapAl");
  await cargarCapitulosSelectAdmin("capituloExistente");
  await cargarAlumnosSelect("alumnoExistente");

  if (capForm) {
    capForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("capNombre").value.trim();
      const clave = document.getElementById("capClave").value.trim();
      const area = document.getElementById("capArea").value.trim();
      const color = document.getElementById("capColor").value.trim();
      const descripcion = document.getElementById("capDescripcion").value.trim();

      msg1.style.color = "#666";
      msg1.textContent = "Guardando capítulo...";

      try {
        const res = await fetch(`${API_URL}/crear_capitulo.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            nombre,
            clave,
            area,
            color,
            descripcion,
            creado_por: usuario.id,
          }),
        });

        const data = await res.json();
        if (data.error) {
          msg1.style.color = "red";
          msg1.textContent = data.error;
          return;
        }

        msg1.style.color = "green";
        msg1.textContent = "Capítulo creado.";
        capForm.reset();

        await cargarCapitulosSelectAdmin("encCapitulo");
        await cargarCapitulosSelectAdmin("selectCapAl");
        await cargarCapitulosSelectAdmin("capituloExistente");
      } catch (error) {
        console.error(error);
        msg1.style.color = "red";
        msg1.textContent = "Error al crear capítulo.";
      }
    });
  }

  if (encargadoForm) {
    encargadoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const encCapitulo = document.getElementById("encCapitulo").value;
      const encProfesor = document.getElementById("encProfesor").value;

      try {
        const res = await fetch(`${API_URL}/asignar_encargado.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            capitulo_id: encCapitulo,
            profesor_id: encProfesor,
          }),
        });

        const data = await res.json();
        if (data.error) {
          msg2.textContent = data.error;
          return;
        }

        msg2.style.color = "green";
        msg2.textContent = "Profesor asignado.";
      } catch (error) {
        console.error(error);
        msg2.textContent = "Error al asignar profesor.";
      }
    });
  }

  if (alumnosForm) {
    alumnosForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("capNombreAl").value.trim();
      const apellidos = document.getElementById("capApellidoAl").value.trim();
      const numero_control = document.getElementById("capNC").value.trim();
      const telefono = document.getElementById("capTel").value.trim();
      const email = document.getElementById("capEmail").value.trim();
      const password = document.getElementById("capPassTemp").value.trim();
      const capitulo_id = document.getElementById("selectCapAl").value;

      msgAl.style.color = "#666";
      msgAl.textContent = "Guardando alumno...";

      try {
        const res = await fetch(`${API_URL}/crear_alumno.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            nombre,
            apellidos,
            numero_control,
            telefono,
            email,
            password,
            capitulo_id,
          }),
        });

        const data = await res.json();
        if (data.error) {
          msgAl.style.color = "red";
          msgAl.textContent = data.error;
          return;
        }

        msgAl.style.color = "green";
        msgAl.textContent = "Alumno creado y asignado.";
        alumnosForm.reset();
        await cargarAlumnosSelect("alumnoExistente");
      } catch (error) {
        console.error(error);
        msgAl.style.color = "red";
        msgAl.textContent = "Error al crear alumno.";
      }
    });
  }

  if (asignarAlumnoForm) {
    asignarAlumnoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const alumno_id = document.getElementById("alumnoExistente").value;
      const capitulo_id = document.getElementById("capituloExistente").value;

      msgAl2.style.color = "#666";
      msgAl2.textContent = "Asignando alumno...";

      try {
        const res = await fetch(`${API_URL}/asignar_alumno.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            alumno_id,
            capitulo_id,
          }),
        });

        const data = await res.json();
        if (data.error) {
          msgAl2.style.color = "red";
          msgAl2.textContent = data.error;
          return;
        }

        msgAl2.style.color = "green";
        msgAl2.textContent = "Alumno asignado.";
      } catch (error) {
        console.error(error);
        msgAl2.style.color = "red";
        msgAl2.textContent = "Error al asignar alumno.";
      }
    });
  }

  //botones
  document.getElementById("backBtn2").addEventListener("click", goBack);
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

async function cargarCapitulosSelectAdmin(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch(`${API_URL}/capitulos.php`);
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

async function cargarProfesoresSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch(`${API_URL}/profesores.php`);
    const data = await res.json();

    select.innerHTML = "";

    if (data.error) {
      select.innerHTML = `<option value="">Error</option>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      select.innerHTML = `<option value="">Sin profesores</option>`;
      return;
    }

    select.innerHTML = `<option value="">-- Selecciona --</option>`;
    data.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nombre} ${p.apellidos}`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    select.innerHTML = `<option value="">Error</option>`;
  }
}

async function cargarAlumnosSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  try {
    const res = await fetch(`${API_URL}/alumnos.php`);
    const data = await res.json();

    select.innerHTML = "";

    if (data.error) {
      select.innerHTML = `<option value="">Error</option>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      select.innerHTML = `<option value="">Sin alumnos</option>`;
      return;
    }

    select.innerHTML = `<option value="">-- Selecciona --</option>`;
    data.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      const nc = a.numero_control ? ` (${a.numero_control})` : "";
      opt.textContent = `${a.nombre} ${a.apellidos}${nc}`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    select.innerHTML = `<option value="">Error</option>`;
  }
}
