export {};
const express = require("express");
const currencyController = require("../controllers/currency.controller");
const router = express.Router();

router.get("/", currencyController.get);
router.get("/key", currencyController.fetchCurrencyApiKeyStatus);
router.post("/", currencyController.post);
router.patch("/", currencyController.editCurrency);

module.exports = router;
