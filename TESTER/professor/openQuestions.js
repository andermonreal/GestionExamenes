// Función para obtener los grupos desde la API
async function obtenerGrupos() {    
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
      throw new Error("No se pudieron obtener los grupos");
    }

    const grupos = await response.json(); // Asumimos que la respuesta es un arreglo de objetos

    // Obtener el elemento del select en el HTML
    const selectGrupo = document.getElementById("grupo-select");

    // Vaciar el select (por si hay opciones previas)
    selectGrupo.innerHTML = '<option value="">Selecciona un grupo</option>';

    // Agregar cada grupo como una opción en el select
    grupos.forEach(grupo => {
      const option = document.createElement("option");
      option.value = grupo.grupo_id; // El valor de la opción es el grupo_id
      option.textContent = grupo.nombre; // El texto visible es el nombre del grupo
      selectGrupo.appendChild(option);
    });
    
  } catch (error) {
    console.error("Error al obtener los grupos:", error);
  }
}

// Función para obtener los exámenes desde la API
async function obtenerExamenes() {  
  try {
    const response = await fetch(
      `http://localhost:3000/api/professor/getListExams`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener los exámenes");
    }

    const examenes = await response.json(); // Asumimos que la respuesta es un arreglo de objetos

    // Obtener el elemento del select en el HTML
    const selectExamen = document.getElementById("examen-select");

    // Vaciar el select (por si hay opciones previas)
    selectExamen.innerHTML = '<option value="">Selecciona un examen</option>';

    // Agregar cada examen como una opción en el select
    examenes.forEach(examen => {
      const option = document.createElement("option");
      option.value = examen.examen_id; // El valor de la opción es el examen_id
      option.textContent = examen.nombre; // El texto visible es el nombre del examen
      selectExamen.appendChild(option);
    });
    
  } catch (error) {
    console.error("Error al obtener los exámenes:", error);
  }
}

// Función para cargar preguntas abiertas respondidas
async function loadOpenQuestions() {
  // Obtener los valores seleccionados de los desplegables
  const grupoSelect = document.getElementById("grupo-select");
  const examenSelect = document.getElementById("examen-select");

  const grupoId = grupoSelect.value; // ID del grupo seleccionado
  const examenId = examenSelect.value; // ID del examen seleccionado

  // Verificar que ambos valores estén seleccionados
  if (!grupoId || !examenId) {
    alert("Por favor, selecciona un grupo y un examen.");
    return;
  }

  try {
    // Hacer la solicitud a la API
    const response = await fetch(
      `http://localhost:3000/api/professor/getOpenQuestions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Asegúrate de tener el token
        },
        body: JSON.stringify({
          groupo_id: grupoId,
          examen_id: examenId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las preguntas abiertas.");
    }

    const preguntas = await response.json(); //Array de objetos

    // Obtener el elemento tbody de la tabla
    const openQuestionsList = document.getElementById("open-questions-list");

    // Vaciar la tabla antes de agregar nuevas filas
    openQuestionsList.innerHTML = "";

    // Iterar por las preguntas y añadirlas como filas a la tabla
    preguntas.forEach((pregunta) => {
      const row = document.createElement("tr");

      // Crear las celdas para la fila
      const alumnoCell = document.createElement("td");
      alumnoCell.textContent = pregunta.alumno;

      const preguntaCell = document.createElement("td");
      preguntaCell.textContent = pregunta.pregunta;

      const respuestaCell = document.createElement("td");
      respuestaCell.textContent = pregunta.respuesta;

      const puntuacionCell = document.createElement("td");
      const puntuacionInput = document.createElement("input");
      puntuacionInput.type = "number";
      puntuacionInput.min = 1;
      puntuacionInput.max = 10;
      puntuacionInput.value = pregunta.puntuacion || ""; // Si no hay puntuación, dejar vacío
      puntuacionCell.appendChild(puntuacionInput);

      const accionCell = document.createElement("td");
      const calificarButton = document.createElement("button");
      calificarButton.textContent = "Calificar";
      calificarButton.onclick = () => calificarPregunta(pregunta.pregunta_id, puntuacionInput);
      accionCell.appendChild(calificarButton);

      // Añadir las celdas a la fila
      row.appendChild(alumnoCell);
      row.appendChild(preguntaCell);
      row.appendChild(respuestaCell);
      row.appendChild(puntuacionCell);
      row.appendChild(accionCell);

      // Añadir la fila al tbody
      openQuestionsList.appendChild(row);
    });
  } catch (error) {
    console.error("Error al cargar preguntas abiertas:", error);
    alert("Hubo un error al cargar las preguntas. Por favor, inténtalo de nuevo.");
  }
}

// Función para calificar una pregunta específica
async function calificarPregunta(preguntaId, puntuacionInput) {
  const puntuacion = parseInt(puntuacionInput.value, 10);

  // Validar que la puntuación sea un número entre 1 y 10
  if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 10) {
    alert("Por favor, introduce una puntuación válida entre 1 y 10.");
    return;
  }

  try {
    // Enviar la puntuación al servidor
    const response = await fetch(
      `http://localhost:3000/api/professor/rateQuestion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // Asegúrate de tener el token
        },
        body: JSON.stringify({
          question_id: preguntaId,
          score: puntuacion,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo calificar la pregunta.");
    }

    alert("Pregunta calificada con éxito.");
  } catch (error) {
    console.error("Error al calificar la pregunta:", error);
    alert("Hubo un error al calificar la pregunta. Por favor, inténtalo de nuevo.");
  }
}

// Llamar a las funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerGrupos();
  obtenerExamenes();
});

// Asociar la función cargar preguntas al botón correspondiente
document.getElementById("btn-cargar-preguntas").addEventListener("click", loadOpenQuestions);