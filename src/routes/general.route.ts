export {};
const express = require("express");
const generalController = require("../controllers/general.controller");
const router = express.Router();

router.get("/all", generalController.getCovers);

module.exports = router;
