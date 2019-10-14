import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  enum Template {
    restaurant
    parking_lot
  }
  type Venue {
    name: String!
    template: Template!
  }
  extend type Query {
    venue(id: ID!): Venue
  }
`;

export const resolvers = {
  Query: {
    venue: (_root, { id }, ctx) => ctx.dataSources.VenuesAPI.venue(id),
  },
};
