"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
class DbConnectionList {
    static add(name, dbConnection) {
        assert(!DbConnectionList.list[name], `Db Connection "${name}" already exists`);
        DbConnectionList.list[name] = dbConnection;
    }
    static remove(name) {
        delete DbConnectionList.list[name];
        DbConnectionList.list[name] = undefined;
    }
    static get(name) {
        return DbConnectionList.list[name] ? DbConnectionList.list[name] : null;
    }
}
DbConnectionList.list = {};
exports.default = DbConnectionList;
