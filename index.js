const config = require('./src/utils/config');
const Router = require('./src/router/router');
const HttpException = require('./src/exceptions/HttpException');
const StravaAuth = require('./src/controllers/strava/auth');
const Datastore = require('@google-cloud/datastore');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handle = async (req, res) => {
  let router = new Router(config.get('FUNCTION_NAME', ''));

  const datastore = new Datastore({
    projectId: config.get('X_GOOGLE_GCP_PROJECT'),
    keyFilename: 'datastore-credentials.json'
  });

  // Register routes

  // Strava auth
  let stravaAuth = new StravaAuth(config, datastore);
  router.group('strava')
    .get('auth', stravaAuth.authRedirect.bind(stravaAuth))
    .get('auth/redirect', stravaAuth.postRedirect.bind(stravaAuth));

  // End register routes

  try {
    await router.route(req, res);
  } catch (error) {
    console.log(error);

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
