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
            this.Model
                .findById(req.params.id, req.query || {})
                .then((result: TInstance) => {
                    return res.json(result);
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    getAll(): (req: Request, res: Response, next: NextFunction) => void {
        let that = this;
        return (req: Request, res: Response, next: NextFunction) => {
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
                //include:''
            })
                .then((result: TInstance[]) => {
                    return res.json(result);
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }

        function formatIncludeStr(includeStr: string): { formattedInclude: any[], error: boolean } {
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

    count(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};

            this.Model
                .count({
                    where: where
                })
                .then((result: number) => {
                    return res.json(result);
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    create(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            this.Model
                .create(req.body)
                .then((result: TInstance) => {
                    return res.json(result.get());
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    updateById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            this.Model
                .findById(req.params.id)
                .then((record: TInstance) => {
                    if (!record)
                        return res.send({ name: 'error', message: 'Record not found!' });

                    record
                        .updateAttributes(req.body)
                        .then((result: TInstance) => {
                            return res.json(result.get());
                        })
                        .catch((err: Error) => {
                            return res.status(400).send({ name: err.name, message: err.message });
                        });
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    deleteById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            this.Model
                .destroy({ where: { id: req.params.id } })
                .then((result: number) => {
                    return res.json(result);
                })
                .catch((err: Error) => {
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }
}