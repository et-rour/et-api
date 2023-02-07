export {};
const express = require("express");
const reviewsController = require("../controllers/reviews.controller");
const router = express.Router();
const auth = require("../middlewares/auth");

router.get("/createdBy/:id", reviewsController.getByCreator);
router.get("/receivedBy/:id", reviewsController.getByReceiver);
router.get("/all", reviewsController.getAll);
router.post("/", reviewsController.post);

module.exports = router;
