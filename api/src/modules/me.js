import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type User {
    name: String!
    email: String!
  }
  extend type Query {
    me: User!
  }
`;

export const resolvers = {
  Query: {
    me: (_root, _args, { userId, dataSources: { UserAPI } }) => {
      return UserAPI.user(userId);
    },
  },
};
