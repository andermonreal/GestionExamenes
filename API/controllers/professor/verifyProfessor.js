const { supabase } = require("../../config/supabaseClient");

const verifyProfessor = async (token) => {
  try {
    const { data: creds, error } = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("token", token)
      .eq("rol", 2); // Verifica si el rol es 2 (profesor)

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

module.exports = { verifyProfessor };
