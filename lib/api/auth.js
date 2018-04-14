"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const _1 = require("../");
const UserModel = require("../models/user");
const GroupModel = require("../models/group");
const RoleMappingModel = require("../models/role-mapping");
const Debug = require("debug");
const debug = Debug('nkt-seq-rest:Auth');
/**
 *
 * login, logout & profile api (change password etc..)
 */
function default_1(db) {
    let router = express.Router();
    let DbModel = db.getConnection().models[UserModel.modelName];
    let GroupDbModel = db.getConnection().models[GroupModel.modelName];
    let RoleMappingDbModel = db.getConnection().models[RoleMappingModel.modelName];
    let modelApi = new _1.RestApi(DbModel);
    // login, logout
    router.post('/login', _1.RestAuth.middleware('@all', 'LOGIN'), login);
    router.post('/logout', _1.RestAuth.middleware('@auth', 'LOGOUT'), logout);
    // Profile get, update
    router.get('/:id', _1.RestAuth.middleware('@self', 'GET profile', isSelfFn), modelApi.getById());
    router.put('/:id', _1.RestAuth.middleware('@self', 'UPDATE profile', isSelfFn), modelApi.updateById());
    return router;
    function login(req, res, next) {
        DbModel
            .findOne({ where: { username: req.body.username } })
            .then((user) => {
            if (!user)
                return next(new Error('LOGIN_FAILED'));
            if (req.body.password !== user.password)
                return next(new Error('LOGIN_FAILED'));
            RoleMappingDbModel
                .findAll({ where: { userId: user.id }, include: [{ model: GroupDbModel, attributes: ['name'] }] })
                .then((roleMappings) => {
                let groupNameArray = [];
                for (let i = 0; i < roleMappings.length; i++)
                    groupNameArray.push(roleMappings[i].groupId.name);
                debug(`${user.username} logged in.`);
                return res.json({
                    token: _1.RestAuth.encodeValue({ userId: user.id }),
                    userInfo: {
                        _id: user.id,
                        username: user.username,
                        name: user.username,
                        lang: user.language,
                        dateFormat: user.dateFormat
                    },
                    groups: groupNameArray
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
    function logout(req, res, next) {
        // Nothing to do
        res.json(true);
    }
    function isSelfFn(req, cb) {
        return cb(null, req.currentUser.user.id === req.params.id);
    }
}
exports.default = default_1;
