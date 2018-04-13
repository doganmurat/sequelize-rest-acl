"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("./user");
const Group = require("./group");
const RoleMapping = require("./role-mapping");
exports.default = (sequelize) => {
    User.define(sequelize);
    Group.define(sequelize);
    RoleMapping.define(sequelize);
};
