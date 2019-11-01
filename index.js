const Config = require('./src/utils/config');
const configBase = require('./config');
const Router = require('./src/router/router');
const HttpException = require('./src/exceptions/HttpException');
const StravaAuth = require('./src/controllers/strava/auth');
const StravaWebhook = require('./src/controllers/strava/webhook');
const GSheetsAuth = require('./src/controllers/gsheets/auth');
const { Datastore } = require('@google-cloud/datastore');
const AthleteRepository = require('./src/repositories/athlete-repository');
const FileSystem = require('./src/utils/file-system');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handle = async (req, res) => {
  // Prepare config from env and config file
  let config = new Config();
  config.setConfig(Object.assign({}, configBase, process.env));

  // Prep file system
  config.set('APP_ROOT_DIR', __dirname);
  // let fs = new FileSystem(config);

  // Gcloud datastore
  const datastore = new Datastore({
    projectId: config.get('X_GOOGLE_GCLOUD_PROJECT'),
    keyFilename: 'datastore-credentials.json'
  });

  // Register routes
  let router = new Router(config.get('FUNCTION_NAME', ''));

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
  let gsheetsAuth = new GSheetsAuth(config);
  router.group('gsheets')
    .get('auth/:test', gsheetsAuth.authRedirect.bind(gsheetsAuth))
    .get('auth/redirect', gsheetsAuth.postRedirect.bind(gsheetsAuth));

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
