import * as express from 'express';
import * as Sequelize from 'sequelize';
import DbConnection from '../Connection';
import ModelRestApi from '../RestApi';
import { RestAuth } from '../RestAuth';
import * as Model from '../models/role-mapping';

export default function (db: DbConnection): express.Router {
    let router: express.Router = express.Router();
    let DbModel: Sequelize.Model<Model.Instance, Model.Attributes> = db.getConnection().models[Model.modelName];
    let modelApi = new ModelRestApi<Model.Instance, Model.Attributes>(DbModel);

    router.get('/', RestAuth.middleware('@admin', 'GET:All role-mapping'), modelApi.getAll());
    router.get('/count', RestAuth.middleware('@admin', 'GET:COUNT role-mapping'), modelApi.count());
    router.get('/:id', RestAuth.middleware('@admin', 'GET:ONE role-mapping'), modelApi.getById());
    router.post('/', RestAuth.middleware('@admin', 'CREATE role-mapping'), modelApi.create());
    router.put('/:id', RestAuth.middleware('@admin', 'UPDATE role-mapping'), modelApi.updateById());
    router.delete('/:id', RestAuth.middleware('@admin', 'DELETE role-mapping'), modelApi.deleteById());

    return router;
}
