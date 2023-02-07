export {};
const express = require("express");
const calculatorController = require("../controllers/calculator.controller");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/", calculatorController.post);

module.exports = router;
