const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    VERSION: Joi.string().default('NON_GIVEN').description('API Version'),
    PORT: Joi.number().default(3000),
    DB_TYPE: Joi.string().valid('sqlite', 'sqlite3', 'postgres').required().description('DB Type'),
    DB_HOST: Joi.string().default('./database.sqlite').required().description('DB Host'),
    DB_PORT: Joi.string().required().description('DB Port'),
    DB_USERNAME: Joi.string().required().description('DB Username'),
    DB_PASSWORD: Joi.string().required().description('DB Password'),
    DB_DATABASE: Joi.string().required().description('DB Database'),
    FIREBASE_API_KEY: Joi.string().required().description('Firebase Api key'),
    FIREBASE_AUTH_DOMAIN: Joi.string().required().description('Firebase Auth Domain'),
    FIREBASE_PROJECT_ID: Joi.string().required().description('Firebase Project Id'),
    FIREBASE_STORAGE_BUCKET: Joi.string().required().description('Firebase Storage Bucket'),
    FIREBASE_MESSAGING_SENDER_ID: Joi.string().required().description('Firebase Messaging Sender Id'),
    FIREBASE_APP_ID: Joi.string().required().description('Firebase App Id'),
    FIREBASE_MEASUREMENT_ID: Joi.string().required().description('Firebase Measurement Id'),
    FIREBASE_ADMIN_TYPE: Joi.string().required().description('Firebase Admin Type.'),
    FIREBASE_ADMIN_PROJECT_ID: Joi.string().required().description('Firebase Admin Project Id.'),
    FIREBASE_ADMIN_PRIVATE_KEY_ID: Joi.string().required().description('Firebase Admin Private Key Id.'),
    FIREBASE_ADMIN_PRIVATE_KEY: Joi.string().required().description('Firebase Admin Private Key.'),
    FIREBASE_ADMIN_CLIENT_EMAIL: Joi.string().required().description('Firebase Admin Client Email.'),
    FIREBASE_ADMIN_CLIENT_ID: Joi.string().required().description('Firebase Admin Client Id.'),
    FIREBASE_ADMIN_AUTH_URI: Joi.string().required().description('Firebase Admin Auth Uri.'),
    FIREBASE_ADMIN_TOKEN_URI: Joi.string().required().description('Firebase Admin Token Uri.'),
    FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL: Joi.string().required().description('Firebase Admin Auth Provider.'),
    FIREBASE_ADMIN_CLIENT_X509_CERT_URL: Joi.string().required().description('Firebase Admin Client Cert Url.'),

    })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let finalPrivateKey = '';
if (envVars.NODE_ENV === 'production') {
  finalPrivateKey = envVars.FIREBASE_ADMIN_PRIVATE_KEY;
  finalPrivateKey = finalPrivateKey.replace(/\\n/g,"\n");
} else {
  finalPrivateKey = envVars.FIREBASE_ADMIN_PRIVATE_KEY;
}

const settings = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  version: envVars.VERSION,
  firebase: {
    apiKey: envVars.FIREBASE_API_KEY,
    authDomain: envVars.FIREBASE_AUTH_DOMAIN,
    projectId: envVars.FIREBASE_PROJECT_ID,
    storageBucket: envVars.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.FIREBASE_APP_ID,
    measurementId: envVars.FIREBASE_MEASUREMENT_ID
  },
  serviceAccount: {
    'type': envVars.FIREBASE_ADMIN_TYPE,
    'project_id': envVars.FIREBASE_ADMIN_PROJECT_ID,
    'private_key_id': envVars.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    'private_key': finalPrivateKey,
    'client_email': envVars.FIREBASE_ADMIN_CLIENT_EMAIL,
    'client_id': envVars.FIREBASE_ADMIN_CLIENT_ID,
    'auth_uri': envVars.FIREBASE_ADMIN_AUTH_URI,
    'token_uri': envVars.FIREBASE_ADMIN_TOKEN_URI,
    'auth_provider_x509_cert_url': envVars.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    'client_x509_cert_url': envVars.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL
  },
  db_settings: {
    type: envVars.DB_TYPE,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_DATABASE
  },
};

module.exports = settings;