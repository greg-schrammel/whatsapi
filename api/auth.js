import cookie from "cookie";

import firebaseAdmin from "./firebase-admin";

export default async (req, res) => {
  const { idToken } = req.query;
  const expiresIn = 1000 * 60 * 60 * 24 * 14; // 14 days
  firebaseAdmin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(sessionCookie => {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("session", sessionCookie, {
          maxAge: expiresIn,
          httpOnly: process.env.NODE_ENV === "production",
          secure: process.env.NODE_ENV === "production"
        })
      );
      res.status(200).end();
    })
    .catch(e => {
      res.status(401).end();
    });
};
