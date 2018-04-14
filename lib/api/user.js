"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const RestApi_1 = require("../RestApi");
const RestAuth_1 = require("../RestAuth");
const Model = require("../models/user");
function default_1(db) {
    let router = express.Router();
    let DbModel = db.getConnection().models[Model.modelName];
    let modelApi = new RestApi_1.default(DbModel);
    router.get('/', RestAuth_1.RestAuth.middleware('@admin', 'GET:All user'), modelApi.getAll());
    router.get('/count', RestAuth_1.RestAuth.middleware('@admin', 'GET:COUNT user'), modelApi.count());
    router.get('/:id', RestAuth_1.RestAuth.middleware('@admin', 'GET:ONE user'), modelApi.getById());
    router.post('/', RestAuth_1.RestAuth.middleware('@admin', 'CREATE user'), modelApi.create());
    router.put('/:id', RestAuth_1.RestAuth.middleware('@admin', 'UPDATE user'), modelApi.updateById());
    router.delete('/:id', RestAuth_1.RestAuth.middleware('@admin', 'DELETE user'), modelApi.deleteById());
    return router;
}
exports.default = default_1;
