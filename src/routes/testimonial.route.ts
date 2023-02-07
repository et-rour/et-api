export {};
const express = require("express");
const testimonialController = require("../controllers/testimonials.controller");
const router = express.Router();

router.get("/", testimonialController.getTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

module.exports = router;
