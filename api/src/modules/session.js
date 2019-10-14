import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Session {
    id: ID!
    venue: Venue!
    users: [User]!
    inVenueId: ID!
    debt: Float!
  }
  input SessionInput {
    venue: ID!
    user: ID!
    inVenueId: ID!
  }
  extend type Query {
    session: Session!
  }
  extend type Mutation {
    createOrJoinSession(session: SessionInput!): Session!
    removeUserFromSession(userRef: ID!): Session!
    # endSession(paymentConfirmation: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    session: (_root, _args, { sessionId, dataSources: { SessionAPI } }) =>
      SessionAPI.session(sessionId),
  },
  Mutation: {
    createOrJoinSession: (
      _root,
      { session },
      { dataSources: { SessionAPI } },
    ) => SessionAPI.join(session).catch(() => SessionAPI.create(session)),
    removeUserFromSession: (_root, { userRef }, ctx) =>
      ctx.dataSources.SessionAPI.removeUser(ctx.sessionId, userRef),
  },
};
