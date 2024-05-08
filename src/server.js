const Hapi = require('@hapi/hapi');
const routes = require('./routes');

/** untuk pembuatan server */
const init = async () => {
  const server = Hapi.server({
    /** port 9000 untuk tugas */
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route(routes);

  await server.start();
  console.warn(`Server berjalan pada ${server.info.uri}`);
};

init();
