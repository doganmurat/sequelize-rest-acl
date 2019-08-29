"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sx_sequelize_api_1 = require("sx-sequelize-api");
const RestAuth_1 = require("../RestAuth");
const role_mapping_1 = require("../models/role-mapping");
function default_1(connection) {
    let router = express.Router();
    let DbModel = role_mapping_1.default;
    let modelApi = new sx_sequelize_api_1.ModelRestApi(DbModel, connection);
    router.get('/', RestAuth_1.RestAuth.middleware('@admin', 'GET:All role-mapping'), modelApi.getAll());
    router.get('/count', RestAuth_1.RestAuth.middleware('@admin', 'GET:COUNT role-mapping'), modelApi.count());
    router.get('/:id', RestAuth_1.RestAuth.middleware('@admin', 'GET:ONE role-mapping'), modelApi.getById());
    router.post('/', RestAuth_1.RestAuth.middleware('@admin', 'CREATE role-mapping'), modelApi.create());
    router.put('/:id', RestAuth_1.RestAuth.middleware('@admin', 'UPDATE role-mapping'), modelApi.updateById());
    router.delete('/:id', RestAuth_1.RestAuth.middleware('@admin', 'DELETE role-mapping'), modelApi.deleteById());
    return router;
}
exports.default = default_1;
