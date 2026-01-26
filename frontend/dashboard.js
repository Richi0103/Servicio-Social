document.addEventListener("DOMContentLoaded", () => {
  const capituloSelect = document.getElementById("capituloSelect");
  if (capituloSelect) {
    initDashboard();
  }
});

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
