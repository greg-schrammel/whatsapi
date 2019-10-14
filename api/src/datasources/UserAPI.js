import auth from '../firebase/auth';

module.exports = {
  user: userId => auth.getUser(userId),
};
