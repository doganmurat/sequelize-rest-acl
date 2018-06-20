/**
 * err format;
 * {
 *      message:'Err message',
 *      name ' 'ERROR_CODE,
 *      ...
 * }
 */

/**
 *  Request Query format

 {
   where:{},
   order:[],
   offset:10,
   limit: 10,
   attributes:[],
   include:[]

 }

 */

import { Request, Response, NextFunction } from 'express';
import * as Sequelize from 'sequelize';
import * as Debug from 'debug';
const debug = Debug('sequelize-rest-acl:RestApi');

export default class ModelRestApi<TInstance extends Sequelize.Instance<TAttributes>, TAttributes> {
    private Model: Sequelize.Model<TInstance, TAttributes> = null;
    private sequelizeModelList: Object = null;

    constructor(Model: Sequelize.Model<TInstance, TAttributes>, sequelizeModelList: Object) {
        this.Model = Model;
        this.sequelizeModelList = sequelizeModelList;
    }

    getById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`getById() with params:${JSON.stringify(req.params)} query:${JSON.stringify(req.query || {})}`);
            this.Model
                .findById(req.params.id, req.query || {})
                .then((result: TInstance) => {
                    debug(`getById() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`getById() error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    getAll(): (req: Request, res: Response, next: NextFunction) => void {
        let that = this;
        return (req: Request, res: Response, next: NextFunction) => {
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
                .then((result: TInstance[]) => {
                    debug(`getAll() calling findAll() returned ${result.length} items`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`getAll() calling findAll() error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }

        function formatIncludeStr(includeStr: any[]): { formattedInclude: any[], error: boolean } {
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
                    include: undefined
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

    count(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`count() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};

            this.Model
                .count({
                    where: where
                })
                .then((result: number) => {
                    debug(`count() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`count() error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    create(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`create() with body:${JSON.stringify(req.body || {})}`);
            this.Model
                .create(req.body)
                .then((result: TInstance) => {
                    debug(`create() result:${JSON.stringify(result)}`);
                    return res.json(result.get());
                })
                .catch((err: Error) => {
                    debug(`create() error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    updateById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`updateById() with params:${JSON.stringify(req.params)} body:${JSON.stringify(req.body || {})}`);
            this.Model
                .findById(req.params.id)
                .then((record: TInstance) => {
                    if (!record) {
                        debug(`updateById() Could not find record.`);
                        return res.send({ name: 'error', message: 'Record not found!' });
                    }

                    record
                        .updateAttributes(req.body)
                        .then((result: TInstance) => {
                            debug(`updateById() result:${JSON.stringify(result)}`);
                            return res.json(result.get());
                        })
                        .catch((err: Error) => {
                            debug(`updateById()  updateAttributes error. Err:${JSON.stringify(err)}`);
                            return res.status(400).send({ name: err.name, message: err.message });
                        });
                })
                .catch((err: Error) => {
                    debug(`updateById() findById error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    deleteById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug('deleteById() with params:${JSON.stringify(req.params)}');
            this.Model
                .destroy({ where: { id: req.params.id } })
                .then((result: number) => {
                    debug(`deleteById() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`deleteById() error. Err:${JSON.stringify(err)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }
}