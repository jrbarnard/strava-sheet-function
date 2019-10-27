const config = require('./src/utils/config');
const Router = require('./src/router/router');
const HttpException = require('./src/exceptions/HttpException');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = async (req, res) => {
  let router = new Router(config.get('functionName', ''));

  // Register routes
  router.get('auth', (req, res) => {
    // TODO: Process strava auth
    res.status(200).send('auth');
  });

  try {
    await router.route(req, res);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.statusCode).send({
        error: error.message,
        success: false,
      });
      return;
    }

    res.status(500).send({
      error: 'An error occurred',
      success: false,
    });
    return;
  }
};
