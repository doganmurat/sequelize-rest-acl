/// <reference types="sequelize" />
import * as Sequelize from 'sequelize';
export declare const modelName = "Group";
export interface Attributes {
    id: number;
    name: string;
    comment: string;
}
export interface Instance extends Sequelize.Instance<Attributes>, Attributes {
}
export declare const define: (sequalize: Sequelize.Sequelize) => Sequelize.Model<Instance, Attributes>;
