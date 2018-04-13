/// <reference types="sequelize" />
import * as Sequelize from 'sequelize';
export declare const modelName = "RoleMapping";
export interface Attributes {
    userId: number;
    groupId: number;
}
export interface Instance extends Sequelize.Instance<Attributes>, Attributes {
}
export declare const define: (sequalize: Sequelize.Sequelize) => void;
