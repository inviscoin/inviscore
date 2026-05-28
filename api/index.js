const server = require("../dist/server.cjs");

module.exports = async function (req, res) {
  // If the server exports a default async function, await it.
  const app = await (server.default || server)(req, res);
  return app;
};
