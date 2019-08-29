"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const area_api_1 = require("./area-api");
exports.default = (app, connection) => {
    // login, logout & profile endpoints
    app.use('/api/auth', __1.AuthApi(connection));
    // user endpoint
    app.use('/api/user', __1.UserApi(connection));
    // group endpoint
    app.use('/api/group', __1.GroupApi(connection));
    // role-mapping endpoint
    app.use('/api/roleMapping', __1.RoleMappingApi(connection));
    // project endpoints
    app.use('/api/area', area_api_1.default(connection));
};
