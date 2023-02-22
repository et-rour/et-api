export {};
const express = require("express");
const adminController = require("../controllers/admin.controller");
const router = express.Router();

const validate = require("../middlewares/validate");
const validator = require("../validations/admin.validation");
import { upload } from "../config/multer";

// ADD ADMIN MIDDLEWARE

// User routes
router.get("/listusers", adminController.getAllUsers);
router.get("/listuserstrash", adminController.getTrashUsers);
router.get("/user/:id", adminController.getUserById);
router.put("/user/:id", adminController.updateUserData);
router.get("/user/:id/trash", adminController.getUserByIdTrash);
router.put("/verifyuser",[validate(validator.verifyUser)],adminController.verifyUser);
router.put("/user/:id/asignAdmin",[validate(validator.asignAdminRol)],adminController.asignAdminRol);
router.put("/changeuserstatus",[validate(validator.activeStatus)],adminController.activeStatus);
router.put("/makeowner",[validate(validator.makeOwner)],adminController.makeOwner);
router.put("/deleteuser",adminController.deleteUser);
router.put("/deleteuserpermanent",adminController.deleteUserPermanent);
router.put("/restoreuser",adminController.restoreUser);

// Locations routes
router.get("/listlocations", adminController.getAllLocations);
router.get("/listlocationstrash", adminController.getTrashLocations);
router.get("/location/:id", adminController.getLocationById);
router.put("/setlocationvalue",[validate(validator.setLocationsValue)],adminController.setLocationsValue);
router.put("/changelocationstatus",[validate(validator.activeLocationsStatus)],adminController.activeLocationsStatus);
router.put("/verifylocation",[validate(validator.verifyLocation)],adminController.verifyLocation);
router.put("/modifylocation",[validate(validator.modifyLocation)],adminController.modifyLocation);
router.put("/deletelocation",adminController.deleteLocation);
router.put("/deletelocationpermanent",adminController.deleteLocationPermanent);
router.put("/restorelocation",adminController.restoreLocation);
router.put("/modifylocation/changeCoverImage/:idLocation",[validate(validator.updateLocationCoverImage)],adminController.updateLocationCoverImage);
router.post("/createlocation",[validate(validator.createLocation)],adminController.createLocation);

// ROOM
router.post("/room/",validate(validator.postNewRoom),adminController.post);
router.put("/room/:idRoom",validate(validator.updateRoom),adminController.updateRoom);
router.put("/room/:idRoom/isActive",validate(validator.updateRoomIsActive),adminController.updateRoomIsActive);
router.put("/room/:idRoom/image",validate(validator.updateRoomImage),adminController.updateRoomImage);

// Zones routes
router.get("/zone", adminController.getAllZones);
router.get("/zone/:id", adminController.getZoneById);
router.post("/zone",[validate(validator.createZone)],adminController.createZone);
router.put("/zone",[validate(validator.modifyZone)],adminController.modifyZone);
router.put("/changezonestatus",[validate(validator.activeZoneStatus)],adminController.activeZoneStatus);

// Reviews routes
router.get("/review", adminController.getAllReviews);
router.get("/review/:id", adminController.getReviewById);
router.put("/changereviewstatus",[validate(validator.activeReviewStatus)],adminController.activeReviewStatus);
router.put("/verifyreview",[validate(validator.verifyReview)],adminController.verifyReview);

// Reservations routes
router.get("/reservation", adminController.getAllReservations);
router.get("/reservation/:id", adminController.getReservationById);
router.put("/modifyreservervation",[validate(validator.modifyReservation)],adminController.modifyReservation);
router.put("/changereservationstatus",[validate(validator.changeReservationStatus)],adminController.changeReservationStatus);

// Reservations routes
router.get("/publications", adminController.getAllPublications);
router.put("/verifypublication/:id",[validate(validator.verifyPublication)],adminController.verifyPublication);

// STRIPE
router.get("/stripe/payments/all", adminController.getAllPayments);
router.get("/stripe/payments", adminController.getPaymentsPagination);

// IMAGES
router.post("/image/",[upload.single("file"), validate(validator.verifyOneImagePost)],adminController.postOneImage);
router.post("/images/",validate(validator.postNewImage),adminController.postImage);
router.put("/images/:idImage/visible",[validate(validator.upadateImageVisibility)],adminController.updateImageVisibility);
  
// TESTIMONIALS
router.post("/testimonial/",[validate(validator.createTestimonial)], adminController.postNewTestimonial);
router.put("/testimonial/:id", adminController.putTestimonial);
router.delete("/testimonial/:idTestimonial", adminController.deleteTestimonial);

// GENERAL
router.post("/general/",[validate(validator.postNewCoverImage)], adminController.postNewCoverImage);
router.put("/general/:id/coverImage", [validate(validator.putCoverImage)],adminController.putCoverImage);
router.put("/general/:id/text", [validate(validator.putText)],adminController.putText);


// test
// Populate DB with fake data
router.post("/loadfakedata", adminController.loadFakeData);
router.post("/loadDefaultStripeData", adminController.loadDefaultStripeData);

module.exports = router;
