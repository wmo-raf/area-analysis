/* eslint-disable func-names */
const gjv = require("geojson-validation");
const koaValidate = require("koa-validate");

(function () {
  koaValidate.Validator.prototype.isGEOJSON = function () {
    if (!this.value) {
      // not required
      return this;
    }
    if (!gjv.valid(this.value)) {
      this.addError("invalid geojson");
    }

    return this;
  };
})();
