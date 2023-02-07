export {};
const express = require("express");
const roomController = require("../controllers/room.controller");
const router = express.Router();

router.get("/", roomController.get);
router.get("/:idRoom", roomController.getRoomById);
module.exports = router;
