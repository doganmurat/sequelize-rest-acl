"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sx_sequelize_api_1 = require("sx-sequelize-api");
const __1 = require("../");
const user_1 = require("../models/user");
const group_1 = require("../models/group");
const role_mapping_1 = require("../models/role-mapping");
const Debug = require("debug");
const debug = Debug('sx-sequelize-acl:Auth');
/**
 *
 * login, logout & profile api (change password etc..)
 */
function default_1(connection) {
    let router = express.Router();
    let DbModel = user_1.default;
    let GroupDbModel = group_1.default;
    let RoleMappingDbModel = role_mapping_1.default;
    let modelApi = new sx_sequelize_api_1.ModelRestApi(DbModel, connection);
    // login, logout
    router.post('/login', __1.RestAuth.middleware('@all', 'LOGIN'), login);
    router.post('/logout', __1.RestAuth.middleware('@auth', 'LOGOUT'), logout);
    // Profile get, update
    router.get('/:id', __1.RestAuth.middleware('@self', 'GET profile', isSelfFn), modelApi.getById());
    router.put('/:id', __1.RestAuth.middleware('@self', 'UPDATE profile', isSelfFn), modelApi.updateById());
    return router;
    function login(req, res, next) {
        DbModel.findOne({ where: { username: req.body.username } })
            .then((user) => {
            if (!user) {
                debug(`Could not find username with ${req.body.username}`);
                return next(new Error('LOGIN_FAILED'));
            }
            if (req.body.password !== user.password) {
                debug(`Wrong password for username with ${req.body.username}`);
                return next(new Error('LOGIN_FAILED'));
            }
            RoleMappingDbModel.findAll({
                where: { userId: user.id },
                include: [{ model: GroupDbModel, attributes: ['name'] }],
            })
                .then((roleMappings) => {
                let groupNameArray = [];
                for (let i = 0; i < roleMappings.length; i++)
                    groupNameArray.push(roleMappings[i].group.name);
                debug(`${user.username} logged in.`);
                debug(`user groups: ${groupNameArray}`);
                return res.json({
                    token: __1.RestAuth.encodeValue({ userId: user.id }),
                    userInfo: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        lang: user.language,
                        dateFormat: user.dateFormat,
                    },
                    groups: groupNameArray,
                });
            })
                .catch((err) => {
                debug(`Can not query RoleMappingModel for userId:${user.id}`);
                debug(err);
                return next();
            });
        })
            .catch((err) => {
            debug(`Can not query UserModel for username:${req.body.username}`);
            debug(err);
            return next(new Error('LOGIN_FAILED'));
        });
    }
    function logout(req, res) {
        // Nothing to do
        res.json(true);
    }
    function isSelfFn(req, cb) {
        return cb(null, req.currentUser.user.id + '' === req.params.id);
    }
}
exports.default = default_1;
