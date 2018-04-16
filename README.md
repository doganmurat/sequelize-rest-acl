Rest Api + ACL (Access Control List) for Sequelize ORM
=======================================================

Create rest-api with access control list for Sequelize ORM.

> npm install git+https://github.com/doganmurat/sequelize-rest-acl.git


This module will install User,Group and RoleMapping tables automatically.

Usage example;
```
// app.ts

import * as express from 'express';
import * as http from 'http';
import { Connection, ConnectionList, RestApi, RestAuth } from 'sequelize-rest-acl';
import restApi from './restApi';

let app: express.Express = express();
app.set('port', 3000);

let dbConnection: Connection  = new Connection({database:'dbName', username:'username', password:'pass', dialect: 'mysql'});
dbConnection.connect()
  .then(() => {
    ConnectionList.add('dbName, dbConnection);  

    // RestAuth.rootMiddleware will sync User,Group & RoleMapping tables  
    app.use('/', RestAuth.rootMiddleware(dbConnection.getConnection()));

    // Rest Api
    restApi(app, dbConnection);
  })
  .catch((err: Error) => {
    logger.error(err.message);
    process.exit(-1);
  });
```
```
// restApi.ts

import { Application } from 'express';
import { Connection, AuthApi, UserApi, GroupApi, RoleMappingApi } from 'sequelize-rest-acl';
import areaApi from './area-api';

export default (app: Application, db: Connection) => {

    // login, logout & profile endpoints
    app.use('/api/auth', AuthApi(db));

    // user endpoint
    app.use('/api/user', UserApi(db));

    // group endpoint
    app.use('/api/group', GroupApi(db));

    // role-mapping endpoint
    app.use('/api/roleMapping', RoleMappingApi(db));

    // project endpoints
    app.use('/api/area', areaApi(db));
}
```
```
// area-api.ts

import * as express from 'express';
import * as Sequelize from 'sequelize';
import { RestAuth, RestApi, Connection } from 'sequelize-rest-acl';
import * as Model from './area-model';

export default function (db: Connection): express.Router {
    let router: express.Router = express.Router();
    let DbModel = Model.define(db.getConnection());
    let modelApi = new RestApi<Model.Instance, Model.Attributes>(DbModel);

    router.get('/', RestAuth.middleware('@auth', 'GET:All Area'), modelApi.getAll());
    router.get('/count', RestAuth.middleware('@auth', 'GET:COUNT Area'), modelApi.count());
    router.get('/:id', RestAuth.middleware('@auth', 'GET:ONE Area'), modelApi.getById());
    router.post('/', RestAuth.middleware('area', 'CREATE Area'), modelApi.create());
    router.put('/:id', RestAuth.middleware('area', 'UPDATE Area'), modelApi.updateById());
    router.delete('/:id', RestAuth.middleware('area', 'DELETE Area'), modelApi.deleteById());

    return router;
}
```
```
// area-model.ts

import * as Sequelize from 'sequelize';

export const modelName = 'Area';

export interface Attributes {
    name: string;
    comment: string;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize): Sequelize.Model<Instance, Attributes> => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        comment: Sequelize.STRING
    });

    return model;
};
```