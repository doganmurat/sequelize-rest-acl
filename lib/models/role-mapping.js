"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
exports.modelName = 'RoleMapping';
;
;
exports.define = (sequalize) => {
    let model = sequalize.define(exports.modelName, {
        userId: { type: Sequelize.INTEGER, allowNull: false, onDelete: 'CASCADE' },
        groupId: { type: Sequelize.INTEGER, allowNull: false, onDelete: 'CASCADE' }
    });
    model.belongsTo(sequalize.models['User'], { foreignKey: 'userId' });
    model.belongsTo(sequalize.models['Group'], { foreignKey: 'groupId' });
};
