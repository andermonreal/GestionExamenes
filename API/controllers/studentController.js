/* LOGICA CONTROLLER FUNCIONES DE ALUMNOS */
const { supabase } = require("../config/supabaseClient");

// Función para generar la fecha en formato "aaaa-mm-dd hh:mm:ss"
function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Mes empieza desde 0
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const verifyStudent = async (token) => {
  try {
    const { data: creds, error } = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("token", token)
      .eq("rol", 1); // Verifica si el rol es 1 (student)

    if (error) {
      console.error("Error al conectar a la base de datos:", error);
      throw new Error("Error en la conexión a la base de datos");
    }

    if (!creds || creds.length === 0) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

const checkStudent = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");
  try {
    console.log("Verificando credenciales alumno...");

    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de alumno",
      });
    }

    return res.status(200).json({
      message: "Verificacion correcta",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const sendExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen } = req.body;

  if (!token || !examen) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");
  try {
    console.log("Verificando credenciales alumno...");

    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de alumno",
      });
    }

    // Recuperar el id del alumno a partir del token
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (alumnoError || !alumnoData || alumnoData.length === 0) {
      console.error("Error al recuperar el alumno:", alumnoError);
      return res.status(500).json({
        message: "Error al verificar el alumno",
      });
    }

    const alumno_id = alumnoData[0].usuario_id;
    console.log("Verificación exitosa. Insertando respuestas del alumno");

    if (Array.isArray(examen)) {
      for (const respuesta of examen) {
        const {
          pregunta_id,
          examen_id,
          respuesta: respuestaTexto,
          tiempo_respuesta,
          fecha_respuesta,
        } = respuesta;

        const { error: insertError } = await supabase
          .from("RESPUESTAS")
          .insert([
            {
              alumno_id,
              pregunta_id,
              examen_id,
              respuesta: respuestaTexto,
              tiempo_respuesta,
              fecha_respuesta,
            },
          ]);

        if (insertError) {
          console.error("Error al insertar la respuesta:", insertError);
          return res.status(500).json({
            message: "Error al insertar las respuestas en la base de datos",
          });
        }
      }
    }
    console.log("Todas las respuestas se han insertado correctamente.");
    return res.status(201).json({ message: "Respuestas enviadas con éxito" });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getlistMarks = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos para obtener notas...");
  try {
    console.log("Verificando credenciales alumno...");

    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de alumno",
      });
    }

    // Recuperar el id del alumno a partir del token
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (alumnoError || !alumnoData || alumnoData.length === 0) {
      console.error("Error al recuperar el alumno:", alumnoError);
      return res.status(500).json({
        message: "Error al verificar el alumno",
      });
    }

    const alumno_id = alumnoData[0].usuario_id;
    console.log("Verificación exitosa. Insertando respuestas del alumno");

    // Obtener las notas del examen con el nombre del examen y la fecha de realización
    const { data: notasExamenes, error: notasError } = await supabase
      .from("EXAMEN_ALUMNOS")
      .select(
        `
        examen_id,
        nota,
        fecha_realizacion,
        EXAMENES(nombre)
      `
      )
      .eq("alumno_id", alumno_id)
      .order("fecha_realizacion", { ascending: false });

    if (notasError) {
      console.error("Error al obtener las notas:", notasError);
      return res.status(500).json({
        message: "Error al obtener las notas",
      });
    }

    return res.status(200).json(notasExamenes);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const listActiveExams = async (req, res) => {
  console.log("listActiveExams");

  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Verificar las credenciales del alumno
    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Recuperar el id del alumno a partir del token
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (alumnoError || !alumnoData || alumnoData.length === 0) {
      return res.status(500).json({ message: "Error al verificar el alumno" });
    }

    const alumno_id = alumnoData[0].usuario_id;

    // Obtener la fecha actual
    //const currentDate = new Date().toISOString();

    // Obtener la fecha y hora actual en la zona horaria de Europa/Madrid
    const currentDateSpain = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Madrid",
    });

    // Crear un objeto Date usando la fecha obtenida (ya ajustada a la zona horaria de Europa/Madrid)
    const date = new Date(currentDateSpain);

    // Función para formatear la fecha en formato ISO local (sin convertirla a UTC)
    function toLocalISOString(date) {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60000);
      return localDate.toISOString().slice(0, -1); // Elimina la "Z" al final (indicando UTC)
    }

    // Mostrar la fecha en formato ISO local (sin conversión a UTC)
    const localISO = toLocalISOString(date);
    console.log("Fecha y hora actual en Europa/Madrid:", localISO);

    // Consultar los exámenes en los que el alumno está inscrito
    const { data: examenesAlumnos, error: examenesAlumnosError } =
      await supabase
        .from("EXAMEN_ALUMNOS")
        .select("examen_id")
        .eq("alumno_id", alumno_id);

    if (examenesAlumnosError) {
      return res
        .status(500)
        .json({ message: "Error al obtener los exámenes del alumno" });
    }

    // Extraer los IDs de los exámenes
    const examenIds = examenesAlumnos.map((examen) => examen.examen_id);
    // Consultar los exámenes dentro de la fecha válida
    const { data: examenes, error: examenesError } = await supabase
      .from("EXAMENES")
      .select("examen_id, nombre, duracion")
      .in("examen_id", examenIds)
      .lte("fecha_ini", localISO) // Debe haber comenzado
      .gte("fecha_fin", localISO); // Debe estar en curso

    if (examenesError) {
      return res.status(500).json({ message: "Error al obtener los exámenes" });
    }

    res.status(200).json(examenes);
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getQuestOfExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id } = req.query;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Verificar las credenciales del alumno
    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Recuperar el id del alumno a partir del token
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (alumnoError || !alumnoData || alumnoData.length === 0) {
      return res.status(500).json({ message: "Error al verificar el alumno" });
    }

    const alumno_id = alumnoData[0].usuario_id;

    // Recuperar las preguntas del examen sin la respuesta correcta, fav, ni profesor_id
    const { data: preguntas, error: preguntasError } = await supabase
      .from("EXAMEN_PREGUNTAS")
      .select(
        `
        pregunta_id,
        PREGUNTAS (
          tipo,
          texto,
          opciones,
          puntuacion,
          pregunta_id
        )
      `
      )
      .eq("examen_id", examen_id);

    if (preguntasError) {
      console.error("Error al recuperar las preguntas:", preguntasError);
      return res.status(500).json({
        message: "Error al obtener las preguntas del examen",
      });
    }

    const preguntasFiltradas = preguntas.map((pregunta) => {
      const { respuesta_correcta, opciones, ...restoPregunta } = pregunta.PREGUNTAS;
    
      const opcionesFiltradas = opciones
        ? opciones.map((opcion) => ({
            opcion: opcion.opcion,
          }))
        : [];
    
      return {
        pregunta_id: pregunta.pregunta_id,
        PREGUNTAS: {
          tipo: pregunta.PREGUNTAS.tipo,
          texto: pregunta.PREGUNTAS.texto,
          opciones: opcionesFiltradas,
          puntuacion: pregunta.PREGUNTAS.puntuacion,
          pregunta_id: pregunta.PREGUNTAS.pregunta_id,
        },
      };
    });
    
    return res.status(200).json(preguntasFiltradas); // Aquí se corrige el nombre
    
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const correctStandardExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id, examen } = req.body;

  if (!token || !examen || !Array.isArray(examen)) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos o datos inválidos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales alumno...");
    const isStudent = await verifyStudent(token);

    if (!isStudent) {
      console.error("Verificación fallida.");
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Recuperar el id del alumno a partir del token
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (alumnoError || !alumnoData || alumnoData.length === 0) {
      console.error("Error al recuperar el alumno:", alumnoError);
      return res.status(500).json({ message: "Error al verificar el alumno" });
    }

    const alumno_id = alumnoData[0].usuario_id;
    console.log(`Alumno verificado: ${alumno_id}`);

    // Variables para cálculo de la nota
    let puntuacionObtenida = 0;
    let puntuacionTotal = 0;

    for (const respuesta of examen) {
      const { pregunta_id, respuesta: respuestaTexto } = respuesta;

      // Obtener la pregunta desde la base de datos
      const { data: preguntaData, error: preguntaError } = await supabase
        .from("PREGUNTAS")
        .select("respuesta_correcta, puntuacion, tipo")
        .eq("pregunta_id", pregunta_id)
        .maybeSingle();

      if (preguntaError) {
        console.error(
          `Error al recuperar la pregunta ${pregunta_id}:`,
          preguntaError
        );
        return res
          .status(500)
          .json({ message: "Error al verificar preguntas del examen" });
      }

      if (!preguntaData) {
        console.warn(`La pregunta con ID ${pregunta_id} no existe.`);
        continue; // Ignorar esta pregunta y continuar con el resto
      }

      if (preguntaData.tipo === "abierta") {
        console.warn("La pregunta es abierta, la corregira el profesor");
        continue;
      }

      const { respuesta_correcta, puntuacion } = preguntaData;

      // Actualizar la puntuación total
      puntuacionTotal += puntuacion;

      // Comparar la respuesta del estudiante con la correcta
      const esCorrecta = Array.isArray(respuesta_correcta)
        ? JSON.stringify(respuesta_correcta.sort()) ===
          JSON.stringify(respuestaTexto.sort()) // Para multi-elección
        : respuesta_correcta === respuestaTexto; // Para preguntas estándar

      if (esCorrecta) {
        puntuacionObtenida += puntuacion;
      }
    }

    // Calcular la nota final
    const notaFinal = (puntuacionObtenida * 10) / puntuacionTotal;

    console.log(`Examen corregido. Nota final: ${notaFinal.toFixed(2)}`);

    try {
      // Generar timestamp actual
      const currentTimestamp = getCurrentTimestamp();

      // Insertar datos en la tabla
      const { error: insertError } = await supabase
        .from("EXAMEN_ALUMNOS")
        .update([
          {
            examen_id: examen_id,
            alumno_id: alumno_id,
            nota: notaFinal,
            fecha_realizacion: currentTimestamp, // Fecha y hora actual
          },
        ])
        .eq("examen_id", examen_id)
        .eq("alumno_id", alumno_id);
    } catch (insertError) {
      console.error("Error en el servidor:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    return res.status(200).json({
      message: "Examen corregido con éxito",
      nota: notaFinal.toFixed(2),
      puntuacionObtenida,
      puntuacionTotal,
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getQuestionsAndAnswer = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id } = req.query;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isProfessor = await verifyStudent(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Recuperar las preguntas asociadas al examen
    const { data: preguntas, error: preguntasError } = await supabase
      .from("EXAMEN_PREGUNTAS")
      .select(`pregunta_id, PREGUNTAS (*, RESPUESTAS (respuesta))`)
      .eq("examen_id", examen_id);

    if (preguntasError) {
      console.error("Error al recuperar las preguntas:", preguntasError);
      return res
        .status(500)
        .json({ message: "Error al obtener las preguntas del examen" });
    }
    console.log(preguntas);

    // Transformar las preguntas para eliminar `respuesta_correcta` y los valores de `correcta`
    const preguntasFiltradas = preguntas.map((pregunta) => {
      // Filtrar los valores de la pregunta, excluyendo `respuesta_correcta` y los valores de `correcta`
      const { respuesta_correcta, opciones, ...restoPregunta } =
        pregunta.PREGUNTAS;

      // Crear las opciones filtradas, eliminando la propiedad `correcta`
      const opcionesFiltradas = opciones
        ? opciones.map((opcion) => ({
            opcion: opcion.opcion,
          }))
        : [];

      // Devolver la pregunta con las opciones filtradas
      return {
        pregunta_id: pregunta.pregunta_id,
        PREGUNTA: {
          ...restoPregunta,
          opciones: opcionesFiltradas,
        },
      };
    });
    return res.status(200).json(preguntasFiltradas);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getExamName = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id } = req.query;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isProfessor = await verifyStudent(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Recuperar las preguntas asociadas al examen
    const { data: nombreExamen, error: nombreExamenError } = await supabase
      .from("EXAMENES")
      .select(`nombre`)
      .eq("examen_id", examen_id);

    if (nombreExamenError) {
      return res
        .status(500)
        .json({ message: "Error al obtener el nombre del examen" });
    }

    return res.status(200).json(nombreExamen);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const orderRevision = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id, pregunta_id } = req.query;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isProfessor = await verifyStudent(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    const { data } = await supabase
      .from("USUARIOS")
      .select(`usuario_id`)
      .eq("token", token);

    const { data: boolPeticion, error: boolError } = await supabase
      .from("RESPUESTAS")
      .select(`peticion_revision`)
      .eq("pregunta_id", pregunta_id)
      .eq("examen_id", examen_id)
      .eq("alumno_id", data[0].usuario_id);

    const {} = await supabase
      .from("RESPUESTAS")
      .update({
        peticion_revision:
          boolPeticion[0].peticion_revision === true ? false : true,
      })
      .eq("pregunta_id", pregunta_id)
      .eq("examen_id", examen_id)
      .eq("alumno_id", data[0].usuario_id);

    return res.status(200).json("Peticion modificada");
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  checkStudent,
  sendExam,
  getlistMarks,
  listActiveExams,
  getQuestOfExam,
  getQuestionsAndAnswer,
  getExamName,
  orderRevision,
  correctStandardExam,
};
