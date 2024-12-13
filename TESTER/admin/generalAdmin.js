import { cargarUsuarios } from "./usersInfo.js";

// Recuperar datos del localStorage
const username = localStorage.getItem("username");
const userEmail = localStorage.getItem("email");
const userRole = localStorage.getItem("rol");
const userId = localStorage.getItem("user_id");
const userToken = localStorage.getItem("token");

// Mostrar el nombre del usuario en la página (en algún elemento con ID username)
document.getElementById("username").textContent = username || "No disponible";

// Función para verificar si el usuario es administrador
async function verificarAdmin() {
  try {
    if (!userToken) {
      console.error("No se encontró token de administrador.");
      window.location.href = "./../login/index.html"; // Redirigir si no hay token
      return;
    }

    const response = await fetch("http://localhost:3000/api/admin/checkAdmin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${userToken}`, // Enviar el token del admin
      },
    });

    const result = await response.json();
    if (response.ok) {
      console.log("Verificación de administrador exitosa");
    } else {
      console.error(
        "Error en la verificación de administrador:",
        result.message
      );
      window.location.href = "./../login/index.html"; // Redirigir si no es admin
    }
  } catch (error) {
    console.error("Error en la verificación de administrador:", error);
    window.location.href = "./../login/index.html"; // Redirigir si ocurre algún error
  }
}

// Función para buscar usuarios usando AJAX
async function buscarUsuarios(identificador) {
  try {
    if (!userToken) {
      console.error("No se encontró token de administrador.");
      return;
    }

    // Hacer la petición al backend con el identificador en la URL
    const response = await fetch(
      `http://localhost:3000/api/admin/getUser?identificador=${encodeURIComponent(
        identificador
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${userToken}`, // Enviar el token
        },
      }
    );

    const result = await response.json();
    if (response.ok) {
      console.log("Usuarios filtrados:", result.user);
      mostrarUsuarios(result.user); // Llamar la función para renderizar los usuarios
    } else {
      console.error("Error en la búsqueda de usuarios:", result.message);
      mostrarUsuarios([]); // Limpiar la tabla si hay error
    }
  } catch (error) {
    console.error("Error en la búsqueda de usuarios:", error);
  }
}

// Cargar los usuarios solo si la verificación del admin es exitosa
window.onload = async function () {
  await verificarAdmin(); // Esperar a que se complete la verificación de admin
  cargarUsuarios(); // Cargar la lista de usuarios
};

// Escuchar el input en la barra de búsqueda
document.getElementById("searchBar").addEventListener("input", function (e) {
  const searchQuery = e.target.value.trim();
  if (searchQuery.length > 0) {
    buscarUsuarios(searchQuery); // Si hay texto en el campo, realizar la búsqueda
  } else {
    cargarUsuarios(); // Si el campo está vacío, cargar todos los usuarios
  }
});

// Agregar funcionalidad de cierre de sesión
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.clear(); // Limpiar el localStorage
  window.location.href = "./../login/index.html"; // Redirigir a la página de inicio de sesión
});

// Función para mostrar usuarios en la tabla
// Función para mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = ""; // Limpiar el contenido existente

  if (usuarios.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5; // Asegúrate de que ocupe el número correcto de columnas
    td.textContent = "No se encontraron usuarios.";
    td.classList.add("no-users-found"); // Añadir una clase para que tenga el mismo estilo
    tr.appendChild(td);
    tbody.appendChild(tr);
    return; // Salir de la función si no hay usuarios
  }

  usuarios.forEach((usuario) => {
    const tr = document.createElement("tr");
    tr.classList.add("user-row"); // Aplicar la misma clase que las filas originales si la tienes

    // Columna ID
    const tdId = document.createElement("td");
    tdId.textContent = usuario.usuario_id; // Usar 'usuario_id' del backend
    tr.appendChild(tdId);

    // Columna Nombre
    const tdNombre = document.createElement("td");
    tdNombre.textContent = usuario.nombre;
    tr.appendChild(tdNombre);

    // Columna Email
    const tdEmail = document.createElement("td");
    tdEmail.textContent = usuario.email;
    tr.appendChild(tdEmail);

    // Columna Rol
    const tdRol = document.createElement("td");
    tdRol.textContent =
      parseInt(usuario.rol) === 0
        ? "Administrador"
        : parseInt(usuario.rol) === 1
        ? "Alumno"
        : "Profesor";
    tr.appendChild(tdRol);

    // Columna Opciones (Modificar y Eliminar)
    const tdAcciones = document.createElement("td");
    tdAcciones.style.textAlign = "center"; // Centrar el contenido

    // Botón Modificar
    const btnModificar = document.createElement("button");
    btnModificar.textContent = "🖉";
    btnModificar.classList.add("modify-button");
    btnModificar.addEventListener("click", () =>
      mostrarModificarUsuario(usuario)
    );

    // Añadir el botón a las acciones
    tdAcciones.appendChild(btnModificar);
    tr.appendChild(tdAcciones);

    // Añadir la fila al cuerpo de la tabla
    tbody.appendChild(tr);
  });
}

// Función para mostrar el modal de modificación (debe estar definida)
function mostrarModificarUsuario(usuario) {
  const modifyModal = document.getElementById("modify-modal");
  const modifyForm = document.getElementById("modify-form");

  // Completar los campos del formulario con los datos del usuario seleccionado
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("email").value = usuario.email;
  document.getElementById("rol").value = usuario.rol;

  // Mostrar el modal
  modifyModal.style.display = "block";

  // Escuchar el envío del formulario
  modifyForm.onsubmit = async function (event) {
    event.preventDefault();

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
      const response = await fetch(
        `http://localhost:3000/api/admin/modifyUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`, // Enviar el token
          },
          body: JSON.stringify({
            usuario_id: usuario.usuario_id, // Usar el ID del usuario
            nombre: nuevoNombre,
            email: nuevoEmail,
            rol: parseInt(nuevoRol), // Convertir a número
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Usuario modificado correctamente.");
        modifyModal.style.display = "none"; // Cerrar modal
        cargarUsuarios(); // Recargar la lista de usuarios
      } else {
        console.error("Error al modificar el usuario:", result.message);
        alert("Error al modificar el usuario: " + result.message);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error en la petición para modificar el usuario.");
    }
  };
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
//     alert("Error al eliminar el usuario.");
//   }
// }

// Exportar la función para cargar usuarios
export { cargarUsuarios };
