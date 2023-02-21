const logger = require("logger");
const db = require("db");
const mc = require("cache");

const createQuery = (layerConfig, geojsonStr) => {
  let { tableName, geomField, columns } = layerConfig;

  const columnsStr = columns.join(",");

  const query = `SELECT ${columnsStr}, ST_AsGeoJSON(${geomField})::jsonb as geom FROM ${tableName} WHERE ST_Intersects(${geomField} ,ST_GeomFromGeoJSON('${geojsonStr}'))`;

  return query;
};

class AreaAnalysisService {
  static async getIntersectingRows(layerConfig, geojsonFeatureGeom, geojsonId) {
    logger.debug(`Getting intersecting data for layer: ${layerConfig.label}`);

    const featureGeom = JSON.stringify(geojsonFeatureGeom);
    const query = createQuery(layerConfig, featureGeom);

    let cacheKey = geojsonId ? `${geojsonId}-${layerConfig.id}` : null;

    try {
      if (cacheKey && mc) {
        const data = await mc.get(cacheKey).catch((err) => {
          logger.error(err);
          // Do Nothing
        });

        if (data && data.value) {
          logger.debug("Got Cache");

          // convert back to json
          return JSON.parse(data.value);
        }
      }

      const s = await db.query(query);

      const rows = s.rows;

      if (cacheKey && mc) {
        // convert to string for saving
        const rowsStr = JSON.stringify(rows);

        await mc
          .set(cacheKey, rowsStr)
          .then(() => {
            logger.debug("Cache Set", cacheKey);
          })
          .catch((err) => {
            // Fail silently
            logger.error(err);
          });
      }

      return rows;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

module.exports = AreaAnalysisService;
