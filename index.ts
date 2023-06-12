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
import chatWebsocket from "./src/websockets/chat";
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
wsServer.on("request", (request: any) => chatWebsocket(request));
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
