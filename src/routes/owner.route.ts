export {};
const express = require("express");
const ownerController = require("../controllers/owner.controller");
const router = express.Router();

router.get("/:id", ownerController.getPropertiesByOwnerId);

module.exports = router;
