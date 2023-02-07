export {};
const express = require("express");
const zonesController = require("../controllers/zones.controller");
const router = express.Router();
const auth = require("../middlewares/auth");

router.get("/", zonesController.get);

module.exports = router;
