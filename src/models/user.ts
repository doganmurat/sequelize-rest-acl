import * as Sequelize from 'sequelize';

export const modelName = 'User';

export interface Attributes {
    id: number;
    username: string;
    password: string;
    email: string;
};

export interface Instance extends Sequelize.Instance<Attributes>, Attributes { };

export const define = (sequalize: Sequelize.Sequelize) => {
    let model = sequalize.define<Instance, Attributes>(modelName, {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        email: Sequelize.STRING
    });

    return model;
};
