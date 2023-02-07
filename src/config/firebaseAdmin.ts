// export {}

// const admin = require('firebase-admin');
// const config = require('./config');

// const firebase_admin_connect = () => {
//     if (!admin.apps.length) {
//         try {
//             // console.log(config.serviceAccount)
//             admin.initializeApp({
//                 credential: admin.credential.cert(config.serviceAccount),
//                 storageBucket: config.firebase.storageBucket

//             });
//         } catch (e) {
//             console.log(e);
//         }
//     }

//     return admin;
// };

// exports.firebase_admin_connect = firebase_admin_connect;

export {};

const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const config = require("./config");
var serviceAccount1 = require("../../espacio-temporal-e37f5-firebase-adminsdk-l0l0i-a981a7262a.json");
var serviceAccount2 = require("../../espacio-temporal-prod-firebase-adminsdk-dg1xp-bd90737c2e");

const firebase_admin_connect = () => {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential:
          process.env.NODE_STATUS === "railway_dev"
            ? admin.credential.cert(serviceAccount1)
            : process.env.NODE_STATUS === "railway_prod"
            ? admin.credential.cert(serviceAccount2)
            : admin.credential.cert(config.serviceAccount),
        storageBucket: config.firebase.storageBucket,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return admin;
};

exports.firebase_admin_connect = firebase_admin_connect;
exports.getAdminStorage = getStorage;
