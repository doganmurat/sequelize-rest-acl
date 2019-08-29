"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sx_sequelize_api_1 = require("sx-sequelize-api");
const RestAuth_1 = require("../RestAuth");
const user_1 = require("../models/user");
function default_1(connection) {
    let router = express.Router();
    let DbModel = user_1.default;
    let modelApi = new sx_sequelize_api_1.ModelRestApi(DbModel, connection);
    router.get('/', RestAuth_1.RestAuth.middleware('@admin', 'GET:All user'), modelApi.getAll());
    router.get('/count', RestAuth_1.RestAuth.middleware('@admin', 'GET:COUNT user'), modelApi.count());
    router.get('/:id', RestAuth_1.RestAuth.middleware('@admin', 'GET:ONE user'), modelApi.getById());
    router.post('/', RestAuth_1.RestAuth.middleware('@admin', 'CREATE user'), modelApi.create());
    router.put('/:id', RestAuth_1.RestAuth.middleware('@admin', 'UPDATE user'), modelApi.updateById());
    router.delete('/:id', RestAuth_1.RestAuth.middleware('@admin', 'DELETE user'), modelApi.deleteById());
    return router;
}
exports.default = default_1;
