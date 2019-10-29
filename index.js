const config = require('./src/utils/config');
const Router = require('./src/router/router');
const HttpException = require('./src/exceptions/HttpException');
const StravaAuth = require('./src/controllers/strava/auth');
const StravaWebhook = require('./src/controllers/strava/webhook');
const GSheetsAuth = require('./src/controllers/gsheets/auth');
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: config.get('X_GOOGLE_GCLOUD_PROJECT'),
  keyFilename: 'datastore-credentials.json'
});
const AthleteRepository = require('./src/repositories/athlete-repository');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handle = async (req, res) => {
  let router = new Router(config.get('FUNCTION_NAME', ''));

  // Register routes

  // Strava
  let athleteRepository = new AthleteRepository(datastore);
  let stravaAuth = new StravaAuth(config, athleteRepository);
  let stravaWebhook = new StravaWebhook(config, athleteRepository);
  router.group('strava')
    .get('auth', stravaAuth.authRedirect.bind(stravaAuth))
    .get('auth/redirect', stravaAuth.postRedirect.bind(stravaAuth))
    // .get('webhook', stravaWebhook.validate.bind(stravaWebhook)) // Temporary for validation when needed
    .post('webhook', stravaWebhook.handle.bind(stravaWebhook));

  // Google Sheets
  let gsheetsAuth = new GSheetsAuth();
  router.group('gsheets')
    .get('auth', gsheetsAuth.authRedirect.bind(gsheetsAuth));

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
