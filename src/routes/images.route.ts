import { upload } from "../config/multer";

export {};
const express = require("express");
const imagesController = require("../controllers/images.controller");
const router = express.Router();
const validate = require("../middlewares/validate");
const validator = require("../validations/images.validation");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
router.get("/", imagesController.getAllImages);
router.get("/:idLocation", imagesController.getImagesByLocation);

router.post("/",[validate(validator.postNewImage), auth()],imagesController.postImage);
router.put("/:idImage/delete",[authAdmin()],imagesController.deleteImage);
router.put("/:idImage/visible",[validate(validator.updateImageVisibility), auth()],imagesController.updateImageVisibility);

router.post("/room",[validate(validator.postNewImageRoom), auth()],imagesController.postImageRoom);
router.post("/multi",[auth(), upload.array("images", 5)],imagesController.uploadMulpipleToFirebase);

module.exports = router;
