import * as Sequelize from 'sequelize';

export const modelName = 'RoleMapping';

export interface Attributes {
    userId: number;
    groupId: number;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize) => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        userId: { type: Sequelize.INTEGER, allowNull: false, onDelete: 'CASCADE' },
        groupId: { type: Sequelize.INTEGER, allowNull: false, onDelete: 'CASCADE' }
    });

    model.belongsTo(sequalize.models['User'], { foreignKey: 'userId' });
    model.belongsTo(sequalize.models['Group'], { foreignKey: 'groupId' });

    return model;
};
