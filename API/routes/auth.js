/* RUTAS FUNCIONES AUTENTICACION */
const express = require("express");
const router = express.Router();
const { login, signUP, verifyPin } = require("../controllers/authController");

// Ruta de login
router.post("/login", login);
router.post("/signUp", signUP);
router.post("/verifyPin", verifyPin);
module.exports = router;
