/* RUTAS FUNCIONES PROFESOR */
const express = require("express");
const router = express.Router();

/* EXAMEN */
const {
  checkProfessor,
  createExam,
  deleteExam,
  getListExams,
  getListQuestOfExam,
  getExamInfo,
  addStudentToExam,
} = require("../controllers/professor/examenController");

const {
  createQuestion,
  getListQuestions,
  assignQuestToExam,
  changeFav,
} = require("../controllers/professor/preguntaController");

const {
  createNewGroup,
  addStudentsToGroups,
  getListGroups,
  getListAlumnosGrupos,
} = require("../controllers/professor/grupoController");

router.get("/checkProfessor", checkProfessor);
router.post("/createExam", createExam);
router.delete("/deleteExam", deleteExam);
router.get("/getListExams", getListExams);
router.get("/getListQuestOfExam", getListQuestOfExam);
router.post("/getExamInfo", getExamInfo);
router.post("/addStudentToExam", addStudentToExam);

router.post("/createQuestion", createQuestion);
router.get("/getListQuestions", getListQuestions);
router.post("/assignQuestToExam", assignQuestToExam);
router.post("/changeFav", changeFav);

router.post("/createNewGroup", createNewGroup);
router.post("/addStudentsToGroups", addStudentsToGroups);
router.get("/getListGroups", getListGroups);
router.post("/getListAlumnosGrupos", getListAlumnosGrupos);

module.exports = router;
