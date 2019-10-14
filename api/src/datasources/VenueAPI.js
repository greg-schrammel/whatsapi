import db from '../firebase/database';

const venuesCollection = db.collection('vanues');

module.exports = {
  venue: venueId =>
    venuesCollection
      .doc(venueId)
      .get()
      .then(venue => ({ id: venue.id, ...venue.data() })),
};
