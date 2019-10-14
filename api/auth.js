import cookie from 'cookie';

import auth from '../firebase/auth';

export default async (req, res) => {
  const { idToken } = req.query;
  const expiresIn = 1000 * 60 * 60 * 24 * 14; // 14 days
  auth
    .createSessionCookie(idToken, { expiresIn })
    .then(sessionCookie => {
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('session', sessionCookie, {
          maxAge: expiresIn,
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production',
        }),
      );
      res.status(200).end();
    })
    .catch(e => {
      console.log(e);
      res.status(401).end();
    });
};
