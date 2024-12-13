const { supabase } = require("../config/supabaseClient");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const generateToken = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=-_.";
  let token = "";

  for (let i = 0; i < 25; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
}

async function sendVerificationCode(email, code) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Tu código de verificación",
    text: `Tu código de verificación es: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Código de verificación enviado a:", email);
  } catch (error) {
    console.error("Error al enviar el código de verificación:", error);
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const { data: usuarios, error } = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("[!] Error al conectar a la base de datos:", error);
      return res
        .status(500)
        .json({ message: "Error en la conexión a la base de datos" });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = usuarios[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const code = generateVerificationCode();
    await sendVerificationCode(user.email, code);

    await supabase
      .from("USUARIOS")
      .update({ tempCode: code })
      .eq("email", email);

    return res.status(200).json({
      message: "Código de verificación enviado al correo",
    });
  } catch (err) {
    console.error("[!] Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const verifyPin = async (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const { data: usuarios, error } = await supabase
      .from("USUARIOS")
      .select("*")
      .eq("email", email);

    if (error || !usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = usuarios[0];
    console.log("Pin almacenado en la base de datos:", user.tempCode);

    // Convertir el pin recibido a número antes de comparar
    if (parseInt(pin) !== user.tempCode) {
      return res
        .status(401)
        .json({ message: "Código de verificación incorrecto" });
    }

    await supabase
      .from("USUARIOS")
      .update({ tempCode: null })
      .eq("email", email);

    const { password, tempCode, ...userInfo } = user;

    return res.status(200).json({
      message: "Verificación exitosa, login completado",
      user: userInfo,
    });
  } catch (err) {
    console.error("[!] Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const signUP = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  const token = generateToken();

  try {
    // Encriptar la contraseña con bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar el nuevo usuario con la contraseña encriptada
    const { data: usuarios, error } = await supabase
      .from("USUARIOS")
      .insert([
        {
          nombre: username,
          email: email,
          password: hashedPassword,
          token: token,
        },
      ])
      .select("*");

    if (error) {
      console.error("[!] Error al conectar a la base de datos:", error);
      return res.status(500).json({
        message: "Error al registrar usuario",
      });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(500).json({
        message: "Registro fallido",
      });
    }

    const user = usuarios[0];
    const { password: userPassword, ...userInfo } = user;

    return res.status(201).json({
      message: "Registro exitoso",
      user: userInfo,
    });
  } catch (err) {
    console.error("[!] Error en el servidor:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { login, verifyPin, signUP };
