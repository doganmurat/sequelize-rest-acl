import { Sequelize } from 'sequelize-typescript';
import User from './user';
import Group from './group';
import RoleMapping from './role-mapping';

export default function defineModels(dbConnection: Sequelize, cb: (err?: Error) => void): void {
    dbConnection.addModels([User, Group, RoleMapping]);

    dbConnection
        .sync()
        .then((): void => {
            return cb();
        })
        .catch((e): void => {
            return cb(e);
        });
}
