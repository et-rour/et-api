export {};
const express = require("express");
const publicationsController = require("../controllers/publications.controller");
const router = express.Router();
const validate = require("../middlewares/validate");
const validator = require("../validations/publication.validation");

router.get("/createdBy/:id", publicationsController.getByUser);
router.get("/", publicationsController.getAll);
router.get("/verified", publicationsController.getAllverifiedPosts);
router.post(
  "/",
  validate(validator.postNewPublication),
  publicationsController.post
);

module.exports = router;
