/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'User',
    modelName: 'User',
    freezeTableName: true,
})
export default class User extends Model<User> {
    @Column({
        type: DataType.STRING(128),
        allowNull: false,
        unique: true,
    })
    username: string;

    @Column({
        type: DataType.STRING(128),
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataType.STRING(128),
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.STRING(128),
    })
    language: string;

    @Column({
        type: DataType.STRING(128),
    })
    dateFormat: string;

    @Column({
        type: DataType.STRING(128),
    })
    email: string;
}
