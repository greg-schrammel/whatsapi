import firebaseAdmin from "firebase-admin";

const encodedToJson = encoding => string =>
  JSON.parse(Buffer.from(string, encoding).toString());
const base64ToJson = encodedToJson(base64);
const config = base64ToJson(process.env.FIREBASE_ADMIN_CONFIG);

const APP_NAME = "ihuuuuuu";
const config = {
  credential: firebaseAdmin.credential.cert(config),
  databaseURL: "https://furadeira-eletrica.firebaseio.com"
};

export default firebaseAdmin.apps.find(app => app.name === APP_NAME) ||
  firebaseAdmin.initializeApp(config, APP_NAME);
