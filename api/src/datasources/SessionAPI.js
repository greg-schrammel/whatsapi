import db from '../firebase/database';
import dataWithId from '../utils/dataWithId';

const sessionCollection = db.collection('session');

module.exports = {
  session: sessionId =>
    sessionCollection
      .doc(sessionId)
      .get()
      .then(({ id, data }) => ({ id, ...data() })),
  create: session =>
    sessionCollection
      .add(session)
      .then(({ get }) => get())
      .then(({ id }) => id),
  join: session =>
    sessionCollection
      .select({
        venue: session.venue,
        inVenueId: session.inVenueId,
        completed: false,
      })
      .get()
      .then(currentSession =>
        sessionCollection
          .doc(currentSession.id)
          .update({ users: [...currentSession.users, session.user] }),
      ),
  removeUser: async (sessionId, userRef) => {
    const sessionDoc = sessionCollection.doc(sessionId);
    const session = await sessionDoc.get();
    const newUsersArray = await session
      .data()
      .users.filter(user => user !== userRef);
    await sessionDoc.update({ users: newUsersArray });
    const updatedSession = await sessionCollection.doc(sessionId).get();
    return dataWithId(updatedSession);
  },
};
