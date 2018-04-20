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
    constructor(Model, sequelizeModelList) {
        this.Model = null;
        this.sequelizeModelList = null;
        this.Model = Model;
        this.sequelizeModelList = sequelizeModelList;
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
        let that = this;
        return (req, res, next) => {
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let includeStr = req.query && req.query.where ? JSON.parse(req.query.include) : [];
            if (!Array.isArray(includeStr)) {
                return res.status(400).send({ name: 'FORMAT_ERROR', message: 'include option should be an array' });
            }
            let include = [];
            for (let i = 0; i < includeStr.length; i++) {
                let includeItem = { model: this.sequelizeModelList[includeStr[i].model], as: undefined, include: undefined };
                includeItem.as = includeStr[i].as ? includeStr[i].as : undefined;
                if (includeStr[i].include) {
                    if (!Array.isArray(includeStr[i].include)) {
                        return res.status(400).send({ name: 'FORMAT_ERROR', message: 'include option should be an array' });
                    }
                }
                include.push(includeItem);
            }
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
        function formatIncludeStr(includeStr) {
            if (!Array.isArray(includeStr)) {
                return { formattedInclude: null, error: true };
            }
            let include = [];
            for (let i = 0; i < includeStr.length; i++) {
                let includeItem = { model: that.sequelizeModelList[includeStr[i].model], as: undefined, include: undefined };
                includeItem.as = includeStr[i].as ? includeStr[i].as : undefined;
                if (includeStr[i].include) {
                    let result = formatIncludeStr(includeStr[i].include);
                    if (result.error)
                        return { formattedInclude: null, error: true };
                    includeItem.include = result.formattedInclude;
                }
                include.push(includeItem);
            }
            return { formattedInclude: include, error: false };
        }
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
