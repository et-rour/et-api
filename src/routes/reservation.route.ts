export {};
const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const router = express.Router();
const validate = require("../middlewares/validate");
const validator = require("../validations/reservation.validation");
const auth = require("../middlewares/auth");
// const auth = require("../middlewares/auth");

router.get("/", reservationController.get);
router.post(
  "/",
  [validate(validator.postNewReservation), auth()],
  reservationController.post
);
router.post(
  "/location/create-checkout-session",
  [auth(), validate(validator.createLocationCheckoutSession)],
  reservationController.createLocationCheckoutSession
);
router.post(
  "/room/create-checkout-session",
  validate(validator.createRoomCheckoutSession),
  reservationController.createRoomCheckoutSession
);

router.post("/webhook", reservationController.webhook);

router.post(
  "/getpdf",
  [auth(), validate(validator.getPDF)],
  reservationController.getPDF
);
router.post("/postpdf", auth(), reservationController.postPDF);
router.post("/testspdf", auth(), reservationController.testPFDVariables);

module.exports = router;
