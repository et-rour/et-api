export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const { transporter } = require("../utils/sendWelcomeEmail");

import { Currency } from "../models/Currency";
import axios from "axios";
import moment from "moment";

const get = catchAsync(async (req: any, res: any) => {
  const currencies = await Currency.find();

  if (!currencies.length) {
      return res.status(httpStatus.OK).json({ message: "There are no currencies registered" });
  }

  const lastCall = moment(currencies[0].lastCall);
  const difference = moment().diff(lastCall,"hour")

  console.log('%ccurrency.controller.ts line:23 {Object}', 'color: white; background-color: #007acc;', {lastCall,difference,});

  if (difference > 24) {
    let query = 'currencies=';
    for (let i = 0; i < currencies.length; i++) {
        if (i === 0) {
            query = `${query}${currencies[i].apiCode}`
        } else {
          query = `${query}%2C${currencies[i].apiCode}`
        }
    }

    const apiRequest = await axios.get(`${process.env.CURRENCY_API}?apikey=${process.env.CURRENCY_API_KEY}&base_currency=CLP&${query}`);
    const newValues = apiRequest.data.data;
    
    for (let i = 0; i < currencies.length; i++) {
        currencies[i].value = newValues[currencies[i].apiCode].value.toFixed(3);
        currencies[i].lastCall = moment().toDate();
        await currencies[i].save().catch((error) => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
      });
    }
    const updatedCurrencies = await Currency.find();
    
    await transporter.sendMail({
      from: '"Espacio temporal develop', // sender address
      to: "victor@rour.dev,leandro@rour.dev", // list of receivers
      subject: `Monedas actualizadas ${moment().toDate()} en: ${process.env.FIREBASE_ADMIN_PROJECT_ID}`, // Subject line
      html: `<p>${JSON.stringify(updatedCurrencies,null,"\t")}</p>`,
      amp: `<!doctype html>
        <html ⚡4email>
          <head>
            <meta charset="utf-8">
            <style amp4email-boilerplate>body{visibility:hidden}</style>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
          </head>
          <body>
            <p>GIF (requires "amp-anim" script in header):<br/><amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
            <p>${JSON.stringify(updatedCurrencies,null,"\t")}</p>
          </body>
        </html>`
    });
    
    return res.status(httpStatus.OK).json(updatedCurrencies);
  }

  return res.status(httpStatus.OK).json(currencies);
});

const post = catchAsync(async (req: any, res: any) => {
    const { name, symbol, value, country, apiCode } = req.body;
    
    const currencies = await Currency.find();
  
    if (currencies.length) {
        for (let i = 0; i < currencies.length; i++) {
            if (currencies[i].name === name && currencies[i].country === country) {
                return res.status(httpStatus.OK).json({ message: "The currency already exists" });
            }
        }
    }

    const newCurrency = new Currency;
    newCurrency.name = name;
    newCurrency.country = country;
    newCurrency.symbol = symbol;
    newCurrency.apiCode = apiCode;
    newCurrency.value = value.toFixed(3);
    newCurrency.lastCall = new Date();

    await newCurrency.save().catch((error) => {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  
    res.status(httpStatus.OK).json(newCurrency);
});

const editCurrency = catchAsync(async (req: any, res: any) => {
  const { id, name, symbol, value, country, apiCode } = req.body;
  
  const currency = await Currency.findOne({
    where: {
      id: id
    }
  });

  if (!currency) return res.status(httpStatus.OK).json("There is no currency with that ID");

  currency.name = name;
  currency.country = country;
  currency.symbol = symbol;
  currency.apiCode = apiCode;
  currency.value = value.toFixed(3);
  currency.lastCall = new Date();

  await currency.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(currency);
});

  
const fetchCurrencyApiKeyStatus = catchAsync(async (req: any, res: any) => {
  const { data } = await axios.get(`https://api.currencyapi.com/v3/status?apikey=${process.env.CURRENCY_API_KEY}`)
  
  return res.status(httpStatus.OK).json(data);
});

module.exports = {
  get,
  post,
  editCurrency,
  fetchCurrencyApiKeyStatus
};
