import firebase from "firebase/compat/app";
import "firebase/compat/storage";
const config = require("./config");

firebase.initializeApp(config.firebase);

const storage = firebase.storage();

export { storage };
