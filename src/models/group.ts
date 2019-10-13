/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'Group',
    modelName: 'Group',
    freezeTableName: true,
})
export default class Group extends Model<Group> {
    @Column({
        type: DataType.STRING(128),
        allowNull: false,
        unique: true,
    })
    name: string;

    @Column({
        type: DataType.STRING(128),
    })
    comment: string;
}
