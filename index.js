const config = require('./src/utils/config');
const Router = require('./src/router/router');
const HttpException = require('./src/exceptions/HttpException');
const Auth = require('./src/strava/auth');
const Client = require('./src/strava/client');

// Set up strava resources
let client = new Client(config.get('STRAVA_CLIENT_ID'));
let auth = new Auth(client, config.get('STRAVA_REDIRECT_URI'));

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = async (req, res) => {
  let router = new Router(config.get('FUNCTION_NAME', ''));

  // // TODO: REMOVE
  // router.get('testing', (req, res) => {
  //   res.status(200).send({
  //     config: config.getConfig()
  //   });
  // });

  // Register routes

  // Strava auth
  router.group('strava')
    .get('auth', (req, res) => {
      res.redirect(302, auth.getRequestUrl());
    })
    .get('auth/redirect', (req, res) => {
      // TODO: HANDLE REDIRECT FROM STRAVA AUTH AND GETTING TOKENS
      let code = req.query['code'];

      if (!code) {
        throw new HttpException('Invalid code');
      }

      // TODO: Continue
      let token = await auth.getToken(code);

      res.status(200).send(req.query);
    });

  // End register routes

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
