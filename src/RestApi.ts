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
const debug = Debug('nkt-seq-rest:RestApi');

export default class ModelRestApi<TInstance extends Sequelize.Instance<TAttributes>, TAttributes> {
    private Model: Sequelize.Model<TInstance, TAttributes> = null;

    constructor(Model: Sequelize.Model<TInstance, TAttributes>) {
        this.Model = Model;
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
        return (req: Request, res: Response, next: NextFunction) => {
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
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