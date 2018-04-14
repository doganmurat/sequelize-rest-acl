"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.modelName = 'User';
;
;
exports.define = (sequalize) => {
    let model = sequalize.define(exports.modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        name: Sequelize.STRING,
        language: Sequelize.STRING,
        dateFormat: Sequelize.STRING,
        email: Sequelize.STRING
    });
    return model;
};
