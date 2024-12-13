/* LOGICA CONTROLLER FUNCIONES DEL PROFESOR (EXAMENES) */
const { supabase } = require("../../config/supabaseClient");
const { verifyProfessor } = require("./verifyProfessor");

const checkProfessor = async (req, res) => {
  const token = req.headers["authorization"];

  console.log("Datos recibidios: ", token);

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificacion fallida.");
      return res.status(404).json({
        message: "Error en la verificacion de profesor",
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

const createExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen } = req.body;

  console.log("Datos recibidios: ", token);
  console.log("Datos recibidoss: ", examen);
  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificacion fallida.");
      return res.status(404).json({
        message: "Error en la verificacion de profesor",
      });
    }

    // Recuperar el id del profesor a partir del token
    const { data: profesorData, error: profesorError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (profesorError || !profesorData || profesorData.length === 0) {
      console.error("Error al recuperar el profesor:", profesorError);
      return res.status(500).json({
        message: "Error al verificar el profesor",
      });
    }

    const profesor_id = profesorData[0].usuario_id;

    console.log("Verificación exitosa. Devolviendo datos...");
    const { error } = await supabase.from("EXAMENES").insert({
      nombre: examen.nombre,
      duracion: examen.duracion,
      profesor_id: profesor_id,
      fecha_ini: examen.fecha_ini,
      fecha_fin: examen.fecha_fin,
      autocorregir: examen.autocorregir,
    });

    if (error) {
      console.error("Error al conectar a la base de datos:", error);
      return res.status(500).json({
        message: "Error al crear examen",
      });
    }

    return res.status(201).json({
      message: "Creacion de examen exitosa",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getListExams = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Recuperar el id del profesor a partir del token
    const { data: profesorData, error: profesorError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (profesorError || !profesorData || profesorData.length === 0) {
      console.error("Error al recuperar el profesor:", profesorError);
      return res.status(500).json({
        message: "Error al verificar el profesor",
      });
    }

    const profesor_id = profesorData[0].usuario_id;

    // Recuperar todos los exámenes asociados a este profesor
    const { data: examenes, error: examenesError } = await supabase
      .from("EXAMENES")
      .select("*")
      .eq("profesor_id", profesor_id);

    if (examenesError) {
      console.error("Error al recuperar los exámenes:", examenesError);
      return res.status(500).json({
        message: "Error al obtener los exámenes",
      });
    }

    return res.status(200).json(examenes); // Devolver la lista de exámenes
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const deleteExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { identificador } = req.body;

  console.log("Datos recibidios: ", token);

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificacion fallida.");
      return res.status(404).json({
        message: "Error en la verificacion de profesor",
      });
    }

    const { error } = await supabase
      .from("EXAMENES")
      .delete()
      .eq("examen_id", identificador);

    if (error) {
      console.error("Error al conectar a la base de datos:", error);
      return res.status(500).json({
        message: "Error al eliminar el examen",
      });
    }

    return res.status(201).json({
      message: "Eliminacion de examen exitosa",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
const getListQuestOfExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id } = req.query;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  console.log("Conectándose a la base de datos...");

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Recuperar el id del profesor a partir del token
    const { data: profesorData, error: profesorError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (profesorError || !profesorData || profesorData.length === 0) {
      console.error("Error al recuperar el profesor:", profesorError);
      return res.status(500).json({
        message: "Error al verificar el profesor",
      });
    }

    const profesor_id = profesorData[0].usuario_id;

    // Recuperar las preguntas asociadas al examen y al profesor
    const { data: preguntas, error: preguntasError } = await supabase
      .from("EXAMEN_PREGUNTAS")
      .select(`pregunta_id, PREGUNTAS (*)`)
      .eq("examen_id", examen_id);

    if (preguntasError) {
      console.error("Error al recuperar las preguntas:", preguntasError);
      return res.status(500).json({
        message: "Error al obtener las preguntas del examen",
      });
    }

    // Devolver las preguntas en el formato esperado
    return res.status(200).json(preguntas);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getExamInfo = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id } = req.body;

  if (!token || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Recuperar el id del profesor a partir del token
    const { data: profesorData, error: profesorError } = await supabase
      .from("USUARIOS")
      .select("usuario_id")
      .eq("token", token);

    if (profesorError || !profesorData || profesorData.length === 0) {
      console.error("Error al recuperar el profesor:", profesorError);
      return res.status(500).json({
        message: "Error al verificar el profesor",
      });
    }

    const response = {
      detalles: {},
      preguntas: [],
      notas: [],
    };

    const { data: detalles, error: detallesError } = await supabase
      .from("EXAMENES")
      .select(
        `examen_id, nombre, fecha_ini, fecha_fin, duracion, profesor_id, autocorregir`
      )
      .eq("examen_id", examen_id);

    if (detallesError) {
      console.error("Error al recuperar las preguntas:", detallesError);
      return res
        .status(500)
        .json({ message: "Error al obtener las preguntas del examen" });
    }

    if (detalles && detalles.length > 0) {
      response.detalles = {
        examen_id: detalles[0].examen_id,
        nombre: detalles[0].nombre,
        fecha_ini: detalles[0].fecha_ini,
        fecha_fin: detalles[0].fecha_fin,
        duracion: detalles[0].duracion,
        profesor_id: detalles[0].profesor_id,
        autocorregir: detalles[0].autocorregir,
      };
    }

    const { data: identificadores_preguntas, error: preguntasError1 } =
      await supabase
        .from("EXAMEN_PREGUNTAS")
        .select(`pregunta_id`)
        .eq("examen_id", examen_id);

    if (preguntasError1) {
      console.error("Error al obtener la pregunta:", preguntasError1);
      return res.status(500).json({ message: "Error al obtener la pregunta" });
    }

    preguntas = [];
    for (const id_pregunta of identificadores_preguntas) {
      const { data: pregunta, error: preguntasError } = await supabase
        .from("PREGUNTAS")
        .select("*")
        .eq("pregunta_id", id_pregunta.pregunta_id);

      if (preguntasError) {
        console.error("Error al obtener la pregunta:", preguntasError);
        return res
          .status(500)
          .json({ message: "Error al obtener la pregunta" });
      }

      if (pregunta && pregunta.length > 0) {
        preguntas.push(pregunta[0]);
      }

      if (pregunta && pregunta.length > 0) {
        response.preguntas.push({
          pregunta_id: pregunta[0].pregunta_id,
          texto: pregunta[0].texto,
          tipo: pregunta[0].tipo,
          opciones: pregunta[0].opciones,
          respuesta_correcta: pregunta[0].respuesta_correcta,
          puntuacion: pregunta[0].puntuacion,
          profesor_id: pregunta[0].profesor_id,
        });
      }
    }

    const { data: notas_alumnos, error: notas_error } = await supabase
      .from("EXAMEN_ALUMNOS")
      .select(`alumno_id, nota`)
      .eq("examen_id", examen_id);

    if (notas_error) {
      console.error("Error al obtener la pregunta:", notas_error);
      return res.status(500).json({ message: "Error al obtener la pregunta" });
    }

    notas = [];
    for (const nota_alumno of notas_alumnos) {
      const { data: alumno, error: alumnoError } = await supabase
        .from("USUARIOS")
        .select("usuario_id, nombre, email")
        .eq("usuario_id", nota_alumno.alumno_id);

      if (alumnoError) {
        console.error("Error al obtener la pregunta:", alumnoError);
        return res
          .status(500)
          .json({ message: "Error al obtener la pregunta" });
      }

      if (alumno && alumno.length > 0) {
        response.notas.push({
          alumno: {
            nombre: alumno[0].nombre,
            email: alumno[0].email,
          },
          nota: nota_alumno.nota, // Incluimos el valor de la nota
        });
      }
    }

    // Devolver las preguntas en el formato esperado
    return res.status(200).json(response);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const addStudentToExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { examen_id, alumno_id } = req.body;

  if (!token || !alumno_id || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }
    // Verificar si el alumno existe y si su rol es igual a 1
    const { data: alumnoData, error: alumnoErrorexiste } = await supabase
      .from("USUARIOS")
      .select("usuario_id, rol") // Selecciona el ID y el rol del usuario
      .eq("usuario_id", alumno_id) // Verifica el ID del usuario
      .single();

    if (alumnoErrorexiste || !alumnoData) {
      console.error("Error al verificar el alumno:", alumnoErrorexiste);
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Verificar si el rol del alumno es igual a 1
    if (alumnoData.rol !== 1) {
      console.error("El rol del alumno no es el adecuado.");
      return res.status(403).json({ message: "No es un alumno" });
    }

    const { alumnoError } = await supabase.from("EXAMEN_ALUMNOS").insert({
      examen_id: examen_id,
      alumno_id: alumno_id,
    });

    if (alumnoError) {
      console.error("Error al asignar alumno al examen:", alumnoError);
      return res
        .status(500)
        .json({ message: "Error al asignar alumno al examen" });
    }

    return res.status(201).json({ message: "Alumno asignado al examen" });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  checkProfessor,
  createExam,
  deleteExam,
  getListExams,
  getListQuestOfExam,
  getExamInfo,
  addStudentToExam,
};
