import * as express from 'express';
import { Sequelize } from 'sequelize-typescript';
import * as http from 'http';
import { RestAuth } from '../';
import restApi from './restApi';

let app: express.Express = express();
let server: http.Server = null;

// Db Connection
let connection: Sequelize = null;
let port = 3000;

app = express();
app.set('port', port);

server = http.createServer(app);
server.on('error', (err): void => {
    throw err;
});
server.on('listening', (): void => {
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
