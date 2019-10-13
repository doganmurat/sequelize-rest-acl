"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sequelize_typescript_1 = require("sequelize-typescript");
const http = require("http");
const __1 = require("../");
const restApi_1 = require("./restApi");
let app = express();
let server = null;
// Db Connection
let connection = null;
let port = 3000;
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
connection = new sequelize_typescript_1.Sequelize({ dialect: 'sqlite', storage: 'db.sqlite' });
connection
    .authenticate()
    .then(() => {
    // RestAuth.rootMiddleware will sync User,Group & RoleMapping tables
    app.use('/', __1.RestAuth.rootMiddleware(connection, true));
    // Rest Api
    restApi_1.default(app, connection);
    server.listen(port);
})
    .catch((err) => {
    console.error(`DB Connection Error. Err: ${err.message}`);
    console.error('Exiting...');
    process.exit(-1);
});
