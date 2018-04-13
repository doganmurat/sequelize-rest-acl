import * as Sequelize from 'sequelize';
import * as User from './user';
import * as Group from './group';
import * as RoleMapping from './role-mapping';

export default (sequelize: Sequelize.Sequelize) => {
    User.define(sequelize);
    Group.define(sequelize);
    RoleMapping.define(sequelize);
};