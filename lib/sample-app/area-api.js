"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sx_sequelize_api_1 = require("sx-sequelize-api");
const __1 = require("../");
const area_model_1 = require("./area-model");
function default_1(connection) {
    let router = express.Router();
    let DbModel = area_model_1.default;
    let modelApi = new sx_sequelize_api_1.ModelRestApi(DbModel, connection);
    router.get('/', __1.RestAuth.middleware('@auth', 'GET:All Area'), modelApi.getAll());
    router.get('/count', __1.RestAuth.middleware('@auth', 'GET:COUNT Area'), modelApi.count());
    router.get('/:id', __1.RestAuth.middleware('@auth', 'GET:ONE Area'), modelApi.getById());
    router.post('/', __1.RestAuth.middleware('area', 'CREATE Area'), modelApi.create());
    router.put('/:id', __1.RestAuth.middleware('area', 'UPDATE Area'), modelApi.updateById());
    router.delete('/:id', __1.RestAuth.middleware('area', 'DELETE Area'), modelApi.deleteById());
    return router;
}
exports.default = default_1;
