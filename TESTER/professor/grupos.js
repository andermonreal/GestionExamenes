// Simulación de obtener el profesor_id, en un caso real este ID vendría de autenticación.
const token = localStorage.getItem("token"); // Asegúrate de tener el token almacenado
const profesorId = localStorage.getItem("user_id");

// Función para cargar los grupos asignados al profesor
async function cargarGrupos() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/professor/getListGroups`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los grupos.");
    }

    const grupos = await response.json();
    const gruposTableBody = document.querySelector("#gruposTable tbody");
    gruposTableBody.innerHTML = ""; // Limpia la tabla antes de rellenarla

    grupos.forEach((grupo) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = grupo.grupo_id;

      const nombreCell = document.createElement("td");
      nombreCell.textContent = grupo.nombre;

      const viewButtonCell = document.createElement("td");
      const viewButton = document.createElement("button");
      viewButton.textContent = "Ver Alumnos";
      viewButton.className = "students-button";
      viewButton.onclick = () => showGroupStudents(grupo.grupo_id);
      viewButtonCell.appendChild(viewButton);

      row.appendChild(idCell);
      row.appendChild(nombreCell);
      row.appendChild(viewButtonCell);

      gruposTableBody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los grupos.");
  }
}

async function showGroupStudents(grupoId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/professor/getListAlumnosGrupos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ grupo_id: grupoId }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los alumnos del grupo.");
    }

    const alumnos = await response.json();
    const studentsTableBody = document.getElementById("students-list");
    studentsTableBody.innerHTML = ""; // Limpia la tabla antes de llenarla

    alumnos.forEach((alumno) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = alumno.usuario_id;

      const nameCell = document.createElement("td");
      nameCell.textContent = alumno.nombre;

      const emailCell = document.createElement("td");
      emailCell.textContent = alumno.email;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(emailCell);

      studentsTableBody.appendChild(row);
    });

    // Abre el modal
    document.getElementById("students-modal").style.display = "block";
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los alumnos del grupo.");
  }
}

// Llama a la función cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  if (profesorId) {
    cargarGrupos();
  }
});

// Función para abrir un modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
  }
}

// Función para establecer el ID del profesor en el campo oculto del formulario de "Crear Grupo"
function setProfesorId() {
  const profesorIdField = document.getElementById("profesor-id");
  if (profesorIdField) {
    profesorIdField.value = profesorId; // Coloca el ID del profesor en el campo oculto
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const openModals = document.querySelectorAll(".modal");
    openModals.forEach((modal) => {
      if (modal.style.display === "block") {
        closeModal(modal.id);
      }
    });
  }
});

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// Llama a setProfesorId() cuando se abre el modal de "Crear Grupo"
document.getElementById("create-group-modal").addEventListener("click", () => {
  openModal("create-group-modal");
  setProfesorId(); // Establece el ID del profesor al abrir el modal
});

// Función para manejar el envío del formulario para crear un grupo
async function handleCreateGroup(event) {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario

  const nombreGrupo = document.getElementById("group-name").value; // Asegúrate de que coincide con el ID en el HTML

  console.log("Nombre del grupo:", nombreGrupo); // Debug
  console.log("ID del profesor:", profesorId); // Debug

  // Aquí se envían los datos a la API
  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/createNewGroup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Asegúrate de incluir el token si es necesario
        },
        body: JSON.stringify({ nombre: nombreGrupo }), // Enviar el nombre y ID del profesor
      }
    );

    if (!response.ok) {
      throw new Error("Error al crear el grupo.");
    }

    const result = await response.json();
    console.log(result);
    alert("Grupo creado exitosamente.");

    closeModal("create-group-modal"); // Cierra el modal tras el envío
    cargarGrupos(); // Recargar los grupos para reflejar los cambios
  } catch (error) {
    console.error(error);
    alert("No se pudo crear el grupo: " + error.message);
  }
}

// Event listener para cerrar el modal al hacer clic fuera del contenido
window.onclick = function (event) {
  const modals = document.getElementsByClassName("modal");
  Array.from(modals).forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};

// Función para manejar el envío del formulario de asignación de alumnos a un grupo
async function handleAssignAlumnos(event) {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario

  const alumnoIdsInput = document.getElementById("alumno-id"); // Campo de entrada de IDs de alumnos
  const grupoIdInput = document.getElementById("grupo-id"); // Campo de entrada de ID de grupo

  // Convierte la entrada en un array de objetos con la estructura deseada
  const alumnoIdsArray = alumnoIdsInput.value.split(",").map((id) => {
    return parseInt(id.trim(), 10); // Convierte a entero, no necesitamos objeto aquí
  });

  const grupoId = grupoIdInput.value;

  // Aquí se envían los datos a la API
  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/addStudentsToGroups",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ alumnos: alumnoIdsArray, grupo_id: grupoId }), // Enviar el array de IDs y el ID del grupo
      }
    );

    if (!response.ok) {
      throw new Error("Error al asignar los alumnos.");
    }

    const result = await response.json();
    console.log(result);
    alert("Alumnos asignados exitosamente.");

    // Limpiar los campos tras la asignación
    alumnoIdsInput.value = "";
    grupoIdInput.value = "";

    closeModal("assign-group-modal"); // Cierra el modal tras el envío
  } catch (error) {
    console.error(error);
    alert("No se pudieron asignar los alumnos: " + error.message);
  }
}

// Llama a la función cuando se envía el formulario de creación de grupo
document
  .getElementById("create-group-form")
  .addEventListener("submit", handleCreateGroup);

// Llama a la función cuando se envía el formulario de asignación
document
  .getElementById("assign-group-form")
  .addEventListener("submit", handleAssignAlumnos);
