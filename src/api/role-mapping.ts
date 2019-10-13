import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { ModelRestApi } from 'sx-sequelize-api';
import { RestAuth } from '../RestAuth';
import Model from '../models/role-mapping';

export default function(connection: Sequelize): express.Router {
    let router: express.Router = express.Router();
    let DbModel = Model;
    let modelApi = new ModelRestApi(DbModel, connection);

    router.get('/', RestAuth.middleware('@admin', 'GET:All role-mapping'), modelApi.getAll());
    router.get('/count', RestAuth.middleware('@admin', 'GET:COUNT role-mapping'), modelApi.count());
    router.get('/:id', RestAuth.middleware('@admin', 'GET:ONE role-mapping'), modelApi.getById());
    router.post('/', RestAuth.middleware('@admin', 'CREATE role-mapping'), modelApi.create());
    router.put('/:id', RestAuth.middleware('@admin', 'UPDATE role-mapping'), modelApi.updateById());
    router.delete('/:id', RestAuth.middleware('@admin', 'DELETE role-mapping'), modelApi.deleteById());

    return router;
}
