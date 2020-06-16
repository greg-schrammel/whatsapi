const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    env: {
      WS_URL: isDev ? "ws://127.0.0.1:3001/w" : "ilikebread.heroku.com",
    },
  };
};
