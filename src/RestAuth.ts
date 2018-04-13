/**
 * Auth Middleware
 * 
 * This module will read user token from 
 * header(x-access-token) OR
 * req.body.token OR req.query.token
 * and will read user & groups from db
 */

import * as assert from 'assert';
import * as crypto from 'crypto';
import * as jsonwebtoken from 'jsonwebtoken';
import * as NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';
import * as Sequelize from 'sequelize';
import * as Debug from 'debug';
import defineModels from './models';
import * as User from './models/user';
import * as Group from './models/group';
import * as RoleMapping from './models/role-mapping';

const debug = Debug('nkt-seq-rest:RestAuth');

/**
 * User Data Format;
  
        req.currentUser = {
            user: {
                id: '',
                name: ''
            },
            groups: ['Group A', 'Group B']
        };
*/
export interface ICurrentUser {
    user: {
        id: string | number;
        name: string;
    },
    groups: string[]
}

export interface RequestWithAuth extends Request {
    currentUser: null | ICurrentUser;
}

/**
 * DB models
 * user            -> id, name, ...
 * group           -> id, name,comment, ...
 * role-mapping    -> id, userId, groupId, ...
 */

export class RestAuth {
    private static hashCode: string | Buffer = null;
    private static userCache: NodeCache = null;

    static rootMiddleware(sequelize: Sequelize.Sequelize):
        (req: Request, res: Response, next: NextFunction) => void {

        // define models
        defineModels(sequelize);

        // sync db models
        sequelize
            .sync()
            .then(() => {
                debug('Db models sync completed.');
            })
            .catch((err: Error) => {
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

        let UserModel: Sequelize.Model<User.Instance, User.Attributes> = sequelize.models[User.modelName];
        let GroupModel: Sequelize.Model<Group.Instance, Group.Attributes> = sequelize.models[Group.modelName];
        let RoleMappingModel: Sequelize.Model<RoleMapping.Instance, RoleMapping.Attributes> = sequelize.models[RoleMapping.modelName];

        return (req: RequestWithAuth, res: Response, next: NextFunction) => {
            let accessToken = req.body.token || req.query.token || req.headers['x-access-token'];

            // If no access token return
            if (!accessToken) {
                req.currentUser = null;
                return next();
            }

            // Decrypt Token
            jsonwebtoken.verify(accessToken, RestAuth.hashCode, (err0, decoded: { userId: string | number }) => {
                // Can not verify
                if (err0) {
                    req.currentUser = null;
                    debug('Can not verify token');
                    return next();
                }

                // Search Cache
                let currentUser: ICurrentUser = RestAuth.userCache.get(decoded.userId);
                if (currentUser && currentUser.user && currentUser.user.id) {
                    // user found in cache
                    debug(`User found in cache: ${currentUser.user.name}`);
                    req.currentUser = currentUser;
                    return next();
                }

                // Find User
                UserModel
                    .findById(decoded.userId)
                    .then((user: User.Instance) => {
                        RoleMappingModel
                            .findAll({ where: { userId: decoded.userId }, include: [{ model: GroupModel, attributes: ['name'] }] })
                            .then((roleMappings: RoleMapping.Instance[]) => {
                                let groupNameArray: string[] = [];
                                for (let i = 0; i < roleMappings.length; i++)
                                    groupNameArray.push((roleMappings[i].groupId as any).name);

                                // Save currentuser & cache
                                req.currentUser = {
                                    user: { id: decoded.userId, name: user.username },
                                    groups: groupNameArray
                                };
                                RestAuth.userCache.set(decoded.userId, req.currentUser);
                                return next();
                            })
                            .catch((err: Error) => {
                                req.currentUser = null;
                                debug(`Can not query RoleMappingModel for userId:${decoded.userId}`);
                                debug(err);
                                return next();
                            });
                    })
                    .catch((err: Error) => {
                        req.currentUser = null;
                        debug(`Can not find userId ${decoded.userId}`);
                        debug(err);
                        return next();
                    });
            });
        };
    }

    static middleware(permittedGroups: string | string[], resourceName: string, isSelfFn?: (req: RequestWithAuth, cb: (err: Error, result: boolean) => void) => void): (req: RequestWithAuth, res: Response, next: NextFunction) => void {
        /**
         * @all         : Everyone can access
         * @auth        : Authenticated USers can access
         * @admin       : Admin Group can access
         * @self        : Only Self Resource Permitted
         * ['GroupX']   : Named Groups can access
         */
        return (req: RequestWithAuth, res: Response, next: NextFunction) => {
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
                        isSelfFn(req, (err: Error, result: boolean) => {
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

    static decodeValue(val: string, cb: (err: Error, decoded: Object | string) => void): void {
        jsonwebtoken.verify(val, RestAuth.hashCode, cb);
    }

    static encodeValue(val: string | Object, expiresIn?: number): string | Object {
        return jsonwebtoken.sign(val, RestAuth.hashCode, { expiresIn: expiresIn | 60 * 60 * 1000 });
    }
}