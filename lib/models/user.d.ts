/// <reference types="sequelize" />
import * as Sequelize from 'sequelize';
export declare const modelName = "User";
export interface Attributes {
    id: number;
    username: string;
    password: string;
    name: string;
    language: string;
    dateFormat: string;
    email: string;
}
export interface Instance extends Sequelize.Instance<Attributes>, Attributes {
}
export declare const define: (sequalize: Sequelize.Sequelize) => Sequelize.Model<Instance, Attributes>;
