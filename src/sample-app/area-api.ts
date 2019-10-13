import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { ModelRestApi } from 'sx-sequelize-api';
import { RestAuth } from '../';
import Model from './area-model';

export default function(connection: Sequelize): express.Router {
    let router: express.Router = express.Router();
    let DbModel = Model;
    let modelApi = new ModelRestApi(DbModel, connection);

    router.get('/', RestAuth.middleware('@auth', 'GET:All Area'), modelApi.getAll());
    router.get('/count', RestAuth.middleware('@auth', 'GET:COUNT Area'), modelApi.count());
    router.get('/:id', RestAuth.middleware('@auth', 'GET:ONE Area'), modelApi.getById());
    router.post('/', RestAuth.middleware('area', 'CREATE Area'), modelApi.create());
    router.put('/:id', RestAuth.middleware('area', 'UPDATE Area'), modelApi.updateById());
    router.delete('/:id', RestAuth.middleware('area', 'DELETE Area'), modelApi.deleteById());

    return router;
}
