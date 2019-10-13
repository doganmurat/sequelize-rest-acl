/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'Area',
    modelName: 'Area',
    freezeTableName: true,
})
export default class Area extends Model<Area> {
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
