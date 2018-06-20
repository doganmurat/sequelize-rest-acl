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
            debug(`getById() with params:${JSON.stringify(req.params)} query:${JSON.stringify(req.query || {})}`);
            this.Model
                .findById(req.params.id, req.query || {})
                .then((result) => {
                debug(`getById() result:${JSON.stringify(result)}`);
                return res.json(result);
            })
                .catch((err) => {
                debug(`getById() error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    getAll() {
        let that = this;
        return (req, res, next) => {
            debug(`getAll() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let includeFnResult = formatIncludeStr(req.query && req.query.include ? JSON.parse(req.query.include) : []);
            if (includeFnResult.error) {
                debug('getAll() include format error.');
                return res.status(400).send({ name: 'WRONG_FORMAT', message: 'Include Format Error' });
            }
            let filter = {
                where: where,
                offset: req.query.offset && !isNaN(req.query.offset) ? parseInt(req.query.offset) : undefined,
                limit: req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : undefined,
                order: req.query.order ? JSON.parse(req.query.order) : undefined,
                attributes: req.query.attributes ? JSON.parse(req.query.attributes) : undefined,
                include: includeFnResult.formattedInclude
            };
            debug(`getAll() calling findAll() with filter: ${JSON.stringify(filter)}`);
            this.Model.findAll(filter)
                .then((result) => {
                debug(`getAll() calling findAll() returned ${result.length} items`);
                return res.json(result);
            })
                .catch((err) => {
                debug(`getAll() calling findAll() error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
        function formatIncludeStr(includeStr) {
            if (!Array.isArray(includeStr)) {
                debug(`formatIncludeStr() Format error. Expecting array. includeStr:${JSON.stringify(includeStr)}`);
                return { formattedInclude: null, error: true };
            }
            let include = [];
            for (let i = 0; i < includeStr.length; i++) {
                debug(`formatIncludeStr() formatting include item. includeStr[i]:${JSON.stringify(includeStr[i])}`);
                let includeItem = {
                    model: that.sequelizeModelList[includeStr[i].model],
                    as: includeStr[i].as ? includeStr[i].as : undefined,
                    attributes: includeStr[i].attributes ? includeStr[i].attributes : undefined,
                    where: includeStr[i].where ? includeStr[i].where : undefined
                };
                if (includeStr[i].include) {
                    let result = formatIncludeStr(includeStr[i].include);
                    if (result.error)
                        return { formattedInclude: null, error: true };
                    includeItem.include = result.formattedInclude;
                }
                debug(`formatIncludeStr() formatted include item. includeItem:${JSON.stringify(includeItem)}`);
                include.push(includeItem);
            }
            return { formattedInclude: include, error: false };
        }
    }
    count() {
        return (req, res, next) => {
            debug(`count() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            this.Model
                .count({
                where: where
            })
                .then((result) => {
                debug(`count() result:${JSON.stringify(result)}`);
                return res.json(result);
            })
                .catch((err) => {
                debug(`count() error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    create() {
        return (req, res, next) => {
            debug(`create() with body:${JSON.stringify(req.body || {})}`);
            this.Model
                .create(req.body)
                .then((result) => {
                debug(`create() result:${JSON.stringify(result)}`);
                return res.json(result.get());
            })
                .catch((err) => {
                debug(`create() error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    updateById() {
        return (req, res, next) => {
            debug(`updateById() with params:${JSON.stringify(req.params)} body:${JSON.stringify(req.body || {})}`);
            this.Model
                .findById(req.params.id)
                .then((record) => {
                if (!record) {
                    debug(`updateById() Could not find record.`);
                    return res.send({ name: 'error', message: 'Record not found!' });
                }
                record
                    .updateAttributes(req.body)
                    .then((result) => {
                    debug(`updateById() result:${JSON.stringify(result)}`);
                    return res.json(result.get());
                })
                    .catch((err) => {
                    debug(`updateById()  updateAttributes error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
            })
                .catch((err) => {
                debug(`updateById() findById error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
    deleteById() {
        return (req, res, next) => {
            debug('deleteById() with params:${JSON.stringify(req.params)}');
            this.Model
                .destroy({ where: { id: req.params.id } })
                .then((result) => {
                debug(`deleteById() result:${JSON.stringify(result)}`);
                return res.json(result);
            })
                .catch((err) => {
                debug(`deleteById() error. Err:${JSON.stringify(err)}`);
                return res.status(400).send({ name: err.name, message: err.message });
            });
        };
    }
}
exports.default = ModelRestApi;
