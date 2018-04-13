"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
class Connection {
    constructor(options) {
        this.connection = null;
        this.connectionOptions = options;
        this.connection = new Sequelize(this.connectionOptions);
    }
    getConnection() {
        return this.connection;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.connection
                .authenticate()
                .then(() => {
                return resolve(null);
            })
                .catch((err) => {
                return reject(err);
            });
        });
    }
    disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.connection)
                resolve();
            this.connection
                .close()
                .then(() => {
                return resolve();
            })
                .catch((err) => {
                return reject(err);
            });
        });
    }
    isConnected() {
        this.connection.authenticate();
        if (!this.connection)
            return false;
        return true;
    }
}
exports.default = Connection;
