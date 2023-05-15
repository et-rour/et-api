export {};
const express = require("express");
const generalController = require("../controllers/general.controller");
const router = express.Router();

router.get("/all", generalController.getCovers);
router.post("/chatText", generalController.chatText);

module.exports = router;
