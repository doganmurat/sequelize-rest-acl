"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const RestApi_1 = require("../RestApi");
const RestAuth_1 = require("../RestAuth");
const Model = require("../models/group");
function default_1(db) {
    let router = express.Router();
    let DbModel = db.getConnection().models[Model.modelName];
    let modelApi = new RestApi_1.default(DbModel);
    router.get('/', RestAuth_1.RestAuth.middleware('@admin', 'GET:All group'), modelApi.getAll());
    router.get('/count', RestAuth_1.RestAuth.middleware('@admin', 'GET:COUNT group'), modelApi.count());
    router.get('/:id', RestAuth_1.RestAuth.middleware('@admin', 'GET:ONE group'), modelApi.getById());
    router.post('/', RestAuth_1.RestAuth.middleware('@admin', 'CREATE group'), modelApi.create());
    router.put('/:id', RestAuth_1.RestAuth.middleware('@admin', 'UPDATE group'), modelApi.updateById());
    router.delete('/:id', RestAuth_1.RestAuth.middleware('@admin', 'DELETE group'), modelApi.deleteById());
    return router;
}
exports.default = default_1;
