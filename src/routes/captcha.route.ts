export {};
const express = require("express");
const captchaController = require("../controllers/captcha.controller");
const router = express.Router();

router.post("/", captchaController.get);

module.exports = router;
