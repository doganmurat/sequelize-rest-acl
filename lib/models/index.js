"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./user");
const group_1 = require("./group");
const role_mapping_1 = require("./role-mapping");
function defineModels(dbConnection, cb) {
    dbConnection.addModels([user_1.default, group_1.default, role_mapping_1.default]);
    dbConnection
        .sync()
        .then(() => {
        return cb();
    })
        .catch((e) => {
        return cb(e);
    });
}
exports.default = defineModels;
