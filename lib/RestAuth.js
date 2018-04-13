"use strict";
/**
 * Auth Middleware
 *
 * This module will read user token from
 * header(x-access-token) OR
 * req.body.token OR req.query.token
 * and will read user & groups from db
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const NodeCache = require("node-cache");
const Debug = require("debug");
const models_1 = require("./models");
const User = require("./models/user");
const Group = require("./models/group");
const RoleMapping = require("./models/role-mapping");
const debug = Debug('nkt-seq-rest:RestAuth');
/**
 * DB models
 * user            -> id, name, ...
 * group           -> id, name,comment, ...
 * role-mapping    -> id, userId, groupId, ...
 */
class RestAuth {
    static rootMiddleware(sequelize) {
        // define models
        models_1.default(sequelize);
        // sync db models
        sequelize
            .sync()
            .then(() => {
            debug('Db models sync completed.');
        })
            .catch((err) => {
            console.error('Db sync Error:', err);
        });
        // Create Hash Code for token
        if (!RestAuth.hashCode) {
            debug('Generating hash Code...');
            RestAuth.hashCode = crypto.randomBytes(32).toString('hex');
        }
        // Create User Cache
        if (!RestAuth.userCache) {
            debug('Generating User Cache...');
            RestAuth.userCache = new NodeCache({ stdTTL: 3 * 60 * 1000, checkperiod: 60 });
        }
        let UserModel = sequelize.models[User.modelName];
        let GroupModel = sequelize.models[Group.modelName];
        let RoleMappingModel = sequelize.models[RoleMapping.modelName];
        return (req, res, next) => {
            let accessToken = req.body.token || req.query.token || req.headers['x-access-token'];
            // If no access token return
            if (!accessToken) {
                req.currentUser = null;
                return next();
            }
            // Decrypt Token
            jsonwebtoken.verify(accessToken, RestAuth.hashCode, (err0, decoded) => {
                // Can not verify
                if (err0) {
                    req.currentUser = null;
                    debug('Can not verify token');
                    return next();
                }
                // Search Cache
                let currentUser = RestAuth.userCache.get(decoded.userId);
                if (currentUser && currentUser.user && currentUser.user.id) {
                    // user found in cache
                    debug(`User found in cache: ${currentUser.user.name}`);
                    req.currentUser = currentUser;
                    return next();
                }
                // Find User
                UserModel
                    .findById(decoded.userId)
                    .then((user) => {
                    RoleMappingModel
                        .findAll({ where: { userId: decoded.userId }, include: [{ model: GroupModel, attributes: ['name'] }] })
                        .then((roleMappings) => {
                        let groupNameArray = [];
                        for (let i = 0; i < roleMappings.length; i++)
                            groupNameArray.push(roleMappings[i].groupId.name);
                        // Save currentuser & cache
                        req.currentUser = {
                            user: { id: decoded.userId, name: user.username },
                            groups: groupNameArray
                        };
                        RestAuth.userCache.set(decoded.userId, req.currentUser);
                        return next();
                    })
                        .catch((err) => {
                        req.currentUser = null;
                        debug(`Can not query RoleMappingModel for userId:${decoded.userId}`);
                        debug(err);
                        return next();
                    });
                })
                    .catch((err) => {
                    req.currentUser = null;
                    debug(`Can not find userId ${decoded.userId}`);
                    debug(err);
                    return next();
                });
            });
        };
    }
    static middleware(permittedGroups, resourceName, isSelfFn) {
        /**
         * @all         : Everyone can access
         * @auth        : Authenticated USers can access
         * @admin       : Admin Group can access
         * @self        : Only Self Resource Permitted
         * ['GroupX']   : Named Groups can access
         */
        return (req, res, next) => {
            if (!Array.isArray(permittedGroups)) {
                switch (permittedGroups) {
                    case '@all':
                        return next();
                    case '@auth':
                        if (!req.currentUser) {
                            debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                            return next(new Error('ACCESS_ERROR'));
                        }
                        return next();
                    case '@admin':
                        if (!req.currentUser) {
                            debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                            return next(new Error('ACCESS_ERROR'));
                        }
                        if (req.currentUser.groups.indexOf('admin') < 0) {
                            debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                            return next(new Error('ACCESS_ERROR'));
                        }
                        return next();
                    case '@self':
                        if (!req.currentUser) {
                            debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                            return next(new Error('ACCESS_ERROR'));
                        }
                        isSelfFn(req, (err, result) => {
                            if (err)
                                return next(err);
                            if (!result) {
                                debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                                return next(new Error('ACCESS_ERROR'));
                            }
                            return next();
                        });
                        break;
                    default:
                        if (!req.currentUser) {
                            debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                            return next(new Error('ACCESS_ERROR'));
                        }
                        permittedGroups = [permittedGroups];
                }
            }
            if (permittedGroups !== '@self') {
                // Array of peritted groups                  
                for (let i = 0; i < permittedGroups.length; i++)
                    for (let j = 0; j < req.currentUser.groups.length; j++)
                        if (permittedGroups[i] === req.currentUser.groups[j])
                            return next();
                debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                return next(new Error('ACCESS_ERROR'));
            }
        };
    }
    static decodeValue(val, cb) {
        jsonwebtoken.verify(val, RestAuth.hashCode, cb);
    }
    static encodeValue(val, expiresIn) {
        return jsonwebtoken.sign(val, RestAuth.hashCode, { expiresIn: expiresIn | 60 * 60 * 1000 });
    }
}
RestAuth.hashCode = null;
RestAuth.userCache = null;
exports.RestAuth = RestAuth;
