import firebaseAdmin from 'firebase-admin';
import base64ToJson from '../../shared/base64ToJson';

const config = base64ToJson(process.env.FIREBASE_ADMIN_CONFIG);

export default firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config),
  databaseURL: 'https://furadeira-eletrica.firebaseio.com',
});
