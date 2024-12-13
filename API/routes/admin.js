/* RUTAS FUNCIONES ADMINISTRADOR */
const express = require("express");
const router = express.Router();
const {
  listUsers,
  checkAdmin,
  getUser,
  modifyUser,
  deleteUser,
} = require("./../controllers/adminController");

router.get("/listUsers", listUsers);
router.get("/checkAdmin", checkAdmin);
router.get("/getUser", getUser);
router.post("/modifyUser", modifyUser);
router.delete("/deleteUser", deleteUser);

module.exports = router;