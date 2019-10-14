import { ApolloServer } from 'api/src/modules/node_modules/apollo-server-micro';
import requireDir from 'require-dir';
import _firebaseAdmin from '../firebase/_firebase-admin';

const modules = requireDir('../modules');
const dataSources = requireDir('../datasources');

const server = new ApolloServer({
  modules: Object.values(modules),
  dataSources: () => dataSources,
  introspection: true,
  playground: true,
  context: async ({ req }) => {
    const sessionCookie = req.headers.cookies.session;
    const user = await _firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    return { user };
  },
});

export default server.createHandler({ path: '/api' });
