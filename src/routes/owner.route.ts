export {};
const express = require("express");
const ownerController = require("../controllers/owner.controller");
const router = express.Router();
const auth = require("../middlewares/auth");


router.get("/reservations/:id", ownerController.getReservationsByClientId);
router.get("/payments", auth() , ownerController.getPaymentsByClientId);

router.get("/:id", ownerController.getPropertiesByOwnerId);
module.exports = router;
