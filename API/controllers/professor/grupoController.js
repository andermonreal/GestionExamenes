/* LOGICA CONTROLLER FUNCIONES DEL PROFESOR (GRUPOS) */
const { supabase } = require("../../config/supabaseClient");
const { verifyProfessor } = require("./verifyProfessor");

const createNewGroup = async (req, res) => {
  const token = req.headers["authorization"];
  const { nombre } = req.body;

  if (!token || !nombre) {
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

    const { error } = await supabase.from("GRUPOS").insert({
      profesor_id: profesor_id,
      nombre: nombre,
    });
    if (error) {
      console.error("Error al conectar a la base de datos:", error);
      return res.status(500).json({
        message: "Error al crear el grupo",
      });
    }

    return res.status(201).json({
      message: "Se ha creado el grupo exitosamente",
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getListGroups = async (req, res) => {
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

    const { data: grupos, error } = await supabase
      .from("GRUPOS")
      .select("grupo_id, nombre")
      .eq("profesor_id", profesor_id);

    if (error) {
      console.error("Error al recuperar los grupos:", error);
      return res.status(500).json({
        message: "Error al obtener los grupos",
      });
    }

    return res.status(200).json(grupos);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const addStudentsToGroups = async (req, res) => {
  const token = req.headers["authorization"];
  const { alumnos, grupo_id } = req.body;

  if (!token || !grupo_id || !alumnos) {
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

    let message = "";
    let addedUsers = 0;
    for (const alumno_id of alumnos) 
    {
      const { error } = await supabase.from("GRUPO_ALUMNOS").insert({
        grupo_id: grupo_id,
        alumno_id: alumno_id
      });

      if (error) {
        if (error.code == '23505')
        {
          const { data: data, err } = await supabase
            .from("USUARIOS")
            .select("nombre")
            .eq("usuario_id", alumno_id);

            if (err) {
              console.error("Error al recuperar los grupos:", error);
              return res.status(500).json({message: "Error al obtener los grupos",});
            }

          message += `El alumno ${data[0].nombre} ya existe en el grupo\n`;
        }
        else
        {
          console.error("Error al conectar a la base de datos:", error);
          return res.status(500).json({
            message: "Error al añadir alumno al grupo",
          });
        }
      }
      addedUsers += 1;
    }

    if (addedUsers === 0)
    {
      return res.status(201).json({message: message + "No se ha añadido ningun alumno", });
    }
    else if (addedUsers === 1)
    {
      return res.status(201).json({message: message + "Alumno añadidos al grupo", });
    }
    else
    {
      return res.status(201).json({message: message + "Alumnos añadidos al grupo", });
    }
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getListAlumnosGrupos = async (req, res) => {
  const token = req.headers["authorization"];
  const { grupo_id } = req.body;

  if (!token) {
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

    const { data: data, error1 } = await supabase
      .from("GRUPO_ALUMNOS")
      .select("alumno_id")
      .eq("grupo_id", grupo_id);

    if (error1) {
      console.error("Error al recuperar el ID de los alumnos:", error1);
      return res.status(500).json({message: "Error al obtener los alumnos",});
    }

    response = [];
    for (const student_id of data) 
    {
      const { data: student, error2 } = await supabase
        .from("USUARIOS")
        .select("usuario_id, nombre, email")
        .eq("usuario_id", student_id.alumno_id);

      if (error2) {
        console.error("Error al obtener los alumnos con su id:", error2);
        return res.status(500).json({ message: "Error al obtener los alumnos",});
      }

      if (student && student.length > 0) {
        response.push(student[0]); 
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


module.exports = { createNewGroup, addStudentsToGroups, getListGroups, getListAlumnosGrupos };
