ACL (Access Control List) for Sequelize ORM
=======================================================

Create rest-api with access control list for Sequelize ORM.

> npm install sx-sequelize-acl --save


This module will install User,Group and RoleMapping tables automatically.

Usage example; (See src/sample-app folder)
```javascript
// app.ts

import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import * as http from 'http';
import { RestAuth } from '../../';
import restApi from './restApi';

let app: express.Express = express();
let server: http.Server = null;

// Db Connection
let connection: Sequelize = null;
let port: number = 3000;

app = express();
app.set('port', port);

server = http.createServer(app);
server.on('error', (err) => {
    throw err;
});
server.on('listening', () => {
    console.info('********** Server Listening on port ' + port + ' *********');
});

// Db Connect
connection = new Sequelize({ dialect: 'sqlite', storage: 'db.sqlite' });
connection
    .authenticate()
    .then((): void => {
        // RestAuth.rootMiddleware will sync User,Group & RoleMapping tables  
        app.use('/', RestAuth.rootMiddleware(connection, true));

        // Rest Api
        restApi(app, connection);

        server.listen(port);
    })
    .catch((err: Error): void => {
        console.error(`DB Connection Error. Err: ${err.message}`);
        console.error('Exiting...');
        process.exit(-1);
    });
```
---
```javascript
// restApi.ts

import { Application } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { AuthApi, UserApi, GroupApi, RoleMappingApi } from '../../';
import areaApi from './area-api';

export default (app: Application, connection: Sequelize) => {

    // login, logout & profile endpoints
    app.use('/api/auth', AuthApi(connection));

    // user endpoint
    app.use('/api/user', UserApi(connection));

    // group endpoint
    app.use('/api/group', GroupApi(connection));

    // role-mapping endpoint
    app.use('/api/roleMapping', RoleMappingApi(connection));

    // project endpoints
    app.use('/api/area', areaApi(connection));
}
```
---
```javascript
// area-api.ts

import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { ModelRestApi } from 'sx-sequelize-api';
import { RestAuth } from '../..';
import Model from './area-model';

export default function (connection: Sequelize): express.Router {
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
```
---
```javascript
// area-model.ts

import { Table, Column, Model, DataType} from 'sequelize-typescript';

@Table({
    tableName: 'Area',
    modelName: 'Area',
    freezeTableName: true,
})
export default class Area extends Model<Area> {
    @Column({
        type: DataType.STRING(128),
        allowNull:false,
        unique:true
    })
    name: string;

    @Column({
        type: DataType.STRING(128),
    })
    comment: string;
}
```

## Debugging
> Project is using debug package. Start your project with DEBUG=sx-sequelize-acl* node YOUR-APP