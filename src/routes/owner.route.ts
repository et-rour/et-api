export {};
const express = require("express");
const ownerController = require("../controllers/owner.controller");
const router = express.Router();

router.get("/:id", ownerController.getPropertiesByOwnerId);
router.get("/client/:id", ownerController.getReservationsByClientId);

module.exports = router;
