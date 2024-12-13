document.addEventListener("DOMContentLoaded", function () {
  checkIfProfessor();
  loadQuestions(); // Cargar preguntas al cargar la página
  loadExams(); // Cargar examenes al cargar la página
  loadQuestions();
  showContentFromHash(); // Mostrar el contenido basado en el hash de la URL
});
async function checkIfProfessor() {
  const token = localStorage.getItem("token"); // Suponiendo que tienes el token guardado en localStorage

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/checkProfessor",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Enviar el token como Bearer token
        },
      }
    );

    const data = await response.json();

    if (response.status !== 200 || !data.message.includes("correcta")) {
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("rol");
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");
      redirectToLogin();
    }
  } catch (error) {
    console.error("Error al verificar si es profesor:", error);
    redirectToLogin();
  }
}

function redirectToLogin() {
  // Redirigir al login si no es profesor
  window.location.href = "./../login/index.html";
}

function showContent(contentType) {
  // Ocultar todas las secciones de contenido
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => (section.style.display = "none"));

  // Mostrar la sección seleccionada
  const sectionToShow = document.getElementById(`${contentType}-content`);
  if (sectionToShow) {
    sectionToShow.style.display = "block";
  }

  // Actualizar el hash en la URL
  window.location.hash = contentType;
}

function showContentFromHash() {
  // Obtener el hash de la URL sin el carácter "#"
  const contentType = window.location.hash.substring(1);

  // Verificar si hay un hash válido en la URL y mostrar esa sección
  if (contentType) {
    showContent(contentType);
  } else {
    // Si no hay hash, mostrar la sección por defecto
    showContent("default");
  }
}

function showQuestionForm(type) {
  // Ocultar todos los formularios
  const forms = document.querySelectorAll(".question-form");
  forms.forEach((form) => (form.style.display = "none"));

  // Mostrar el formulario correcto
  const formToShow = document.getElementById(`form-${type}`);
  if (formToShow) {
    formToShow.style.display = "block";
  }
}

function openModalForm(formId) {
  console.log(`Abriendo el formulario con ID: ${formId}`); // Depuración

  // Mostrar el modal
  const modal = document.getElementById("question-modal");
  if (modal) {
    modal.style.display = "block";
  } else {
    console.error("Modal no encontrado");
    return;
  }

  // Ocultar todos los formularios
  const forms = document.querySelectorAll(".question-form");
  forms.forEach((form) => (form.style.display = "none"));

  // Mostrar el formulario correcto
  const formToShow = document.getElementById(formId);
  if (formToShow) {
    formToShow.style.display = "block";
  } else {
    console.error(`Formulario con ID "${formId}" no encontrado.`);
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("question-modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";

  if (modalId === "assign-modal") {
    document.getElementById("exam-id").value = ""; // Vaciar el campo ID del examen
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModalForm();
  }
});

function closeModalForm() {
  const modal = document.getElementById("question-modal");
  modal.style.display = "none";
}

window.onclick = function (event) {
  // Cerrar el modal si se hace clic fuera de la ventana del modal
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block"; // Muestra el modal si existe
  } else {
    console.error(`Modal con ID "${modalId}" no encontrado.`);
  }
}

document
  .getElementById("standard-question-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevenir que el formulario recargue la página
    const respuestaCorrectaIndex = document.querySelector(
      'input[name="correcta"]:checked'
    );
    // Verificar que se haya seleccionado una respuesta correcta
    if (!respuestaCorrectaIndex) {
      alert("Por favor, selecciona la respuesta correcta.");
      return;
    }

    const valorCorrecta = respuestaCorrectaIndex.value; // Esto es el índice (1, 2, 3, 4)
    // Obtener los valores de las opciones y verificar si están vacíos
    const opciones = [
      {
        opcion: document.querySelector('input[name="opcion1"]').value.trim(),
        correcta:
          document.querySelector('input[name="correcta"]:checked').value ===
          "1",
      },
      {
        opcion: document.querySelector('input[name="opcion2"]').value.trim(),
        correcta:
          document.querySelector('input[name="correcta"]:checked').value ===
          "2",
      },
      {
        opcion: document.querySelector('input[name="opcion3"]').value.trim(),
        correcta:
          document.querySelector('input[name="correcta"]:checked').value ===
          "3",
      },
      {
        opcion: document.querySelector('input[name="opcion4"]').value.trim(),
        correcta:
          document.querySelector('input[name="correcta"]:checked').value ===
          "4",
      },
    ];

    // Verificar que no haya campos vacíos
    if (opciones.some((opcion) => !opcion.opcion)) {
      alert("Por favor, completa todas las opciones.");
      return;
    }

    // Verificar que se haya seleccionado una respuesta correcta
    if (!document.querySelector('input[name="correcta"]:checked')) {
      alert("Por favor, selecciona la respuesta correcta.");
      return;
    }

    const respuestaCorrecta = opciones.find(
      (opcion, index) => index + 1 == valorCorrecta
    )?.opcion;

    // Preparar los datos de la pregunta
    const questionData = {
      texto: document.getElementById("question-text").value.trim(),
      tipo: "estandar",
      opciones: opciones,
      respuesta_correcta: respuestaCorrecta,
      puntuacion: document.getElementById("puntuacion").value.trim(),
    };

    const token = localStorage.getItem("token"); // Obtener el token almacenado

    // Verificar que la puntuación esté presente y sea un número
    if (!questionData.puntuacion || isNaN(questionData.puntuacion)) {
      alert("Por favor, ingresa una puntuación válida.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/professor/createQuestion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ pregunta: questionData }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        closeModalForm();
        loadQuestions(); // Recargar la lista de preguntas
      } else {
        alert("Error al crear la pregunta: " + result.message);
      }
    } catch (err) {
      console.error("Error en la creación de la pregunta:", err);
    }
  });

document
  .getElementById("multi-choice-question-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevenir que el formulario recargue la página

    // Capturar opciones y estado de los checkboxes
    const opciones = [
      {
        opcion: document
          .querySelector('input[name="opcion1Multi"]')
          .value.trim(),
        correcta: document.querySelector('input[name="correcta1"]').checked, // Checkbox para opción 1
      },
      {
        opcion: document
          .querySelector('input[name="opcion2Multi"]')
          .value.trim(),
        correcta: document.querySelector('input[name="correcta2"]').checked, // Checkbox para opción 2
      },
      {
        opcion: document
          .querySelector('input[name="opcion3Multi"]')
          .value.trim(),
        correcta: document.querySelector('input[name="correcta3"]').checked, // Checkbox para opción 3
      },
      {
        opcion: document
          .querySelector('input[name="opcion4Multi"]')
          .value.trim(),
        correcta: document.querySelector('input[name="correcta4"]').checked, // Checkbox para opción 4
      },
    ];

    // Verificar que no haya campos vacíos
    const invalidOption = opciones.some((opcion) => !opcion.opcion);
    if (invalidOption) {
      alert("Por favor, completa todas las opciones.");
      return;
    }

    // Array para almacenar las respuestas correctas
    const respuestasCorrectas = [];

    // Recorrer las opciones para obtener las correctas
    opciones.forEach((opcion) => {
      if (opcion.correcta) {
        respuestasCorrectas.push(opcion.opcion); // Guardar el texto de la opción correcta
      }
    });

    // Verificar que se haya seleccionado al menos una respuesta correcta
    if (respuestasCorrectas.length === 0) {
      alert("Por favor, selecciona al menos una respuesta correcta.");
      return;
    }

    // Preparar los datos de la pregunta
    const questionData = {
      texto: document.getElementById("question-text-Multi").value.trim(),
      tipo: "multi-eleccion",
      opciones: opciones, // Las opciones con su estado de correcta o no
      respuesta_correcta: respuestasCorrectas, // Array con los índices de las respuestas correctas
      puntuacion: document.getElementById("puntuacionMulti").value,
    };

    const token = localStorage.getItem("token"); // Obtener el token almacenado

    // Verificar que la puntuación esté presente y sea un número
    if (!questionData.puntuacion || isNaN(questionData.puntuacion)) {
      alert("Por favor, ingresa una puntuación válida.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/professor/createQuestion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ pregunta: questionData }), // Enviar los datos en formato JSON
        }
      );

      const result = await response.json();

      if (response.ok) {
        closeModalForm(); // Cerrar el modal después de crear la pregunta
        loadQuestions(); // Recargar la lista de preguntas
      } else {
        alert("Error al crear la pregunta: " + result.message);
      }
    } catch (err) {
      console.error("Error en la creación de la pregunta:", err);
    }
  });

let questionsArray = []; // Array global para almacenar preguntas

async function loadQuestions() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/getListQuestions",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    const questions = await response.json();
    questionsArray = questions;

    const questionsList = document.getElementById("questions-list");
    questionsList.innerHTML = "";

    questions.forEach((question) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${question.pregunta_id}</td>
          <td>${question.texto}</td>
          <td>${question.tipo}</td>
          <td>${question.puntuacion}</td>
          <td>
            ${question.tipo !== "abierta"
          ? `<button class="details-button" onclick='viewDetails(${question.pregunta_id})'>Detalles</button>`
          : ""
        }
          </td>
          <td>
            <button class="assign-button" onclick="openAssignModal(${question.pregunta_id
        })">+ examen</button> 
          </td>
          <td>
            <span class="star-button ${question.fav ? "star-filled" : ""}" 
                  data-fav="${question.fav}" 
                  onclick="toggleFavorite(${question.pregunta_id}, this)">
              ${question.fav ? "★" : "☆"}
            </span>
          </td>
        `;
      questionsList.appendChild(row);

      const starButton = row.querySelector(".star-button");

      starButton.addEventListener("mouseenter", () => {
        starButton.textContent = "★";
      });

      starButton.addEventListener("mouseleave", () => {
        starButton.textContent = starButton.classList.contains("star-filled")
          ? "★"
          : "☆";
      });
    });
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
  }
}

async function toggleFavorite(questionId, element) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/changeFav",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ pregunta_id: questionId }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      const isFavorited = element.classList.toggle("star-filled");
      element.textContent = isFavorited ? "★" : "☆";
      loadQuestions();
    } else {
      alert("Error al cambiar el estado de favoritismo: " + result.message);
    }
  } catch (error) {
    console.error("Error al cambiar el estado de favoritismo:", error);
  }
}

function viewDetails(questionId) {
  const question = questionsArray.find((q) => q.pregunta_id === questionId);

  if (!question) {
    console.error("Pregunta no encontrada");
    return;
  }

  const detailsContent = `
      ID: ${question.pregunta_id}
      Pregunta: ${question.texto}
      Tipo: ${question.tipo}
      Opciones:
      ${question.opciones
      .map((opt) => `{ opcion: "${opt.opcion}", correcta: ${opt.correcta} }`)
      .join("\n    ")}
      Respuesta correcta: ${question.respuesta_correcta || "No definida"}
      Puntuación: ${question.puntuacion}
    `;

  document.getElementById("details-content").textContent = detailsContent;
  openModal("details-modal");
}

function openAssignModal(questionId) {
  console.log("QUEST", questionId);
  const assignForm = document.getElementById("assign-form");
  assignForm.onsubmit = function (e) {
    e.preventDefault();
    const examId = document.getElementById("exam-id").value;
    assignToExam(questionId, examId);
  };
  openModal("assign-modal");
}

// Función para asignar pregunta a un examen
async function assignToExam(questionId, examId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/assignQuestToExam",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          pregunta_id: questionId,
          examen_id: examId,
        }),
      }
    );

    const result = await response.json();
    if (response.ok) {
      alert("Pregunta asignada al examen con éxito.");
      closeModal("assign-modal");
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error al asignar la pregunta:", error);
  }
}

// Función para eliminar una pregunta
async function deleteQuestion(id) {
  const token = localStorage.getItem("token");

  if (!confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/professor/deleteQuestion/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Pregunta eliminada con éxito.");
      loadQuestions(); // Recargar la lista de preguntas
    } else {
      const result = await response.json();
      alert("Error al eliminar la pregunta: " + result.message);
    }
  } catch (error) {
    console.error("Error al eliminar la pregunta:", error);
  }
}

// Función para eliminar una pregunta
async function modifyQuestion(id) {
  const token = localStorage.getItem("token");

  if (!confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/professor/modifyQuestion/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Pregunta eliminada con éxito.");
      loadQuestions(); // Recargar la lista de preguntas
    } else {
      const result = await response.json();
      alert("Error al eliminar la pregunta: " + result.message);
    }
  } catch (error) {
    console.error("Error al eliminar la pregunta:", error);
  }
}

document
  .getElementById("open-question-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevenir que el formulario recargue la página

    // Capturar los valores del formulario
    const textoPregunta = document
      .getElementById("question-text-abierta")
      .value.trim();
    const puntuacionPregunta = document
      .getElementById("puntuacion-abierta")
      .value.trim();

    // Verificar que los campos estén completos
    if (!textoPregunta || !puntuacionPregunta || isNaN(puntuacionPregunta)) {
      alert("Por favor, completa todos los campos con valores válidos.");
      return;
    }

    // Preparar los datos de la pregunta
    const questionData = {
      texto: textoPregunta,
      tipo: "abierta", // Especificar que es una pregunta abierta
      puntuacion: puntuacionPregunta,
    };

    const token = localStorage.getItem("token"); // Obtener el token almacenado

    try {
      const response = await fetch(
        "http://localhost:3000/api/professor/createQuestion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({ pregunta: questionData }), // Enviar los datos en formato JSON
        }
      );

      const result = await response.json();

      if (response.ok) {
        closeModalForm(); // Cerrar el modal después de crear la pregunta
        loadQuestions(); // Recargar la lista de preguntas
      } else {
        alert("Error al crear la pregunta: " + result.message);
      }
    } catch (err) {
      console.error("Error en la creación de la pregunta:", err);
    }
  });

document
  .getElementById("create-exam-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevenir que el formulario recargue la página

    // Obtener los valores del formulario
    const examName = document.getElementById("examName").value;
    const examDateInicio = document.getElementById("examDateInicio").value;
    const examDateFin = document.getElementById("examDateFin").value;
    const examDuration = document.getElementById("examDuration").value;
    const autocorreccion = document.getElementById("autocorreccion").value;

    // Verificar que se han proporcionado todos los valores
    if (
      !examName ||
      !examDateInicio ||
      !examDateFin ||
      !examDuration ||
      !autocorreccion
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    const timestampIni = examDateInicio.toLocaleString("en-US", { timeZone: "Europe/Madrid" }); // Cambia "Europe/Madrid" por tu zona horaria
    const timestampFin = examDateFin.toLocaleString("en-US", { timeZone: "Europe/Madrid" }); // Cambia "Europe/Madrid" por tu zona horaria
    const examDurationInMinutes = convertirDuracionEnTiempo(examDuration);
    // Crear el cuerpo de la petición
    const examen = {
      nombre: examName,
      duracion: examDurationInMinutes,
      fecha_ini: timestampIni,
      fecha_fin: timestampFin,
      autocorregir: autocorreccion,
    };

    try {
      // Realizar la petición a la API para crear el examen
      const token = localStorage.getItem("token"); // Obtener el token almacenado
      const response = await fetch(
        "http://localhost:3000/api/professor/createExam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`, // Autenticación con el token
          },
          body: JSON.stringify({ examen: examen }),
        }
      );

      const result = await response.json();
      // Verificar la respuesta
      if (response.ok) {
        alert("Examen creado correctamente.");
        // Aquí puedes realizar acciones adicionales si es necesario
        const modal = document.getElementById("create-exam-modal");
        modal.style.display = "none";

        // Recargar la lista de exámenes
        loadExams();
      } else {
        alert("Error al crear el examen: " + result.message);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error en la conexión con el servidor.");
    }
  });

function convertirDuracionEnTiempo(minutos) {
  const horas = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const minutosRestantes = (minutos % 60).toString().padStart(2, "0");
  return `${horas}:${minutosRestantes}:00`; // Formato HH:MM:SS
}

window.onload = function () {
  // Obtener la fecha y hora actuales
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // Enero es 0!
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  // Formatear la fecha y hora para el input de tipo datetime-local
  const formattedDateTime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  // Asignar la fecha y hora actual al campo de tipo datetime-local
  document.getElementById("examDateInicio").value = formattedDateTime;
  document.getElementById("examDateFin").value = formattedDateTime;
};

const examDateInicioInput = document.getElementById("examDateInicio");
const examDateFinInput = document.getElementById("examDateFin");
const examDurationInput = document.getElementById("examDuration");
// Función para calcular la duración en minutos
const calcularDuracion = () => {
  const fechaInicio = examDateInicioInput.value;
  const fechaFin = examDateFinInput.value;

  // Asegurarse de que ambas fechas estén llenas
  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Calcular la diferencia en milisegundos
    const diferenciaEnMilisegundos = fin - inicio;

    // Convertir la diferencia a minutos
    const diferenciaEnMinutos = Math.floor(
      diferenciaEnMilisegundos / (1000 * 60)
    );

    // Asignar la diferencia en minutos al campo de duración
    examDurationInput.value =
      diferenciaEnMinutos >= 0 ? diferenciaEnMinutos : 0;
  }
};

// Agregar eventos para calcular la duración cuando cambien las fechas
examDateInicioInput.addEventListener("change", calcularDuracion);
examDateFinInput.addEventListener("change", calcularDuracion);

document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.clear(); // Limpiar el localStorage
  window.location.href = "./../login/index.html"; // Redirigir a la página de inicio de sesión
});

async function loadExams() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/getListExams",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Enviar el token
        },
      }
    );

    const exams = await response.json();
    const examsList = document.getElementById("exams-list");

    examsList.innerHTML = ""; // Limpiar la lista antes de agregar nuevas filas
    exams.forEach((exam) => {
      const row = document.createElement("tr");

      // Asignar el atributo data-id con el id del examen
      row.setAttribute("data-id", exam.examen_id);
      row.setAttribute("data-nombre", exam.nombre);
      row.setAttribute("data-duracion", exam.duracion);
      row.setAttribute("data-fecha-ini", exam.fecha_ini);
      row.setAttribute("data-fecha-fin", exam.fecha_fin);
      row.setAttribute("data-autocorregir", exam.autocorregir);

      // Crear las celdas con la información del examen
      row.innerHTML = `
        <td>${exam.examen_id}</td>
        <td>${exam.nombre}</td>
        <td>${exam.fecha_ini}</td>
        <td>${exam.fecha_fin}</td>
        <td>${exam.duracion}</td>
        <td>${exam.autocorregir}</td>
       
      `;

      examsList.appendChild(row);
    });
    addExamRowClickListeners();
  } catch (error) {
    console.error("Error al cargar los exámenes:", error);
  }
}
// Función para modificar examen
function modifyExam(examId) {
  // Implementar lógica para modificar examen
  alert(`Modificando examen con ID: ${examId}`);
}

// Función para eliminar examen
async function deleteExam(examId) {
  const token = localStorage.getItem("token");

  const confirmation = confirm(
    `¿Estás seguro de que deseas eliminar el examen con ID: ${examId}?`
  );
  if (!confirmation) return; // Salir si el usuario cancela

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/deleteExam",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Enviar el token
        },
        body: JSON.stringify({ identificador: examId }), // Enviar el ID del examen
      }
    );

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      loadExams(); // Recargar la lista de exámenes después de la eliminación
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error al eliminar el examen:", error);
    alert("Error en el servidor. No se pudo eliminar el examen.");
  }
}
//funcion para que, al clickar muestre la informacion del examen
function addExamRowClickListeners() {
  const rows = document.querySelectorAll("#exams-table tbody tr");
  rows.forEach((row) => {
    row.addEventListener("click", function () {
      const examId = this.getAttribute("data-id"); // Obtener el ID del examen
      showExamModal(examId);
    });
  });
}

async function showExamModal(examen_id) {
  const modal = document.getElementById("exam-details-modal");
  const detailsContainer = document.getElementById("exam-details");
  const token = localStorage.getItem("token");

  if (!examen_id || !token) {
    console.error("Faltan el ID del examen o el token de autenticación");
    alert("Faltan el ID del examen o el token de autenticación");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/getExamInfo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          examen_id: examen_id,
        }),
      }
    );
    const result = await response.json();

    if (response.ok) {
      detailsContainer.innerHTML = `
      <h2>Detalles del Examen</h2>
      <br>
      <label for="ID">ID: ${result.detalles.examen_id}</label>
      <br>
      <label for="Nombre">Nombre: ${result.detalles.nombre}</label>
      <br>
      <label for="Duracion">Duración: ${result.detalles.duracion}</label>
      <br>
      <label for="Fecha_ini">Fecha de Inicio: ${result.detalles.fecha_ini}</label>
      <br>
      <label for="Fecha_fin">Fecha de Fin: ${result.detalles.fecha_fin}</label>
      <br>
      <label for="autoc">Autocorrección: ${result.detalles.autocorregir}</label>
      <br><br>
      <h2>Clonar examen (solo características)</h2>
      <button id="clone-exam-btn">Clonar</button>
      <br><br>
      <h2>Preguntas del examen</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Texto</th>
            <th>Tipo</th>
            <th>Puntuación</th>
          </tr>
        </thead>
        <tbody id="exam-questions-list"></tbody>
      </table>
      <br><br>
      <h2>Notas de los Alumnos</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody id="exam-notes-list"></tbody>
      </table>
      <br>
      <h2>Asignar Examen a Alumno</h2>
      <label for="student-search">Seleccione ID de Alumno para agregar:</label>
      <input type="text" id="student-search" placeholder="Escribe el ID del alumno" />
      <button onclick="addExamToStudent(${examen_id})">Agregar</button>
      <br><br>
      <div id="student-search-results"></div>
      <br><br>
    `;

      // Obtener el contenedor para las preguntas
      const questionsList = document.getElementById("exam-questions-list");

      // Agregar las preguntas a la tabla
      result.preguntas.forEach((pregunta) => {
        const row = document.createElement("tr");

        // Crear celdas para cada propiedad de la pregunta
        row.innerHTML = `
        <td>${pregunta.pregunta_id}</td>
        <td>${pregunta.texto}</td>
        <td>${pregunta.tipo}</td>
        <td>${pregunta.puntuacion}</td>
      `;

        // Agregar la fila al contenedor de preguntas
        questionsList.appendChild(row);
      });

      // Obtener el contenedor para las notas
      const notesList = document.getElementById("exam-notes-list");

      // Agregar las notas a la tabla
      result.notas.forEach((nota) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${nota.alumno.nombre}</td>
        <td>${nota.alumno.email}</td>
        <td>${nota.nota}</td>
      `;
        notesList.appendChild(row);
      });

      // Asignar el evento al botón de clonar después de que se haya insertado el HTML
      const cloneExamBtn = document.getElementById("clone-exam-btn");
      cloneExamBtn.addEventListener("click", () => {
        cloneExam(
          result.detalles.nombre,
          result.detalles.duracion,
          result.detalles.fecha_ini,
          result.detalles.fecha_fin,
          result.detalles.autocorregir
        );
      });
    } else {
      alert("Error al obtener la información del examen: " + result.message);
      console.error("Error al obtener la información del examen:", result.message);
    }
  } catch (error) {
    alert("Error en la solicitud: " + error);
    console.error("Error en la solicitud:", error);
  }

  modal.style.display = "block";
}


// Función para clonar un examen

async function cloneExam(examName, examDurationInMinutes, timestampIni, timestampFin, autocorreccion) {
  alert("Clonando examen con nombre: " + examName);
  console.log(examName, examDurationInMinutes, timestampIni, timestampFin, autocorreccion);
  //añadir alert de confirmacion de clonacion
  const confirmation = confirm(
    `¿Estás seguro de que deseas clonar el examen con nombre: ${examName}?`
  );
  if (!confirmation) return; // Salir si el usuario cancela
  const examen = {
    nombre: examName,
    duracion: examDurationInMinutes,
    fecha_ini: timestampIni,
    fecha_fin: timestampFin,
    autocorregir: autocorreccion,
  };

  try {
    // Realizar la petición a la API para crear el examen
    const token = localStorage.getItem("token"); // Obtener el token almacenado
    const response = await fetch(
      "http://localhost:3000/api/professor/createExam",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Autenticación con el token
        },
        body: JSON.stringify({ examen: examen }),
      }
    );

    const result = await response.json();
    // Verificar la respuesta
    if (response.ok) {
      alert("Examen clonado correctamente.");
      // Aquí puedes realizar acciones adicionales si es necesario
      const modal = document.getElementById("create-exam-modal");
      modal.style.display = "none";

      // Recargar la lista de exámenes
      loadExams();
    } else {
      alert("Error al crear el examen: " + result.message);
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    alert("Error en la conexión con el servidor.");
  }
};

// Función para agregar un examen a un estudiante existente
async function addExamToStudent(examen_id) {
  const alumno_id = document.getElementById("student-search").value;
  const token = localStorage.getItem("token");
  const searchResultsDiv = document.getElementById("student-search-results");

  if (!alumno_id || !token || !examen_id) {
    console.error(
      "Faltan el ID del estudiante, token de autenticación o ID del examen"
    );
    searchResultsDiv.textContent =
      "Faltan el ID del estudiante, token de autenticación o ID del examen";
    return;
  }

  try {
    // Asignación directa del examen al estudiante

    const response = await fetch(
      "http://localhost:3000/api/professor/addStudentToExam",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          examen_id: examen_id,
          alumno_id: alumno_id,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("Alumno asignado al examen con éxito");
      searchResultsDiv.textContent = result.message;
    } else {
      console.error("Error al asignar el alumno al examen:", result.message);
      searchResultsDiv.textContent = result.message;
    }
  } catch (error) {
    console.error("Error en el proceso:", error);
    searchResultsDiv.textContent = "Error en el proceso: " + error;
  }
}

let showOnlyFavorites = false;

function toggleFavoriteFilter() {
  showOnlyFavorites = !showOnlyFavorites;
  loadQuestions();

  const favoriteFilterButton = document.getElementById("favoriteFilterButton");
  console.log("Botón encontrado:", favoriteFilterButton);

  if (showOnlyFavorites) {
    console.log("Activando estilo de favoritas");
    favoriteFilterButton.classList.add("favorite-button-active");
  } else {
    console.log("Desactivando estilo de favoritas");
    favoriteFilterButton.classList.remove("favorite-button-active");
  }
}

async function loadQuestions() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:3000/api/professor/getListQuestions",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    let questions = await response.json();
    questionsArray = questions;

    if (showOnlyFavorites) {
      questions = questions.filter((question) => question.fav === true);
    }

    const questionsList = document.getElementById("questions-list");
    questionsList.innerHTML = "";

    questions.forEach((question) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${question.pregunta_id}</td>
          <td>${question.texto}</td>
          <td>${question.tipo}</td>
          <td>${question.puntuacion}</td>
          <td>
            ${question.tipo !== "abierta"
          ? `<button class="details-button" onclick='viewDetails(${question.pregunta_id})'>Detalles</button>`
          : ""
        }
          </td>
          <td>
            <button class="assign-button" onclick="openAssignModal(${question.pregunta_id
        })">+ examen</button> 
          </td>
          <td>
            <span class="star-button ${question.fav ? "star-filled" : ""}" 
                  data-fav="${question.fav}" 
                  onclick="toggleFavorite(${question.pregunta_id}, this)">
              ${question.fav ? "★" : "☆"}
            </span>
          </td>
        `;
      questionsList.appendChild(row);

      const starButton = row.querySelector(".star-button");

      starButton.addEventListener("mouseenter", () => {
        starButton.textContent = "★";
      });

      starButton.addEventListener("mouseleave", () => {
        starButton.textContent = starButton.classList.contains("star-filled")
          ? "★"
          : "☆";
      });
    });
  } catch (error) {
    console.error("Error al cargar las preguntas:", error);
  }
}
