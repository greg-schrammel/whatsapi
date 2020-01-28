import { ApolloServer } from "apollo-server-micro";
import requireDir from "require-dir";
import firebaseAdmin from "./firebase-admin";

const modules = requireDir("../modules");
const dataSources = requireDir("../datasources");

const server = new ApolloServer({
  modules: Object.values(modules),
  dataSources: () => dataSources,
  introspection: true,
  playground: true,
  context: async ({ req }) => {
    const sessionCookie = req.headers.cookies.session;
    const user = await firebaseAdmin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    return { user };
  }
});

export default server.createHandler({ path: "/api" });
