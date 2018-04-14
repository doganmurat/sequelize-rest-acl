/// <reference types="sequelize" />
/// <reference types="express" />
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
export default class ModelRestApi<TInstance extends Sequelize.Instance<TAttributes>, TAttributes> {
    private Model;
    constructor(Model: Sequelize.Model<TInstance, TAttributes>);
    getById(): (req: Request, res: Response, next: NextFunction) => void;
    getAll(): (req: Request, res: Response, next: NextFunction) => void;
    count(): (req: Request, res: Response, next: NextFunction) => void;
    create(): (req: Request, res: Response, next: NextFunction) => void;
    updateById(): (req: Request, res: Response, next: NextFunction) => void;
    deleteById(): (req: Request, res: Response, next: NextFunction) => void;
}
