document.addEventListener("DOMContentLoaded", () => {
  const crearCap = document.getElementById("capituloForm");
  if (crearCap) {
    initCapCrear();
  }

  const addSesionBtn = document.getElementById("addSesionBtn");
  const dltSesionBtn = document.getElementById("dltSesionBtn");
  const actividadForm = document.getElementById("actividadForm");

  if (actividadForm && addSesionBtn && dltSesionBtn) {
    initSesionesForm(actividadForm, addSesionBtn, dltSesionBtn);
  }
});

async function initCapCrear() {
  const usuario = getUsuario();
  const msg1 = document.getElementById("adminMsg1");
  const msg2 = document.getElementById("adminMsg2");
  const msgAl = document.getElementById("adminMsgAl");
  const msgAl2 = document.getElementById("adminMsgAl2");
  const msg = document.getElementById("adminMsg");
  const adminMsgAct = document.getElementById("adminMsgAct");
  const capForm = document.getElementById("capituloForm");
  const encargadoForm = document.getElementById("encargadoForm");
  const alumnosForm = document.getElementById("alumnosForm");
  const asignarAlumnoForm = document.getElementById("asignarAlumnoForm");
  const actividadForm = document.getElementById("actividadForm");
  const adminCapitulo = document.getElementById("adminCapitulo");
  const adminActividad = document.getElementById("adminActividad");
  const adminRefreshBtn = document.getElementById("adminRefreshBtn");
  const adminEditWrap = document.getElementById("adminEditWrap");
  const adminActividadForm = document.getElementById("adminActividadForm");
  const adminDeleteActividad = document.getElementById("adminDeleteActividad");
  const adminSesionesList = document.getElementById("adminSesionesList");
  const adminNuevaSesionTitulo = document.getElementById(
    "adminNuevaSesionTitulo",
  );
  const adminNuevaSesionDescripcion = document.getElementById(
    "adminNuevaSesionDescripcion",
  );
  const adminNuevaSesionInicio = document.getElementById(
    "adminNuevaSesionInicio",
  );
  const adminNuevaSesionFin = document.getElementById("adminNuevaSesionFin");
  const adminAddSesionBtn = document.getElementById("adminAddSesionBtn");

  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  await cargarCapitulosSelectAdmin("encCapitulo");
  await cargarProfesoresSelect("encProfesor");
  await cargarCapitulosSelectAdmin("selectCapAl");
  await cargarCapitulosSelectAdmin("capituloExistente");
  await cargarAlumnosSelect("alumnoExistente");
  await cargarCapitulosSelectAdmin("actCapitulo");
  await cargarCapitulosSelectAdmin("adminCapitulo");

  if (capForm) {
    capForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("capNombre").value.trim();
      const clave = document.getElementById("capClave").value.trim();
      const area = document.getElementById("capArea").value.trim();
      const color = document.getElementById("capColor").value.trim();
      const descripcion = document
        .getElementById("capDescripcion")
        .value.trim();

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
            asesor_id: encProfesor,
          }),
        });

        const data = await res.json();
        if (data.error) {
          msg2.textContent = data.error;
          return;
        }

        msg2.style.color = "green";
        msg2.textContent = "Encargado asignado.";
      } catch (error) {
        console.error(error);
        msg2.textContent = "Error al asignar encargado.";
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
        msgAl.textContent = "Miembro creado y asignado.";
        alumnosForm.reset();
        await cargarAlumnosSelect("alumnoExistente");
      } catch (error) {
        console.error(error);
        msgAl.style.color = "red";
        msgAl.textContent = "Error al crear miembro.";
      }
    });
  }

  if (asignarAlumnoForm) {
    asignarAlumnoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const miembro_id = document.getElementById("alumnoExistente").value;
      const capitulo_id = document.getElementById("capituloExistente").value;

      try {
        const res = await fetch(`${API_URL}/asignar_alumno.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            miembro_id,
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
        msgAl2.textContent = "Miembro asignado.";
      } catch (error) {
        console.error(error);
        msgAl2.style.color = "red";
        msgAl2.textContent = "Error al asignar miembro.";
      }
    });
  }

  if (actividadForm) {
    aplicarMinFechas(actividadForm);

    const tipoSelect = document.getElementById("actTipo");
    const addSesionBtn = document.getElementById("addSesionBtn");
    const dltSesionBtn = document.getElementById("dltSesionBtn");

    const syncSesionConferencia = () => {
      if (!tipoSelect || tipoSelect.value !== "Conferencia") return;
      const sesTitulo = actividadForm.querySelector('input[id^="sesTitulo"]');
      const sesDescripcion = actividadForm.querySelector(
        'input[id^="sesDescripcion"]',
      );
      const sesFechaInicio = actividadForm.querySelector(
        'input[id^="sesFechaInicio"]',
      );
      const sesFechaFin = actividadForm.querySelector(
        'input[id^="sesFechaFin"]',
      );

      if (sesTitulo) {
        sesTitulo.value = document.getElementById("actTitulo").value.trim();
      }
      if (sesDescripcion) {
        sesDescripcion.value = document
          .getElementById("actividadDescripcion")
          .value.trim();
      }
      if (sesFechaInicio) {
        sesFechaInicio.value = document.getElementById("actFechaInicio").value;
      }
      if (sesFechaFin) {
        sesFechaFin.value = document.getElementById("actFechaFin").value;
      }
    };

    const setSesionReadonly = (readonly) => {
      const fields = [
        actividadForm.querySelector('input[id^="sesTitulo"]'),
        actividadForm.querySelector('input[id^="sesDescripcion"]'),
        actividadForm.querySelector('input[id^="sesFechaInicio"]'),
        actividadForm.querySelector('input[id^="sesFechaFin"]'),
      ];
      fields.forEach((field) => {
        if (field) field.readOnly = readonly;
      });
    };

    const asegurarSesionUnica = () => {
      const tarjetas = actividadForm.querySelectorAll(".session-card");
      tarjetas.forEach((tarjeta, idx) => {
        if (idx > 0) tarjeta.remove();
      });
    };

    const aplicarModoConferencia = () => {
      const esConferencia = tipoSelect && tipoSelect.value === "Conferencia";
      if (addSesionBtn) addSesionBtn.disabled = esConferencia;
      if (dltSesionBtn) dltSesionBtn.disabled = esConferencia;
      setSesionReadonly(esConferencia);
      if (esConferencia) {
        asegurarSesionUnica();
        syncSesionConferencia();
      }
    };

    if (tipoSelect) {
      tipoSelect.addEventListener("change", aplicarModoConferencia);
    }

    [
      "actTitulo",
      "actividadDescripcion",
      "actFechaInicio",
      "actFechaFin",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", syncSesionConferencia);
      el.addEventListener("change", syncSesionConferencia);
    });

    aplicarModoConferencia();

    actividadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const capitulo_id = document.getElementById("actCapitulo").value;
      const tipo = document.getElementById("actTipo").value;
      const titulo = document.getElementById("actTitulo").value.trim();
      const descripcion = document
        .getElementById("actividadDescripcion")
        .value.trim();
      const lugar = document.getElementById("actLugar").value.trim();
      const cupo = document.getElementById("actCupo").value;
      const otorga_creditos = document.getElementById("actOtorgaCreditos")
        .checked
        ? 1
        : 0;
      const creditos = otorga_creditos
        ? document.getElementById("actCreditos").value
        : 0;
      const fecha_inicio = document.getElementById("actFechaInicio").value;
      const fecha_fin = document.getElementById("actFechaFin").value;

      const sesiones = Array.from(
        actividadForm.querySelectorAll(".session-card"),
      ).map((card) => ({
        titulo: card.querySelector('input[id^="sesTitulo"]')?.value.trim(),
        descripcion: card
          .querySelector('input[id^="sesDescripcion"]')
          ?.value.trim(),
        fecha_inicio: card.querySelector('input[id^="sesFechaInicio"]')?.value,
        fecha_fin: card.querySelector('input[id^="sesFechaFin"]')?.value,
      }));

      const errores = validarActividadYsesiones(actividadForm);
      if (errores.length > 0) {
        msg.style.color = "red";
        msg.textContent = errores.join(" | ");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/crear_actividad.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            capitulo_id,
            tipo,
            titulo,
            descripcion,
            lugar,
            cupo,
            otorga_creditos,
            creditos,
            fecha_inicio,
            fecha_fin,
            creado_por: usuario.id,
            sesiones: JSON.stringify(sesiones),
          }),
        });

        const data = await res.json();
        if (data.error) {
          msg.style.color = "red";
          msg.textContent = data.error;
          return;
        }

        msg.style.color = "green";
        msg.textContent = "Actividad creada.";
        limpiarActividadForm(actividadForm);
      } catch (error) {
        console.error(error);
        msg.style.color = "red";
        msg.textContent = "Error al crear actividad.";
      }
    });
  }

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const showTab = (id) => {
    tabPanels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === id);
    });
  };

  if (tabButtons.length > 0) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.dataset.tab));
    });
    showTab("tabCrear");
  }

  const formatDatetimeLocal = (valor) => {
    if (!valor) return "";
    return valor.replace(" ", "T").slice(0, 16);
  };

  const escapeAttr = (valor) => {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/\"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const adminSetMsg = (texto, color = "red") => {
    if (!adminMsgAct) return;
    adminMsgAct.style.color = color;
    adminMsgAct.textContent = texto;
  };

  const limpiarAdmin = () => {
    if (adminActividad) {
      adminActividad.innerHTML = '<option value="">-- Selecciona --</option>';
    }
    if (adminEditWrap) adminEditWrap.classList.add("hidden");
  };

  const cargarActividadesAdmin = async (forzar = false) => {
    if (!adminCapitulo || !adminActividad) return;
    const capituloId = adminCapitulo.value;
    if (!capituloId) {
      if (forzar) adminSetMsg("Selecciona un capítulo.");
      limpiarAdmin();
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/actividades_admin.php?capitulo_id=${capituloId}`,
      );
      const data = await res.json();

      adminActividad.innerHTML = '<option value="">-- Selecciona --</option>';

      if (data.error) {
        adminSetMsg(data.error);
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        adminSetMsg("No hay actividades para este capítulo.", "#666");
        limpiarAdmin();
        return;
      }

      data.forEach((act) => {
        const opt = document.createElement("option");
        opt.value = act.id;
        opt.textContent = `${act.titulo} (${act.tipo})`;
        adminActividad.appendChild(opt);
      });

      adminSetMsg("", "#666");
    } catch (err) {
      console.error(err);
      adminSetMsg("Error al cargar actividades.");
    }
  };

  const renderSesionesAdmin = (sesiones = []) => {
    if (!adminSesionesList) return;
    adminSesionesList.innerHTML = "";

    sesiones.forEach((sesion, idx) => {
      const card = document.createElement("div");
      card.className = "session-card";
      card.innerHTML = `
        <h4 class="session-title">Sesión ${idx + 1}</h4>
        <div class="form-grid">
          <div>
            <label>Título</label>
            <input type="text" value="${escapeAttr(
              sesion.titulo,
            )}" data-field="titulo" />
          </div>
          <div>
            <label>Descripción</label>
            <input type="text" value="${escapeAttr(
              sesion.descripcion,
            )}" data-field="descripcion" />
          </div>
          <div>
            <label>Fecha inicio</label>
            <input type="datetime-local" value="${formatDatetimeLocal(
              sesion.fecha_inicio,
            )}" data-field="fecha_inicio" />
          </div>
          <div>
            <label>Fecha fin</label>
            <input type="datetime-local" value="${formatDatetimeLocal(
              sesion.fecha_fin,
            )}" data-field="fecha_fin" />
          </div>
        </div><br>
        <div class="session-actions">
          <button type="button" class="btn-secondary" data-action="save">Guardar sesión</button>
          <button type="button" class="btn_detele" data-action="delete">Eliminar sesión</button>
        </div>
      `;

      const saveBtn = card.querySelector('[data-action="save"]');
      const deleteBtn = card.querySelector('[data-action="delete"]');

      if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
          const payload = {
            sesion_id: sesion.id,
            titulo: card.querySelector('[data-field="titulo"]').value.trim(),
            descripcion: card
              .querySelector('[data-field="descripcion"]')
              .value.trim(),
            fecha_inicio: card.querySelector('[data-field="fecha_inicio"]')
              .value,
            fecha_fin: card.querySelector('[data-field="fecha_fin"]').value,
          };

          const errores = [];
          validarRangoFechas(
            payload.fecha_inicio,
            payload.fecha_fin,
            "Sesión",
            errores,
          );
          if (errores.length > 0) {
            adminSetMsg(errores.join(" | "));
            return;
          }

          try {
            const res = await fetch(`${API_URL}/actualizar_sesion.php`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams(payload),
            });
            const data = await res.json();
            if (data.error) {
              adminSetMsg(data.error);
              return;
            }
            adminSetMsg("Sesión actualizada.", "green");
          } catch (err) {
            console.error(err);
            adminSetMsg("Error al actualizar sesión.");
          }
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar esta sesión?")) return;
          try {
            const res = await fetch(`${API_URL}/eliminar_sesion.php`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ sesion_id: sesion.id }),
            });
            const data = await res.json();
            if (data.error) {
              adminSetMsg(data.error);
              return;
            }
            adminSetMsg("Sesión eliminada.", "green");
            cargarDetalleActividad(adminActividad.value);
          } catch (err) {
            console.error(err);
            adminSetMsg("Error al eliminar sesión.");
          }
        });
      }

      aplicarMinFechas(card);
      adminSesionesList.appendChild(card);
    });
  };

  const syncNuevaSesionDefaults = (force = false) => {
    if (
      !adminNuevaSesionTitulo ||
      !adminNuevaSesionDescripcion ||
      !adminNuevaSesionInicio ||
      !adminNuevaSesionFin
    ) {
      return;
    }

    const titulo = document.getElementById("adminTitulo")?.value?.trim() ?? "";
    const descripcion =
      document.getElementById("adminDescripcion")?.value?.trim() ?? "";
    const fechaInicio =
      document.getElementById("adminFechaInicio")?.value ?? "";
    const fechaFin = document.getElementById("adminFechaFin")?.value ?? "";

    if (force || !adminNuevaSesionTitulo.value) {
      adminNuevaSesionTitulo.value = titulo;
    }
    if (force || !adminNuevaSesionDescripcion.value) {
      adminNuevaSesionDescripcion.value = descripcion;
    }
    if (force || !adminNuevaSesionInicio.value) {
      adminNuevaSesionInicio.value = fechaInicio;
    }
    if (force || !adminNuevaSesionFin.value) {
      adminNuevaSesionFin.value = fechaFin;
    }
  };

  const cargarDetalleActividad = async (actividadId) => {
    if (!actividadId || !adminActividadForm) return;
    try {
      const res = await fetch(
        `${API_URL}/actividad_detalle.php?actividad_id=${actividadId}`,
      );
      const data = await res.json();
      if (data.error) {
        adminSetMsg(data.error);
        return;
      }

      const act = data.actividad;
      adminActividadForm.dataset.actividadId = act.id;
      document.getElementById("adminTipo").value = act.tipo || "";
      document.getElementById("adminTitulo").value = act.titulo || "";
      document.getElementById("adminDescripcion").value = act.descripcion || "";
      document.getElementById("adminLugar").value = act.lugar || "";
      document.getElementById("adminCupo").value = act.cupo || "";
      document.getElementById("adminOtorgaCreditos").checked =
        Number(act.otorga_creditos) === 1;
      document.getElementById("adminCreditos").value = act.creditos || 0;
      document.getElementById("adminFechaInicio").value = formatDatetimeLocal(
        act.fecha_inicio,
      );
      document.getElementById("adminFechaFin").value = formatDatetimeLocal(
        act.fecha_fin,
      );

      if (adminEditWrap) aplicarMinFechas(adminEditWrap);
      syncNuevaSesionDefaults(true);
      renderSesionesAdmin(data.sesiones || []);
      if (adminEditWrap) adminEditWrap.classList.remove("hidden");
      adminSetMsg("", "#666");
    } catch (err) {
      console.error(err);
      adminSetMsg("Error al cargar detalle de actividad.");
    }
  };

  if (adminCapitulo) {
    adminCapitulo.addEventListener("change", () => {
      limpiarAdmin();
      cargarActividadesAdmin();
    });
  }

  if (adminRefreshBtn) {
    adminRefreshBtn.addEventListener("click", () =>
      cargarActividadesAdmin(true),
    );
  }

  if (adminActividad) {
    adminActividad.addEventListener("change", () => {
      const actividadId = adminActividad.value;
      if (!actividadId) {
        if (adminEditWrap) adminEditWrap.classList.add("hidden");
        return;
      }
      cargarDetalleActividad(actividadId);
    });
  }

  if (adminActividadForm) {
    adminActividadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const actividadId = adminActividadForm.dataset.actividadId;
      if (!actividadId) {
        adminSetMsg("Selecciona una actividad.");
        return;
      }

      const errores = [];
      validarRangoFechas(
        document.getElementById("adminFechaInicio").value,
        document.getElementById("adminFechaFin").value,
        "Actividad",
        errores,
      );
      if (errores.length > 0) {
        adminSetMsg(errores.join(" | "));
        return;
      }

      const otorga = document.getElementById("adminOtorgaCreditos").checked
        ? 1
        : 0;
      const creditos = otorga
        ? document.getElementById("adminCreditos").value
        : 0;

      try {
        const res = await fetch(`${API_URL}/actualizar_actividad.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            actividad_id: actividadId,
            tipo: document.getElementById("adminTipo").value,
            titulo: document.getElementById("adminTitulo").value.trim(),
            descripcion: document
              .getElementById("adminDescripcion")
              .value.trim(),
            lugar: document.getElementById("adminLugar").value.trim(),
            cupo: document.getElementById("adminCupo").value,
            otorga_creditos: otorga,
            creditos,
            fecha_inicio: document.getElementById("adminFechaInicio").value,
            fecha_fin: document.getElementById("adminFechaFin").value,
            actualizado_por: usuario.id,
          }),
        });
        const data = await res.json();
        if (data.error) {
          adminSetMsg(data.error);
          return;
        }
        adminSetMsg("Actividad actualizada.", "green");
        cargarActividadesAdmin();
      } catch (err) {
        console.error(err);
        adminSetMsg("Error al actualizar actividad.");
      }
    });
  }

  if (adminAddSesionBtn) {
    adminAddSesionBtn.addEventListener("click", async () => {
      const actividadId = adminActividadForm?.dataset.actividadId;
      if (!actividadId) {
        adminSetMsg("Selecciona una actividad.");
        return;
      }

      const payload = {
        actividad_id: actividadId,
        titulo: adminNuevaSesionTitulo?.value.trim() ?? "",
        descripcion: adminNuevaSesionDescripcion?.value.trim() ?? "",
        fecha_inicio: adminNuevaSesionInicio?.value ?? "",
        fecha_fin: adminNuevaSesionFin?.value ?? "",
      };

      if (!payload.fecha_inicio || !payload.fecha_fin) {
        adminSetMsg("Fecha inicio y fin son obligatorias.");
        return;
      }

      const errores = [];
      validarRangoFechas(
        payload.fecha_inicio,
        payload.fecha_fin,
        "Nueva sesión",
        errores,
      );
      if (errores.length > 0) {
        adminSetMsg(errores.join(" | "));
        return;
      }

      try {
        const res = await fetch(`${API_URL}/crear_sesion.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload),
        });
        const data = await res.json();
        if (data.error) {
          adminSetMsg(data.error);
          return;
        }
        adminSetMsg("Sesión agregada.", "green");
        if (adminNuevaSesionTitulo) adminNuevaSesionTitulo.value = "";
        if (adminNuevaSesionDescripcion) adminNuevaSesionDescripcion.value = "";
        if (adminNuevaSesionInicio) adminNuevaSesionInicio.value = "";
        if (adminNuevaSesionFin) adminNuevaSesionFin.value = "";
        cargarDetalleActividad(actividadId);
      } catch (err) {
        console.error(err);
        adminSetMsg("Error al agregar sesión.");
      }
    });
  }

  if (adminDeleteActividad) {
    adminDeleteActividad.addEventListener("click", async () => {
      const actividadId = adminActividadForm?.dataset.actividadId;
      if (!actividadId) {
        adminSetMsg("Selecciona una actividad.");
        return;
      }
      if (!confirm("¿Eliminar esta actividad?")) return;
      try {
        const res = await fetch(`${API_URL}/eliminar_actividad.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ actividad_id: actividadId }),
        });
        const data = await res.json();
        if (data.error) {
          adminSetMsg(data.error);
          return;
        }
        adminSetMsg("Actividad eliminada.", "green");
        limpiarAdmin();
        cargarActividadesAdmin();
      } catch (err) {
        console.error(err);
        adminSetMsg("Error al eliminar actividad.");
      }
    });
  }

  document.getElementById("backBtn2").addEventListener("click", goBack);
}

function limpiarActividadForm(form) {
  form.reset();

  const tarjetas = form.querySelectorAll(".session-card");
  tarjetas.forEach((tarjeta, idx) => {
    if (idx === 0) {
      const titulo = tarjeta.querySelector(".session-title");
      if (titulo) titulo.textContent = "Sesión 1";
      tarjeta.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
    } else {
      tarjeta.remove();
    }
  });

  aplicarMinFechas(form);
}

function minFechaHoy() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T00:00`;
}

function aplicarMinFechas(root = document) {
  const min = minFechaHoy();
  root.querySelectorAll('input[type="datetime-local"]').forEach((input) => {
    input.min = min;
  });
}

function obtenerFechaSinHora(valor) {
  if (!valor) return null;
  const partes = valor.split("T")[0].split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function fechaHoySinHora() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

function validarRangoFechas(inicioValor, finValor, etiqueta, errores) {
  const inicio = obtenerFechaSinHora(inicioValor);
  const fin = obtenerFechaSinHora(finValor);
  const hoy = fechaHoySinHora();

  if (!inicio || !fin) {
    errores.push(`${etiqueta}: fecha inicio y fin son obligatorias.`);
    return;
  }

  if (inicio < hoy) {
    errores.push(
      `${etiqueta}: la fecha de inicio no puede ser anterior a hoy.`,
    );
  }

  if (fin < inicio) {
    errores.push(
      `${etiqueta}: la fecha de fin no puede ser anterior a la fecha de inicio.`,
    );
  }
}

function validarActividadYsesiones(actividadForm) {
  const errores = [];

  const capitulo = document.getElementById("actCapitulo").value;
  const tipo = document.getElementById("actTipo").value;
  const titulo = document.getElementById("actTitulo").value.trim();
  const tituloSes = document.getElementById("sesTitulo").value.trim();
  const descripcion = document
    .getElementById("actividadDescripcion")
    .value.trim();
  const descripcionSes = document.getElementById("sesDescripcion").value.trim();
  const lugar = document.getElementById("actLugar").value.trim();
  const cupoStr = document.getElementById("actCupo").value;
  const fechaInicio = document.getElementById("actFechaInicio").value;
  const fechaInicioSes = document.getElementById("sesFechaInicio").value;
  const fechaFin = document.getElementById("actFechaFin").value;
  const fechaFinSes = document.getElementById("sesFechaFin").value;

  if (!capitulo) errores.push("Actividad: selecciona un capítulo.");
  if (!tipo) errores.push("Actividad: selecciona un tipo.");
  if (!titulo) errores.push("Actividad: el título es obligatorio.");
  if (!descripcion) errores.push("Actividad: la descripción es obligatoria.");
  if (!lugar) errores.push("Actividad: el lugar es obligatorio.");
  if (!tituloSes) errores.push("Sesión: el título es obligatorio.");
  if (!descripcionSes) errores.push("Sesión: la descripción es obligatoria.");

  const cupo = parseInt(cupoStr, 10);
  if (!cupoStr || Number.isNaN(cupo)) {
    errores.push("Actividad: el cupo es obligatorio.");
  } else if (cupo >150) {
    errores.push("Actividad: Cupo máximo de 150 alumnos.");
  }

  validarRangoFechas(fechaInicio, fechaFin, "Actividad", errores);

  const tarjetas = actividadForm.querySelectorAll(".session-card");
  if (tarjetas.length < 1) {
    errores.push("Sesiones: debe existir al menos una sesión.");
    return errores;
  }

  return errores;
}

function initSesionesForm(form, addBtn, dtlBtn) {
  let contadorSesiones = form.querySelectorAll(".session-card").length || 1;

  const actualizarTitulos = () => {
    const tarjetas = form.querySelectorAll(".session-card");
    tarjetas.forEach((tarjeta, idx) => {
      const titulo = tarjeta.querySelector(".session-title");
      if (titulo) titulo.textContent = `Sesión ${idx + 1}`;
    });
  };

  const vincularBorrado = (tarjeta) => {
    const boton = tarjeta.querySelector(".btn_detele");
    if (!boton) return;
    boton.addEventListener("click", () => {
      const tarjetas = form.querySelectorAll(".session-card");
      if (tarjetas.length <= 1) return;
      tarjeta.remove();
      contadorSesiones = form.querySelectorAll(".session-card").length;
      actualizarTitulos();
    });
  };

  form.querySelectorAll(".session-card").forEach(vincularBorrado);

  addBtn.addEventListener("click", () => {
    contadorSesiones += 1;

    const tarjeta = document.createElement("div");
    tarjeta.className = "full session-card";
    tarjeta.innerHTML = `
      <div class="sesion-div">
        <h3 class="session-title">Sesión ${contadorSesiones}</h3>
        <button type="button" class="btn_detele">Borrar</button>
      </div>
      <div class="form-grid">
        <div>
          <label>Título</label>
          <input id="sesTitulo" type="text" required/>
        </div>
        <div>
          <label>Descripción</label>
          <input id="sesDescripcion" type="text" required/>
        </div>
        <div>
          <label>Fecha inicio</label>
          <input id="sesFechaInicio" type="datetime-local" required/>
        </div>
        <div>
          <label>Fecha fin</label>
          <input id="sesFechaFin" type="datetime-local" required/>
        </div>
      </div>
    `;

    const actions = form.querySelector(".form-actions");
    if (actions) {
      form.insertBefore(tarjeta, actions);
    } else {
      form.appendChild(tarjeta);
    }

    aplicarMinFechas(tarjeta);
    vincularBorrado(tarjeta);
    actualizarTitulos();
  });

  if (dtlBtn) {
    dtlBtn.addEventListener("click", () => {
      const tarjetas = form.querySelectorAll(".session-card");
      if (tarjetas.length <= 1) return;
      tarjetas[tarjetas.length - 1].remove();
      contadorSesiones = form.querySelectorAll(".session-card").length;
      actualizarTitulos();
    });
  }
}

async function cargarCapitulosSelectAdmin(selectId) {
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
      select.innerHTML = `<option value="">Sin asesores</option>`;
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
      select.innerHTML = `<option value="">Sin miembros</option>`;
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
