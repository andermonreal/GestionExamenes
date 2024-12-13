require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors"); // Importa cors
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const professorRoutes = require("./routes/professor");
const studentRoutes = require("./routes/student");
const app = express();

// Middleware para habilitar CORS
app.use(cors()); // Permitir CORS para todas las rutas

// Middleware para parsear JSON
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/student", studentRoutes);

// Usar variables de entorno
const port = 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verificar que las variables estén cargadas
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env"
  );
  process.exit(1); // Termina el proceso si faltan las variables
}

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
