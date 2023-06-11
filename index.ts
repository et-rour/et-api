import axios from "axios";
// #!/usr/bin/env node

// /**
//  * Module dependencies.
//  */

// import app from "./src/app";
// import { intializeDB } from "./src/config/db";
// const cluster = require("cluster");
// const config = require("./src/config/config");
// const logger = require("./src/config/logger");

// /**
//  * Handle clusters configuration
//  */

// var workers: any = {};
// var count = 1;
// if (config.env === "production") {
//   count = require("os").cpus().length;
// }

// /**
//  * Services Initialization
//  */
// try {
//   intializeDB();
//   require("./src/config/firebase").firebase_connect();
// } catch (error) {
//   console.warn(error);
// }

// //  require('./src/config/firebaseAdmin').firebase_admin_connect();

// /**
//  * Create HTTP server.
//  */
// let PORT = process.env.PORT || 3000;
// // if (cluster.isMaster) {
// //   for (var i = 0; i < count; i++) {
// //     spawn();
// //   }
// // } else {
// //   let server = app.listen(PORT);
// //   server.on("error", onError);
// //   server.on("listening", onListening);
// // }

// let server = app.listen(PORT);
// server.on("error", onError);
// server.on("listening", onListening);

// /**
//  * Workers creation funciton
//  */

// function spawn() {
//   var worker = cluster.fork();
//   workers[worker.pid] = worker;
//   return worker;
// }

// /**
//  * Event listener for HTTP server "listening" event.
//  */

// function onListening() {
//   logger.info(`Listening to port ${config.port}`);
// }

// /**
//  * Event listener for HTTP server "error" event.
//  */

// function onError(error: any) {
//   if (error.syscall !== "listen") {
//     throw error;
//   }
// }

// #!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "./src/app";
import { intializeDB } from "./src/config/db";
// const { initializeApp } = require("./src/config/db");
// const app = require( "./src/app");
const cluster = require("cluster");
const config = require("./src/config/config");
const logger = require("./src/config/logger");

/**
 * Handle clusters configuration
 */

var workers: any = {};
var count = 1;
if (config.env === "production") {
  count = require("os").cpus().length;
}

/**
 * Services Initialization
 */
intializeDB();
require("./src/config/firebase").firebase_connect();

/**
 * Create HTTP server.
 */

// if (cluster.isMaster) {
//   for (var i = 0; i < count; i++) {
//     spawn();
//   }
// } else {
//   // let server = app.listen(config.port);
//   let server = app.listen(process.env.PORT || 3000);
//   server.on("error", onError);
//   server.on("listening", onListening);
// }

let server = app.listen(process.env.PORT || 3000);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Websoket Server
 */
const WebSocketServer = require("websocket").server;
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

wsServer.on("request", (request: any) => {
  // if (!originIsAllowed(request.origin)) {
  //     // Sólo se aceptan request de origenes permitidos
  //     request.reject();
  //     console.log((new Date()) + ' Conexión del origen ' + request.origin + ' rechazada.');
  //     return;
  //   }
  const connection = request.accept(null, request.origin);
  connection.on("message", async (message: any) => {
    const messages = [{ role: "user", content: "Quien eres" }];

    const chatRequestOpts = {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.6,
      stream: true,
    };

    try {
      const res = await openai.createChatCompletion(chatRequestOpts, {
        responseType: "stream",
      });

      res.data.on("data", (data: any) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: any) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            connection.close(); // Stream finished
            return;
          }
          try {
            const parsed = JSON.parse(message);
            const responseChat = parsed.choices[0].delta.content;
            if (responseChat) {
              connection.sendUTF(responseChat);
            }
          } catch (error) {
            console.error(
              "Could not JSON parse stream message",
              message,
              error
            );
          }
        }
      });
    } catch (error: any) {
      if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on("data", (data: any) => {
          const message = data.toString();
          try {
            const parsed = JSON.parse(message);
            console.error("An error occurred during OpenAI request: ", parsed);
          } catch (error) {
            console.error("An error occurred during OpenAI request: ", message);
          }
        });
      } else {
        console.error("An error occurred during OpenAI request", error);
      }
    }
  });
  connection.on("close", (reasonCode: any, description: any) => {
    console.log("El cliente se desconecto");
  });
});
/**
 * Workers creation funciton
 */

function spawn() {
  var worker = cluster.fork();
  workers[worker.pid] = worker;
  return worker;
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  logger.info(`Listening to port ${config.port}`);
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }
}
