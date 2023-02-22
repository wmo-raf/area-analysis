const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const koaLogger = require("koa-logger");
const koaSimpleHealthCheck = require("koa-simple-healthcheck");

const loader = require("loader");
const ErrorSerializer = require("serializers/errorSerializer");
const logger = require("logger");
const config = require("config");
const koaValidate = require("koa-validate");
const cors = require("@koa/cors");

async function init() {
  return new Promise((resolve, reject) => {
    // instance of koa
    const app = new Koa();

    app.use(koaLogger());

    app.use(cors());

    app.use(koaSimpleHealthCheck());

    app.use(
      bodyParser({
        jsonLimit: "50mb",
      })
    );

    // catch errors and send in jsonapi standard. Always return vnd.api+json
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (inErr) {
        let error = inErr;
        try {
          error = JSON.parse(inErr);
        } catch (e) {
          logger.debug("Could not parse error message - is it JSON?: ", inErr);
          error = inErr;
        }
        ctx.status = error.status || ctx.status || 500;
        if (ctx.status >= 500) {
          logger.error(error);
        } else {
          logger.info(error);
        }

        ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
        if (process.env.NODE_ENV === "prod" && ctx.status === 500) {
          ctx.body = "Unexpected error";
        }
        ctx.response.type = "application/vnd.api+json";
      }
    });

    // load custom validator
    require("validators/geoJSONValidator");
    koaValidate(app);

    // load routes
    loader.loadRoutes(app);

    // get port of environment, if not exist obtain of the config.
    // In production environment, the port must be declared in environment variable
    const port = process.env.PORT || config.get("service.port");

    app.listen(process.env.PORT, () => {
      logger.info(`Server started in port:${port}`);
      resolve({ app });
    });
  });
}

module.exports = init;
