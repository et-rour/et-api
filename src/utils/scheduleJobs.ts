const { default: axios } = require('axios');
let schedule = require('node-schedule');
const { transporter } = require("./sendWelcomeEmail");

let currencies = {
  PEN: {
    code: "PEN",
    value: 0.004302
  },
  USD: {
      code: "USD",
      value: 0.001091
  }
};

// const job = schedule.scheduleJob('0 * * * * *',async function(){
//   // const currenciesResponse = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}}&base_currency=CLP&currencies=USD,PEN`)
//   // console.log('Today is recognized by Rebecca Black!');
//   try {
//     // await transporter.sendMail({
//     //   from: '"Espacio temporal -" <foo@example.com>', // sender address
//     //   to: "victor@rour.dev", // list of receivers
//     //   subject: `Monedas actualizadas ${new Date()}`, // Subject line
//     //   html: `<p>${JSON.stringify(currencies,null,"\t")}</p>`,
//     //   amp: `<!doctype html>
//     //     <html ⚡4email>
//     //       <head>
//     //         <meta charset="utf-8">
//     //         <style amp4email-boilerplate>body{visibility:hidden}</style>
//     //         <script async src="https://cdn.ampproject.org/v0.js"></script>
//     //         <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
//     //       </head>
//     //       <body>
//     //         <p>GIF (requires "amp-anim" script in header):<br/><amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
//     //         <p>${JSON.stringify(currencies,null,"\t")}</p>
//     //       </body>
//     //     </html>`
//     // });
//   } catch (error) {
//     console.log('%cerror scheduleJobs.ts line:27 ', 'color: red; display: block; width: 100%;', error);
//   }
// });

module.exports = {
  // job,
  currencies
}