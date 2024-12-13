const express = require("express");
const router = express.Router();

const {
  sendExam,
  checkStudent,
  getlistMarks,
  listActiveExams,
  getQuestOfExam,
  getQuestionsAndAnswer,
  getExamName,
  orderRevision,
  correctStandardExam,
} = require("../controllers/studentController");

router.get("/checkStudent", checkStudent);
router.post("/sendExam", sendExam);
router.get("/getlistMarks", getlistMarks);
router.get("/listActiveExams", listActiveExams);
router.get("/getQuestOfExam", getQuestOfExam);
router.get("/getQuestionsAndAnswer", getQuestionsAndAnswer);
router.get("/getExamName", getExamName);
router.get("/orderRevision", orderRevision);
router.post("/correctStandardExam", correctStandardExam);
module.exports = router;
