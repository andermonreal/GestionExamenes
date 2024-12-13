// Variables globales para el modal
const modifyModal = document.getElementById("modify-modal");
const modifyForm = document.getElementById("modify-form");
let currentUserId = null; // Guardar el ID del usuario que se está editando

// Función para mostrar el modal de modificación con los datos del usuario
function mostrarModificarUsuario(usuario) {
  currentUserId = usuario.usuario_id; // Guardar el ID del usuario a modificar
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("email").value = usuario.email;
  document.getElementById("rol").value = usuario.rol;

  modifyModal.style.display = "block"; // Mostrar modal
}

// Función para cerrar el modal
function closeModal() {
  const modifyModal = document.getElementById("modify-modal");
  modifyModal.style.display = "none";
  modifyForm.reset(); // Limpiar el formulario al cerrar
}

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

document
  .getElementById("close-modal-btn")
  .addEventListener("click", closeModal);

// Agregar un event listener para cerrar el modal si se hace clic fuera de él
window.onclick = function (event) {
  if (event.target === modifyModal) {
    closeModal();
  }
};

// Escuchar el envío del formulario del modal
modifyForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Obtener los valores del formulario
  const nuevoNombre = document.getElementById("nombre").value;
  const nuevoEmail = document.getElementById("email").value;
  const nuevoRol = document.getElementById("rol").value;

  if (!nuevoNombre || !nuevoEmail || !nuevoRol) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No se encontró token.");
      return;
    }

    // Hacer la petición a la API para modificar el usuario
    const response = await fetch(`http://localhost:3000/api/admin/modifyUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`, // Enviar el token
      },
      body: JSON.stringify({
        usuario_id: currentUserId, // Usar el ID almacenado
        nombre: nuevoNombre,
        email: nuevoEmail,
        rol: parseInt(nuevoRol), // Convertir a número
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Usuario modificado correctamente.");
      closeModal(); // Cerrar el modal
      cargarUsuarios(); // Recargar la lista de usuarios
    } else {
      console.error("Error al modificar el usuario:", result.message);
      alert("Error al modificar el usuario: " + result.message);
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    alert("Error en la petición para modificar el usuario.");
  }
});

// Función para cargar los usuarios (sin cambios)
async function cargarUsuarios() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No se encontró token.");
      return;
    }

    const response = await fetch("http://localhost:3000/api/admin/listUsers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      const usuarios = result.user;
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";

      if (usuarios.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No se encontraron usuarios.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      usuarios.forEach((usuario) => {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = usuario.usuario_id;
        tr.appendChild(tdId);

        const tdNombre = document.createElement("td");
        tdNombre.textContent = usuario.nombre;
        tr.appendChild(tdNombre);

        const tdEmail = document.createElement("td");
        tdEmail.textContent = usuario.email;
        tr.appendChild(tdEmail);

        const tdRol = document.createElement("td");
        tdRol.textContent =
          parseInt(usuario.rol) === 0
            ? "Administrador"
            : parseInt(usuario.rol) === 1
            ? "Alumno"
            : "Profesor";
        tr.appendChild(tdRol);

        const tdAcciones = document.createElement("td");
        tdAcciones.style.textAlign = "center"; // Centrar el contenido

        const btnModificar = document.createElement("button");
        btnModificar.textContent = "🖉";
        btnModificar.classList.add("modify-button");
        btnModificar.addEventListener("click", () =>
          mostrarModificarUsuario(usuario)
        ); // Modificado para mostrar modal

        // const btnEliminar = document.createElement("button");
        // btnEliminar.textContent = "Eliminar";
        // btnEliminar.classList.add("delete-button");
        // btnEliminar.addEventListener("click", () =>
        //   eliminarUsuario(usuario.usuario_id)
        // );

        // btnEliminar.style.marginLeft = "10px";

        tdAcciones.appendChild(btnModificar);
        tr.appendChild(tdAcciones);
        // tdAcciones.appendChild(btnEliminar);

        tbody.appendChild(tr);
      });
    } else {
      console.error("Error al obtener los usuarios:", result.message);
    }
  } catch (error) {
    console.error("Error en la petición:", error);
  }
}

// Función para eliminar un usuario (sin cambios)
// async function eliminarUsuario(usuario_id) {
//   const confirmacion = confirm(
//     "¿Estás seguro de que quieres eliminar este usuario?"
//   );

//   if (!confirmacion) return;

//   try {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       console.error("No se encontró token.");
//       return;
//     }

//     const response = await fetch(`http://localhost:3000/api/admin/deleteUser`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `${token}`,
//       },
//       body: JSON.stringify({
//         usuario_id: usuario_id,
//       }),
//     });

//     const result = await response.json();

//     if (response.ok) {
//       alert("Usuario eliminado correctamente.");
//       cargarUsuarios();
//     } else {
//       console.error("Error al eliminar el usuario:", result.message);
//       alert("Error al eliminar el usuario: " + result.message);
//     }
//   } catch (error) {
//     console.error("Error en la petición:", error);
//     alert("Error en la petición para eliminar el usuario.");
//   }
// }

// Exportar la función para cargar usuarios
export { cargarUsuarios };
