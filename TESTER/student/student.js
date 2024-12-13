// Referencias a los botones y contenedores de la tabla
const btnExamenes = document.getElementById("btnExamenes");
const btnNotas = document.getElementById("btnNotas");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const token = localStorage.getItem("token");
//manejo de preguntas de examen
let preguntas = [];  // Aquí se almacenarán las preguntas
let respuestas = [];  // Aquí se almacenarán las respuestas 
let preguntasRevisar = [];  // Aquí se almacenarán las preguntas a revisar
let preguntaActual = 0;  // Índice de la pregunta actual


// Función para limpiar la tabla
const clearTable = () => {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
};

function closeModal(modalId) {

  const modal = document.getElementById(modalId);
  modal.style.display = "none";

  if (modalId === "assign-modal") {
    document.getElementById("exam-id").value = ""; // Vaciar el campo ID del examen
  }
  else if (modalId === "examModal") {
    document.getElementById("exam-details").innerHTML = "";  // Vaciar el contenido del modal
    document.getElementById("questions-details").innerHTML = "";  // Vaciar el contenido de las preguntas

    // Limpiar todas las preguntas y respuestas almacenadas
    preguntas = [];  // Limpiar preguntas
    preguntasRevisar = [];  // Limpiar preguntas a revisar
    respuestas = [];  // Limpiar respuestas
    preguntaActual = 0;  // Reiniciar el índice de la pregunta actual

    // Limpiar los estados guardados en localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('preguntaCheckbox')) {
        //localStorage.setItem(key, false);
        localStorage.removeItem(key);
      }
    });
  }
}

const populateTable = (headers, data, type) => {
  clearTable();

  // Crear cabecera
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  // Añadir una columna extra para el botón "Realizar"
  const thButton = document.createElement("th");
  thButton.textContent = "Acción";
  headerRow.appendChild(thButton);

  tableHead.appendChild(headerRow);

  // Crear filas de datos
  data.forEach((item) => {
    const row = document.createElement("tr");

    // Añadir celdas para cada header
    headers.forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = item[key] || "N/A"; // Mostrar "N/A" si el dato es nulo
      row.appendChild(cell);
    });
    if (type === 1) {//si es nota
      // Crear una celda para el botón "revisar"
      const buttonCell = document.createElement("td");
      const revisarButton = document.createElement("button");
      revisarButton.textContent = "Revisar";
      revisarButton.classList.add("revisar-btn");
      revisarButton.addEventListener("click", () => handleRevisarClick(item["examen_id"], item["nota"]));
      buttonCell.appendChild(revisarButton);
      row.appendChild(buttonCell);
    }
    else if (type === 2) {//si es examen
      // Crear una celda para el botón "Realizar"
      const buttonCell = document.createElement("td");
      const realizarButton = document.createElement("button");
      realizarButton.textContent = "Realizar";
      realizarButton.classList.add("realizar-btn");
      // Añadir el evento click al botón
      realizarButton.addEventListener("click", () => handleRealizarClick(item));
      buttonCell.appendChild(realizarButton);
      row.appendChild(buttonCell);
    }

    tableBody.appendChild(row);
  });
};

// Función para manejar el clic en el botón "Realizar"
const handleRealizarClick = (examen) => {
  // Mostrar el modal
  const modal = document.getElementById("examModal");
  modal.style.display = "block";

  // Llenar los detalles del examen en el modal
  const examDetails = document.getElementById("exam-details");
  examDetails.innerHTML = `
    <h3>${examen.examen_id}: ${examen.nombre}</h3>
    <p>Duración: ${examen.duracion} horas</p>
    <button id="start-exam-btn" class="realizar-btn" onclick="startExamBtn(${examen.examen_id})">Iniciar examen</button>
    <button class="revisar-btn" onclick="closeModal('examModal')">Cancelar</button>

  `;
};

// Función para iniciar el examen
const startExamBtn = async (examen_id) => {
  if (isNaN(examen_id)) {
    alert("El examen_id debe ser un número válido.");
    return;
  }
  const boton = document.getElementById("start-exam-btn");

  // Deshabilitar el botón
  boton.disabled = true;

  // Cambiar el texto del botón
  boton.innerText = "Examen iniciado";

  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:3000/api/student/getQuestOfExam?examen_id=" + examen_id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error al obtener preguntas:", await response.json());
      return;
    }

    preguntas = await response.json();  // Guardamos las preguntas
    iniciaRespestas();  // Inicializamos las respuestas
    //obpener iniciode tiempo


    creaBotones(examen_id);  // Creamos los botones de navegación
    mostrarPregunta();  // Mostrar la primera pregunta

  } catch (error) {
    console.error("Error en fetchQuestions:", error);
    alert("Error en fetchQuestions: " + error.message);
  }
};
const creaBotones = (examen_id) => {
  // Crear botones de navegación
  const examDetails = document.getElementById("exam-details");

  const primeraPregunta = document.createElement("button");
  primeraPregunta.textContent = "Primera";
  primeraPregunta.classList.add("realizar-btn");
  primeraPregunta.onclick = () => navegarPregunta(-preguntaActual);
  examDetails.appendChild(primeraPregunta);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Anterior";
  prevBtn.classList.add("realizar-btn");
  prevBtn.id = "prev-btn";
  prevBtn.onclick = () => navegarPregunta(-1);
  examDetails.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Siguiente";
  nextBtn.classList.add("realizar-btn");
  nextBtn.id = "next-btn";
  nextBtn.onclick = () => navegarPregunta(1);
  examDetails.appendChild(nextBtn);


  const ultimaPregunta = document.createElement("button");
  ultimaPregunta.textContent = "Última";
  ultimaPregunta.classList.add("realizar-btn");
  ultimaPregunta.onclick = () => navegarPregunta(preguntas.length - preguntaActual - 1);
  examDetails.appendChild(ultimaPregunta);


  const iraRevisadas = document.createElement("button");
  iraRevisadas.textContent = "Ir a preguntas revisadas";
  iraRevisadas.classList.add("realizar-btn");
  iraRevisadas.onclick = () => iraRevisadasClick();
  examDetails.appendChild(iraRevisadas);

  const finalizarExamen = document.createElement("button");
  finalizarExamen.textContent = "Finalizar examen";
  finalizarExamen.classList.add("realizar-btn");
  finalizarExamen.onclick = () => finalizarExamenClick(examen_id);
  examDetails.appendChild(finalizarExamen);


  examDetails.appendChild(document.createElement("br"));
  examDetails.appendChild(document.createElement("br"));

}

const iniciaRespestas = () => {
  // Inicializar las respuestas
  respuestas = Array(preguntas.length).fill(null);
  for (let i = 0; i < preguntas.length; i++) {
    respuestas[i] = {
      respuestaUsuario: [],  // Aún no hay respuesta seleccionada
      checkBox: false, // Aún no se ha marcado para revisar
      botonesEstado: preguntas[i].PREGUNTAS.opciones.map(() => false),  // Todos los botones habilitados por defecto
      botonesTexto: preguntas[i].PREGUNTAS.opciones.map(() => "Seleccionar")  // Texto de los botones
    };
  }
  const tiempoInicio = new Date();
  localStorage.setItem("tiempoInicio", tiempoInicio);
};

const mostrarPregunta = () => {
  manejarBotones();  // Actualizar la visibilidad de los botones
  const contenedor = document.getElementById("questions-details");
  const pregunta = preguntas[preguntaActual];

  // Limpiar el contenedor antes de mostrar la nueva pregunta
  contenedor.innerHTML = "";

  // Crear un checkbox
  const checkboxLabel = document.createElement("label");
  checkboxLabel.innerHTML = `
    <input type="checkbox" id="preguntaCheckbox${preguntaActual}" name="preguntaCheckbox${preguntaActual}" value="preguntaCheckbox${preguntaActual}"> 
    Marcar para revisar pregunta <br> <br>
  `;

  // Comprobar si el checkbox debe estar marcado
  const estadoCheckbox = respuestas[preguntaActual].checkBox;
  if (estadoCheckbox) {
    // Si existe el estado guardado, marcar el checkbox
    checkboxLabel.querySelector('input').checked = true;
  }

  // Añadir el evento para manejar el cambio de estado
  checkboxLabel.querySelector('input').addEventListener("change", (event) => {
    if (event.target.checked) {
      preguntasRevisar.push(preguntaActual);
      console.log(`Pregunta ${preguntaActual} añadida a las preguntas para revisar.`);
      respuestas[preguntaActual].checkBox = true;
    } else {
      const index = preguntasRevisar.indexOf(preguntaActual);
      if (index > -1) {
        preguntasRevisar.splice(index, 1);  // Eliminar la pregunta del array
        respuestas[preguntaActual].checkBox = false;
      }
    }
  });

  // Agregar el checkbox al contenedor
  contenedor.appendChild(checkboxLabel);

  // Mostrar el texto de la pregunta
  const preguntaTexto = document.createElement("h3");
  preguntaTexto.textContent = pregunta.PREGUNTAS.texto;
  contenedor.appendChild(preguntaTexto);
  if (pregunta.PREGUNTAS.tipo === "estandar") {
    // Usar radio buttons para seleccionar solo una opción
    pregunta.PREGUNTAS.opciones.forEach((opcion, index) => {
      const optionContainer = document.createElement("div");
      const label = document.createElement("label");
      label.textContent = opcion.opcion;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `pregunta-${preguntaActual}`;
      radio.id = `opcion-${index}`;
      radio.checked = respuestas[preguntaActual]?.respuestaUsuario?.[0] === opcion.opcion;
      radio.addEventListener("change", () => seleccionarOpcion(opcion.opcion, index));

      label.prepend(radio);
      optionContainer.appendChild(label);
      contenedor.appendChild(optionContainer);
    });
  }
  else if (pregunta.PREGUNTAS.tipo === "multi-eleccion") {
    // Lógica para preguntas de selección múltiple igual que arriba pero en vez de botones se usan checkboxes
    pregunta.PREGUNTAS.opciones.forEach((opcion, index) => {
      // Crear un contenedor para cada opción
      const optionContainer = document.createElement("div");

      // Crear un label para la opción
      const label = document.createElement("label");
      label.textContent = opcion.opcion;
      label.setAttribute("for", `opcion-${index}`);

      // Crear un checkbox para seleccionar la opción
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `opcion-${index}`;
      respuestas[preguntaActual].botonesEstado[index] ? checkbox.checked = true : checkbox.checked = false;
      checkbox.onclick = () => seleccionarOpcion(opcion.opcion, index);

      // Añadir el label y el checkbox al contenedor
      optionContainer.appendChild(label);
      optionContainer.appendChild(checkbox);

      // Añadir el contenedor de la opción al contenedor de preguntas
      contenedor.appendChild(optionContainer);
    });
  }

  else if (pregunta.PREGUNTAS.tipo === "abierta") {
    // Crear un contenedor para la pregunta abierta
    const optionContainer = document.createElement("div");

    // Crear un cuadro de texto (textarea) para la respuesta
    const textarea = document.createElement("textarea");
    textarea.id = "respuesta-abierta";
    textarea.rows = 4; // Ajusta el tamaño del cuadro de texto
    textarea.cols = 50; // Ajusta el tamaño del cuadro de texto

    // Crear un botón para enviar la respuesta
    const boton = document.createElement("button");
    boton.textContent = "Enviar respuesta";
    boton.classList.add("realizar-btn");
    boton.onclick = () => {
      const respuesta = textarea.value;  // Obtener el valor del cuadro de texto
      seleccionarOpcion(respuesta);  // Puedes usar 0 como índice porque solo hay una respuesta
    };

    // Añadir el label, textarea y el botón al contenedor
    optionContainer.appendChild(textarea);
    optionContainer.appendChild(boton);

    // Añadir el contenedor de la pregunta abierta al contenedor principal
    contenedor.appendChild(optionContainer);
  } else if (pregunta.PREGUNTAS.tipo === "dragdrop") {
    console.log("Lógica para preguntas drag & drop aún no implementada.");
  }

};


const manejarBotones = () => {
  // Bloquear o desbloquear el botón "Anterior"
  document.getElementById("prev-btn").disabled = preguntaActual <= 0;

  // Bloquear o desbloquear el botón "Siguiente"
  document.getElementById("next-btn").disabled = preguntaActual >= preguntas.length - 1;
};


const seleccionarOpcion = (opcion, index) => {
  const tipoPregunta = preguntas[preguntaActual].PREGUNTAS.tipo;
  // Actualizar el estado en respuestas
  if (tipoPregunta === "estandar") {
    respuestas[preguntaActual] = { respuestaUsuario: [opcion] };
  }
  else if (tipoPregunta === "multi-eleccion") {
    // Lógica para preguntas de selección múltiple
    if (respuestas[preguntaActual].botonesEstado[index]) {
      // Si la opción está seleccionada, eliminarla
      respuestas[preguntaActual].respuestaUsuario = respuestas[preguntaActual].respuestaUsuario.filter((item) => item !== opcion);

      // Desmarcar la opción
      respuestas[preguntaActual].botonesEstado[index] = false;
    } else {
      // Si la opción no está seleccionada, añadirla
      respuestas[preguntaActual].respuestaUsuario.push(opcion);

      // Marcar la opción como seleccionada
      respuestas[preguntaActual].botonesEstado[index] = true;
    }

    preguntas[preguntaActual].PREGUNTAS.opciones.forEach((_, i) => {
      const checkbox = document.getElementById(`opcion-${i}`);
      if (checkbox) {
        checkbox.checked = respuestas[preguntaActual].botonesEstado[i];  // Marcar la opción seleccionada
      }
    });
  }
  else if (tipoPregunta === "abierta") {
    console.log("Lógica para preguntas abiertas aún no implementada.");
    respuestas[preguntaActual] = {
      respuestaUsuario: [opcion],
    };

  } else if (tipoPregunta === "dragdrop") {
    console.log("Lógica para preguntas drag & drop aún no implementada.");
  }
};





const navegarPregunta = (direccion) => {
  preguntaActual += direccion;
  if (preguntaActual < 0) preguntaActual = 0;  // No permitir retroceder más allá de la primera pregunta
  if (preguntaActual >= preguntas.length) preguntaActual = preguntas.length - 1;  // No permitir avanzar más allá de la última pregunta

  mostrarPregunta(preguntaActual);  // Mostrar la nueva pregunta
};

const iraRevisadasClick = () => {
  if (preguntasRevisar.length > 0) {
    preguntaActual = preguntasRevisar[0];  // Ir a la primera pregunta para revisar
    respuestas[preguntaActual].checkBox = false;  // Desmarcar la pregunta
    preguntasRevisar.shift();  // Eliminar la pregunta del array
    alert(`Pregunta ${preguntaActual} añadida a las preguntas para revisar.`);
    mostrarPregunta();  // Mostrar la pregunta eliminada
  } else {
    alert("No hay preguntas para revisar.");
  }
};


const finalizarExamenClick = async (examen_id) => {
  const confirmacion = window.confirm("¿Seguro que deseas finalizar y enviar el examen?");
  if (!confirmacion) {
    console.log("Acción cancelada por el usuario.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // Verificar que preguntas y respuestas estén alineadas
    if (!preguntas || preguntas.length === 0) {
      alert("Error: no hay preguntas disponibles para enviar.");
      return;
    }

    if (!respuestas || respuestas.length === 0) {
      alert("Error: no hay respuestas del usuario.");
      return;
    }

    // Formatear tiempo y construir las respuestas para envío
    const formatTime = (isoString) => {
      const tiempoInicio = localStorage.getItem("tiempoInicio");
      const tiempoActual = new Date();
      const tiempoTranscurrido = new Date(tiempoActual - new Date(tiempoInicio));

      const hours = String(tiempoTranscurrido.getUTCHours()).padStart(2, "0");
      const minutes = String(tiempoTranscurrido.getUTCMinutes()).padStart(2, "0");
      const seconds = String(tiempoTranscurrido.getUTCSeconds()).padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    };
    const formatFechaHora = () => {
      const fecha = new Date();

      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11, por eso sumamos 1
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      const seconds = String(fecha.getSeconds()).padStart(2, '0');

      // Formato YYYY-MM-DD HH:MM:SS
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const respuestasUsuario = respuestas.map((respuesta, index) => {
      const pregunta = preguntas[index]; // Relacionar pregunta con su respuesta
      if (!pregunta || !pregunta.pregunta_id) {
        throw new Error(`Falta el ID para la pregunta en el índice ${index}`);
      }

      return {
        pregunta_id: pregunta.pregunta_id, // ID de la pregunta
        examen_id: examen_id, // ID del examen
        respuesta: respuesta.respuestaUsuario || null, // Respuesta del usuario (puede ser null si no respondió)
        tiempo_respuesta: formatTime(new Date()), // Tiempo desde inicio en formato HH:MM:SS
        fecha_respuesta: formatFechaHora(), // Fecha actual en formato YYYY-MM-DD
      };
    });

    // Enviar respuestas al servidor
    const response = await fetch("http://localhost:3000/api/student/sendExam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ examen: respuestasUsuario }),
    });

    // Manejo de la respuesta del servidor
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error al enviar el examen:", errorResponse);
      alert(`Error al enviar el examen: ${errorResponse.message}`);
      return;
    }

    // Confirmación de éxito
    alert("Examen enviado correctamente.");
    closeModal("examModal"); // Cierra el modal
  } catch (error) {
    console.error("Error al enviar el examen:", error);
    alert("Ocurrió un error al enviar el examen. Intenta de nuevo más tarde.");
  }
};

// Función para manejar el clic en el botón "Revisar"
const handleRevisarClick = async (examen_id, nota) => {
  if (nota == null) {
    alert("No ha realizado el examen");
  }
  else {
    const token = localStorage.getItem("token");
    let numPregunta = 0;

    try {
      const response1 = await fetch("http://localhost:3000/api/student/getExamName?examen_id=" + examen_id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!response1.ok) { throw new Error("Error en la api revisando el examen"); }
      examName = await response1.json();

      const response2 = await fetch("http://localhost:3000/api/student/getQuestionsAndAnswer?examen_id=" + examen_id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (!response2.ok) { throw new Error("Error en la api revisando el examen"); }
      preguntas = await response2.json();
    }
    catch (error) {
      alert(error);
      return;
    }

    if (preguntas.length < 1) {
      alert("No existen preguntas en el examen seleccionado");
      return;
    }
    if (preguntas[numPregunta].PREGUNTA.RESPUESTAS.length < 1) {
      alert("No existen respuestas en el examen seleccionado");
      return;
    }

    const modal_revision = document.getElementById("modalRevision");
    modal_revision.style.display = "block";
    document.getElementById("modal-revision-question").textContent = "";
    document.getElementById("modal-revision-options").textContent = "";

    function closeModal() {
      modal_revision.style.display = "none";
    }
    document.getElementById("closeModalButton").addEventListener("click", closeModal);
    document.getElementById("modal-revision-title").textContent = examName[0].nombre;
    document.getElementById("modal-revision-nota").textContent = "Nota: " + nota;

    function mostrarPregunta(numPregunta) {
      document.getElementById("modal-revision-options").textContent = "";
      const PREGUNTA = preguntas[numPregunta].PREGUNTA;
      document.getElementById("modal-revision-question").textContent = PREGUNTA.texto;

      const optionsContainer = document.getElementById("modal-revision-options");
      optionsContainer.textContent = "Opciones: "
      PREGUNTA.opciones.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.opcion;
        optionsContainer.appendChild(li);
      });

      document.getElementById("modal-revision-answer").textContent = "Tu respuesta: " + PREGUNTA.RESPUESTAS[0].respuesta;

      document.getElementById("markForReviewButton").addEventListener("click", async () => {
        try {
          const pregunta_id = preguntas[numPregunta].pregunta_id;

          const response = await fetch("http://localhost:3000/api/student/orderRevision?examen_id=" + examen_id + "&pregunta_id=" + pregunta_id, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error en la api revisando el examen");
          }
        } catch (error) {
          alert(error);
          return;
        }
      }, { once: true });
    }

    document.getElementById("prevQuestionButton").addEventListener("click", function () {
      if (numPregunta > 0) {
        numPregunta--;
        mostrarPregunta(numPregunta);
      }
    });
    document.getElementById("nextQuestionButton").addEventListener("click", function () {
      if (preguntas.length > numPregunta + 1) {
        numPregunta++;
        mostrarPregunta(numPregunta);
      }
    });

    mostrarPregunta(0);
  }
};

// Verificar si el usuario es un alumno
const verifyStudent = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/api/student/checkStudent", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "No autorizado");
      window.location.href = "/TESTER/login/index.html";
      return false;
    }

    return true; // El usuario es un alumno
  } catch (error) {
    console.error("Error verificando estudiante:", error);
    alert("Error verificando estudiante");
    return false;
  }
};

// Función para obtener y mostrar notas
const fetchNotas = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/student/getlistMarks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error al obtener notas:", await response.json());
      return;
    }

    const notas = await response.json();
    const headers = ["examen_id", "nombre", "nota", "fecha_realizacion"];
    populateTable(headers, notas, 1);
  } catch (error) {
    console.error("Error en fetchNotas:", error);
  }
};

// Función para obtener y mostrar exámenes
const fetchExamenes = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/student/listActiveExams", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error al obtener exámenes:", await response.json());
      alert("Error al obtener exámenes:", await response.json());//depuracion
      return;
    }

    const examenes = await response.json();
    const headers = ["nombre", "duracion"];
    populateTable(headers, examenes, 2);
  } catch (error) {
    console.error("Error en fetchExamenes:", error);
    alert("Error en fetchExamenes: " + error.message);//depuracion
  }
};

// Agregar funcionalidad de cierre de sesión
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.clear(); // Limpiar el localStorage
  window.location.href = "./../login/index.html"; // Redirigir a la página de inicio de sesión
});

// Asignar eventos a los botones
document.addEventListener("DOMContentLoaded", async () => {
  const isStudent = await verifyStudent();

  if (isStudent) {
    // Cargar y mostrar exámenes al hacer clic
    btnExamenes.addEventListener("click", async () => {
      await fetchExamenes();
    });

    // Cargar y mostrar notas al hacer clic
    btnNotas.addEventListener("click", async () => {
      await fetchNotas();
    });
  }
})
  ;