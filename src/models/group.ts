import * as Sequelize from 'sequelize';

export const modelName = 'Group';

export interface Attributes {
    id: number;
    name: string;
    comment: string;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize) => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        comment: Sequelize.STRING
    });
};