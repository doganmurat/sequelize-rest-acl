"use strict";
/**
 * err format;
 * {
 *      message:'Err message',
 *      name ' 'ERROR_CODE,
 *      ...
 * }
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Debug = require("debug");
const debug = Debug('sequelize-rest-acl:RestApi');
class ModelRestApi {
    constructor(Model) {
        this.Model = null;
        this.Model = Model;
    }
    getById() {
        return (req, res, next) => {
            this.Model
                .findById(req.params.id, req.query || {})
                .then((result) => {
                return res.json(result);
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    getAll() {
        return (req, res, next) => {
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            this.Model.findAll({
                where: where,
                offset: req.query.offset && !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0,
                limit: req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : 0,
                order: req.query.order ? JSON.parse(req.query.order) : [],
                attributes: req.query.attributes ? JSON.parse(req.query.attributes) : undefined,
            })
                .then((result) => {
                return res.json(result);
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    count() {
        return (req, res, next) => {
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            this.Model
                .count({
                where: where
            })
                .then((result) => {
                return res.json(result);
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    create() {
        return (req, res, next) => {
            this.Model
                .create(req.body)
                .then((result) => {
                return res.json(result.get());
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    updateById() {
        return (req, res, next) => {
            this.Model
                .findById(req.params.id)
                .then((record) => {
                if (!record)
                    return res.send({ name: 'error', message: 'Record not found!' });
                record
                    .updateAttributes(req.body)
                    .then((result) => {
                    return res.json(result.get());
                })
                    .catch((err) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    deleteById() {
        return (req, res, next) => {
            this.Model
                .destroy({ where: { id: req.params.id } })
                .then((result) => {
                return res.json(result);
            })
                .catch((err) => {
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
}
exports.default = ModelRestApi;
