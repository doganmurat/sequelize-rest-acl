import { Application } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { AuthApi, UserApi, GroupApi, RoleMappingApi } from '../';
import areaApi from './area-api';

export default (app: Application, connection: Sequelize): void => {
    // login, logout & profile endpoints
    app.use('/api/auth', AuthApi(connection));

    // user endpoint
    app.use('/api/user', UserApi(connection));

    // group endpoint
    app.use('/api/group', GroupApi(connection));

    // role-mapping endpoint
    app.use('/api/roleMapping', RoleMappingApi(connection));

    // project endpoints
    app.use('/api/area', areaApi(connection));
};
