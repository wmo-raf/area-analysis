/* eslint-disable valid-typeof */
const Router = require("@koa/router");
const logger = require("logger");

const ErrorSerializer = require("serializers/errorSerializer");
const AreaAnalysisService = require("services/areaAnalysisService");

const layers = require("layers");

const router = new Router({
  prefix: "/area",
});

class AreaAnalysisRouter {
  static async getIntersectingData(ctx) {
    ctx.checkBody("geojson").notEmpty().isGEOJSON();

    ctx.checkQuery("layer").notEmpty();

    if (ctx.errors) {
      logger.debug("errors ", ctx.errors);
      ctx.body = ErrorSerializer.serializeValidationBodyErrors(ctx.errors);
      ctx.status = 400;
      return;
    }

    const { geojson } = ctx.request.body;
    const { layer } = ctx.request.query;

    const feature = geojson.features[0];

    const layerConfig = layers[layer];

    if (!layerConfig) {
      const message = `uknown layer: ${layer}`;
      logger.debug("error ", message);
      ctx.body = ErrorSerializer.serializeError(400, message);
      ctx.status = 400;
      return;
    }

    const data = await AreaAnalysisService.getIntersectingRows(
      layerConfig,
      feature.geometry
    );

    ctx.body = data;
  }
}

router.post("/intersect", AreaAnalysisRouter.getIntersectingData);

module.exports = router;
