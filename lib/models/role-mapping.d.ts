import { Model } from 'sequelize-typescript';
import User from './user';
import Group from './group';
export default class RoleMapping extends Model<RoleMapping> {
    userId: number;
    user: User;
    groupId: number;
    group: Group;
}
