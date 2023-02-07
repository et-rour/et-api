export {};
const express = require("express");
const personaleController = require("../controllers/personal.controller");
const router = express.Router();
const validate = require("../middlewares/validate");
const validator = require("../validations/personal.validation");

router.get("/", personaleController.getAllPersonalMembers);
router.post(
  "/",
  [validate(validator.postNewPersonalMember)],
  personaleController.postNewPersonalMember
);
router.put(
  "/:id",
  [validate(validator.updatePersonalMember)],
  personaleController.updatePersonalMember
);

module.exports = router;
