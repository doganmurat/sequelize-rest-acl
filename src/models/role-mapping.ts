import { Table, Column, Model, DataType, ForeignKey,BelongsTo} from 'sequelize-typescript';
import User from './user';
import Group from './group';

@Table({
    tableName: 'RoleMapping',
    modelName: 'RoleMapping',
    freezeTableName: true,
})
export default class RoleMapping extends Model<RoleMapping> {
    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Group)
    @Column
    groupId: number;

    @BelongsTo(() => Group)
    group: Group;
}
