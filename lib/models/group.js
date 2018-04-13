"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.modelName = 'Group';
;
;
exports.define = (sequalize) => {
    let model = sequalize.define(exports.modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        comment: Sequelize.STRING
    });
};
