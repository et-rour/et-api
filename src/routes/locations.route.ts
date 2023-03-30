export {};
const express = require("express");
const locationsController = require("../controllers/locations.controller");
const router = express.Router();
const validate = require("../middlewares/validate");
const validator = require("../validations/location.validation");
const auth = require("../middlewares/auth");

// const auth = require("../middlewares/auth");
router.get("/", locationsController.get);
router.get("/all", auth(), locationsController.getAllLocationsForAdmin);
router.post("/", locationsController.post);
router.put("/lease",[validate(validator.updateLeaseRange), auth()],locationsController.updateLeaseRange);
router.put("/value", locationsController.updateLocationValue);
// router.get("/:idOwner", locationsController.getLocationsByOwner);
router.put("/toogleActive/:idLocation",[validate(validator.changeLocationIsActiveProperty), auth()],locationsController.changeLocationIsActiveProperty);
router.get("/:id", locationsController.getLocationById);
router.put("/:id",[auth()],locationsController.updateLocation);


// router.post(
//   "/create-checkout-session",
//   validate(validator.createCheckoutSession),
//   locationsController.createCheckoutSession
// );

// router.post("/webhook", locationsController.webhook);

module.exports = router;
