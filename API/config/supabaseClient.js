require("dotenv").config(); // Cargar variables de entorno

const { createClient } = require("@supabase/supabase-js");

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERROR: Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env"
  );
  process.exit(1); // Detenemos la ejecución si faltan las variables de entorno
}

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
