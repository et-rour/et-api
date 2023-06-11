export {};
const express = require("express");
const generalController = require("../controllers/general.controller");
const router = express.Router();
const chatMiddleware = require("../middlewares/chat");

router.get("/all", generalController.getCovers);
router.post("/simpleChatText", chatMiddleware(), generalController.chatText);
router.post("/chatText", chatMiddleware(), generalController.chatTextWebsokets);

module.exports = router;
