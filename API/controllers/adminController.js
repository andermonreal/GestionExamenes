/* LOGICA CONTROLLER FUNCIONES DEL ADMINISTRADOR */
const { supabase } = require("../config/supabaseClient");

const verifyAdmin = async (token) => {
  try {
    const { data: creds, error } = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("token", token)
      .eq("rol", 0); // Verifica si el rol es 0 (administrador)

    if (error) {
      console.error("[!] Error al conectar a la base de datos:", error);
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

const checkAdmin = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      console.error("[!] Verificacion de Administrador fallida al checkear administrador.");
      return res.status(404).json({
        message: "Error en la verificacion de administrador",
      });
    }

    return res.status(200).json({
      message: "Verificacion correcta",
    });
  } catch (err) {
    console.error("[!] Error en el servidor al checkear administrador:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const listUsers = async (req, res) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      console.error("[!] Verificacion de Administrador fallida al listar usuarios.");
      return res.status(404).json({
        message: "Error en la verificacion de administrador",
      });
    }

    const { data: usuarios, error } = await supabase
      .from("USUARIOS")
      .select("*");

    if (error) {
      console.error("[!] Error al conectar a la base de datos al listar usuarios:", error);
      return res.status(500).json({
        message: "Error en la conexión a la base de datos",
        error: error.message,
      });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        message: "No se ha encontrado ningun usuario",
      });
    }

    const usuariosSinPassword = usuarios.map(
      ({ password, ...userInfo }) => userInfo
    );

    return res.status(200).json({
      message: "Lista de Usuarios",
      user: usuariosSinPassword,
    });
  } catch (err) {
    console.error("[!] Error en el servidor para la lista de usuarios:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const getUser = async (req, res) => {
  const token = req.headers["authorization"];
  const { identificador } = req.query;

  if (!token || !identificador) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      console.error("[!] Verificacion de Administrador fallida al obtener los usuarios.");
      return res.status(404).json({
        message: "Error en la verificacion de administrador",
      });
    }

    if (!isNaN(identificador)) {
      query = supabase
        .from("USUARIOS")
        .select("*")
        .or(
          `nombre.ilike.%${identificador}%, email.ilike.%${identificador}%, usuario_id.eq.${identificador}`
        );
    } else {
      query = supabase
        .from("USUARIOS")
        .select("*")
        .or(`nombre.ilike.%${identificador}%, email.ilike.%${identificador}%`);
    }

    const { data: usuarios, error } = await query;

    if (error) {
      console.error("[!] Error al conectar a la base de datos al obtener los usuarios:", error);
      return res.status(500).json({
        message: "Error en la conexión a la base de datos",
        error: error.message,
      });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        message: "No se ha encontrado ningun usuario",
      });
    }

    const usuariosSinPassword = usuarios.map(
      ({ password, ...userInfo }) => userInfo
    );

    return res.status(200).json({
      message: "Lista de Usuarios",
      user: usuariosSinPassword,
    });
  } catch (err) {
    console.error("[!] Error en el servidor al obtener los usuarios:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const modifyUser = async (req, res) => {
  const token = req.headers["authorization"];
  const usuario = req.body;

  if (!token || !usuario) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      console.error("[!] Verificacion fallida al modificar usuario.");
      return res.status(404).json({
        message: "Error en la verificacion de administrador",
      });
    }

    const { error } = await supabase
      .from("USUARIOS")
      .update({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      })
      .eq("usuario_id", usuario.usuario_id);

    if (error) {
      console.error("[!] Error al conectar a la base de datos al modificar usuario:", error);
      return res.status(500).json({
        message: "Error en la conexión a la base de datos",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Campos cambiados correctamente",
    });
  } catch (err) {
    console.error("[!] Error en el servidor al modificar usuario:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const deleteUser = async (req, res) => {
  const token = req.headers["authorization"];
  const { usuario_id } = req.body; // user_id

  if (!token || !usuario_id) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const isAdmin = await verifyAdmin(token);

    if (!isAdmin) {
      console.error("[!] Verificacion fallida al eliminar usuario.");
      return res.status(404).json({
        message: "Error en la verificacion de administrador",
      });
    }

    const { error } = await supabase
      .from("USUARIOS")
      .delete()
      .eq("usuario_id", usuario_id);

    if (error) {
      console.error("[!] Error al conectar a la base de datos al eliminar usuario:", error);
      return res.status(500).json({
        message: "Error en la conexión a la base de datos",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Usuario eliminado correctamente",
    });
  } catch (err) {
    console.error("Error en el servidor al eliminar usuario:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
module.exports = { listUsers, checkAdmin, getUser, modifyUser, deleteUser };