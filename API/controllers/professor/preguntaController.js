/* LOGICA CONTROLLER FUNCIONES DEL PROFESOR (PREGUNTAS) */
const { supabase } = require("../../config/supabaseClient");
const { verifyProfessor } = require("./verifyProfessor");

const createQuestion = async (req, res) => {
  const token = req.headers["authorization"];
  const { pregunta } = req.body;

  if (!token || !pregunta) {
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

    const { error } = await supabase.from("PREGUNTAS").insert({
      profesor_id: profesor_id,
      texto: pregunta.texto,
      tipo: pregunta.tipo, // Puede ser 'estandar', 'abierta', 'multi-elección', 'dragdrop'
      opciones: pregunta.opciones, // Opciones si es de tipo multi-elección o estandar
      respuesta_correcta: pregunta.respuesta_correcta, // Respuesta correcta si aplica
      puntuacion: pregunta.puntuacion,
    });

    if (error) {
      console.error("Error al conectar a la base de datos:", error);
      return res.status(500).json({
        message: "Error al crear pregunta",
      });
    }

    return res.status(201).json({
      message: "Creación de pregunta exitosa",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getListQuestions = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

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

    // Recuperar todas las preguntas asociadas a este profesor
    const { data: preguntas, error: preguntasError } = await supabase
      .from("PREGUNTAS")
      .select("*")
      .eq("profesor_id", profesor_id)
      .order("pregunta_id", { ascending: true }); // Orden ascendente por pregunta_id

    if (preguntasError) {
      console.error("Error al recuperar las preguntas:", preguntasError);
      return res.status(500).json({
        message: "Error al obtener las preguntas",
      });
    }

    return res.status(200).json(preguntas); // Devolver la lista de preguntas
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const assignQuestToExam = async (req, res) => {
  const token = req.headers["authorization"];
  const { pregunta_id, examen_id } = req.body;

  if (!token || !pregunta_id || !examen_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // Verificar si la pregunta existe y pertenece al profesor autenticado
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

    // Verificar si la pregunta pertenece al profesor
    const { data: preguntaData, error: preguntaError } = await supabase
      .from("PREGUNTAS")
      .select("pregunta_id")
      .eq("pregunta_id", pregunta_id)
      .eq("profesor_id", profesor_id);

    if (preguntaError || !preguntaData || preguntaData.length === 0) {
      console.error("Error al verificar la pregunta:", preguntaError);
      return res.status(404).json({
        message: "Pregunta no encontrada o no pertenece al profesor",
      });
    }

    // Verificar si el examen pertenece al profesor
    const { data: examenData, error: examenError } = await supabase
      .from("EXAMENES")
      .select("examen_id")
      .eq("examen_id", examen_id)
      .eq("profesor_id", profesor_id);

    if (examenError || !examenData || examenData.length === 0) {
      console.error("Error al verificar el examen:", examenError);
      return res.status(404).json({
        message: "Examen no encontrado o no pertenece al profesor",
      });
    }

    // Insertar en la tabla EXAMEN_PREGUNTA
    const { error: examError } = await supabase
      .from("EXAMEN_PREGUNTAS")
      .insert({
        pregunta_id: pregunta_id,
        examen_id: examen_id,
      });

    if (examError) {
      console.error("Error al asignar la pregunta al examen:", examError);
      return res.status(500).json({
        message: "Error al asignar la pregunta al examen",
      });
    }

    return res.status(201).json({
      message: "Pregunta asignada al examen exitosamente",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const changeFav = async (req, res) => {
  const token = req.headers["authorization"];
  const { pregunta_id } = req.body;

  if (!token || !pregunta_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    console.log("Verificando credenciales profesor...");

    const isProfessor = await verifyProfessor(token);

    if (!isProfessor) {
      console.error("Verificación fallida.");
      return res.status(404).json({
        message: "Error en la verificación de profesor",
      });
    }

    // recuperar id del profesor
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

    // Verificar si la pregunta pertenece al profesor y obtener su valor de fav
    const { data: preguntaData, error: preguntaError } = await supabase
      .from("PREGUNTAS")
      .select("pregunta_id, fav")
      .eq("pregunta_id", pregunta_id)
      .eq("profesor_id", profesor_id);

    if (preguntaError || !preguntaData || preguntaData.length === 0) {
      console.error("Error al verificar la pregunta:", preguntaError);
      return res.status(404).json({
        message: "Pregunta no encontrada o no pertenece al profesor",
      });
    }

    const fav = preguntaData[0].fav;

    // Cambiar el valor de "fav" al opuesto
    const { error: updateError } = await supabase
      .from("PREGUNTAS")
      .update({ fav: !fav }) // Alternar el valor de fav
      .eq("pregunta_id", pregunta_id);

    if (updateError) {
      console.error("Error al actualizar el valor de fav:", updateError);
      return res.status(500).json({
        message: "Error al actualizar el estado de favoritismo",
      });
    }

    return res.status(201).json({
      message: `Se ha cambiado el estado de "favoritismo" de la pregunta`,
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  createQuestion,
  getListQuestions,
  assignQuestToExam,
  changeFav,
};
