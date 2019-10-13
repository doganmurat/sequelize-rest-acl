import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { ModelRestApi } from 'sx-sequelize-api';
import { RestAuth } from '../RestAuth';
import Model from '../models/user';

export default function(connection: Sequelize): express.Router {
    let router: express.Router = express.Router();
    let DbModel = Model;
    let modelApi = new ModelRestApi(DbModel, connection);

    router.get('/', RestAuth.middleware('@admin', 'GET:All user'), modelApi.getAll());
    router.get('/count', RestAuth.middleware('@admin', 'GET:COUNT user'), modelApi.count());
    router.get('/:id', RestAuth.middleware('@admin', 'GET:ONE user'), modelApi.getById());
    router.post('/', RestAuth.middleware('@admin', 'CREATE user'), modelApi.create());
    router.put('/:id', RestAuth.middleware('@admin', 'UPDATE user'), modelApi.updateById());
    router.delete('/:id', RestAuth.middleware('@admin', 'DELETE user'), modelApi.deleteById());

    return router;
}
