"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Debug = require("debug");
const models_1 = require("../models");
const db_config_1 = require("./db-config");
let debug = Debug('nkt-rest-seq:test');
let sequelize = new Sequelize(db_config_1.default);
models_1.default(sequelize);
runTests();
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sequelize.drop();
        yield sequelize.sync();
        let user1 = yield sequelize.models['User'].create({ username: 'user1', password: 'pass1' });
        let user2 = yield sequelize.models['User'].create({ username: 'user2', password: 'pass2' });
        let group1 = yield sequelize.models['Group'].create({ name: 'group1' });
        let group2 = yield sequelize.models['Group'].create({ name: 'group2' });
        yield sequelize.models['RoleMapping'].create({ userId: user1.id, groupId: group1.id });
        yield sequelize.models['RoleMapping'].create({ userId: user1.id, groupId: group2.id });
        yield sequelize.models['RoleMapping'].create({ userId: user2.id, groupId: group1.id });
    });
}
