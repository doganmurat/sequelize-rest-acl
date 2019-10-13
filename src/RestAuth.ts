/**
 * Auth Middleware
 *
 * This module will read user token from
 * header(x-access-token) OR
 * req.body.token OR req.query.token
 * and will read user & groups from db
 */

import * as crypto from 'crypto';
import * as jsonwebtoken from 'jsonwebtoken';
import * as NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import * as Debug from 'debug';
import _defineModels from './models';
import User from './models/user';
import Group from './models/group';
import RoleMapping from './models/role-mapping';

const debug = Debug('sx-sequelize-acl:RestAuth');

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
export interface CurrentUser {
    user: {
        id: string | number;
        name: string;
    };
    groups: string[];
}

export interface RequestWithAuth extends Request {
    currentUser: null | CurrentUser;
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

    public static rootMiddleware(
        dbConnection: Sequelize,
        defineModels: boolean,
    ): (req: Request, res: Response, next: NextFunction) => void {
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

        // define models
        if (defineModels)
            _defineModels(dbConnection, (err): void => {
                if (err) console.error('Db sync Error:', err);
                debug('Db models sync completed.');
            });

        let UserModel = User;
        let GroupModel = Group;
        let RoleMappingModel = RoleMapping;

        return (req: RequestWithAuth, res: Response, next: NextFunction): void => {
            let accessToken = req.body.token || req.query.token || req.headers['x-access-token'];

            // If no access token return
            if (!accessToken) {
                debug('Request does not have a accesstoken.');
                req.currentUser = null;
                return next();
            }

            // Decrypt Token
            jsonwebtoken.verify(accessToken, RestAuth.hashCode, (err0, decoded: { userId: string | number }): void => {
                // Can not verify
                if (err0) {
                    req.currentUser = null;
                    debug('Can not verify token');
                    return next();
                }

                // Search Cache
                let currentUser: CurrentUser = RestAuth.userCache.get(decoded.userId);
                if (currentUser && currentUser.user && currentUser.user.id) {
                    // user found in cache
                    debug(`User found in cache: ${currentUser.user.name}`);
                    req.currentUser = currentUser;
                    return next();
                }

                // Find User
                UserModel.findByPk(decoded.userId)
                    .then((user: User): void => {
                        RoleMappingModel.findAll({
                            where: { userId: decoded.userId },
                            include: [{ model: GroupModel, attributes: ['name'] }],
                        })
                            .then((roleMappings: RoleMapping[]): void => {
                                let groupNameArray: string[] = [];
                                for (let i = 0; i < roleMappings.length; i++)
                                    groupNameArray.push(roleMappings[i].group.name);

                                // Save currentuser & cache
                                req.currentUser = {
                                    user: { id: decoded.userId, name: user.username },
                                    groups: groupNameArray,
                                };
                                RestAuth.userCache.set(decoded.userId, req.currentUser);
                                return next();
                            })
                            .catch((err: Error): void => {
                                req.currentUser = null;
                                debug(`Can not query RoleMappingModel for userId:${decoded.userId}`);
                                debug(err);
                                return next();
                            });
                    })
                    .catch((err: Error): void => {
                        req.currentUser = null;
                        debug(`Can not find userId ${decoded.userId}`);
                        debug(err);
                        return next();
                    });
            });
        };
    }

    public static middleware(
        permittedGroups: string | string[],
        resourceName: string,
        isSelfFn?: (req: RequestWithAuth, cb: (err: Error, result: boolean) => void) => void,
    ): (req: RequestWithAuth, res: Response, next: NextFunction) => void {
        /**
         * @all         : Everyone can access
         * @auth        : Authenticated USers can access
         * @admin       : Admin Group can access
         * @self        : Only Self Resource Permitted
         * ['GroupX']   : Named Groups can access
         */
        return (req: RequestWithAuth, res: Response, next: NextFunction): void => {
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
                        isSelfFn(req, (err: Error, result: boolean): void => {
                            if (err) return next(err);
                            if (!result) {
                                debug(
                                    `Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`,
                                );
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
                        if (permittedGroups[i] === req.currentUser.groups[j]) return next();

                debug(`Permission Denied / Requested Level: ${permittedGroups} Resource:${resourceName}`);
                return next(new Error('ACCESS_ERROR'));
            }
        };
    }

    public static decodeValue(val: string, cb: (err: Error, decoded: any) => void): void {
        jsonwebtoken.verify(val, RestAuth.hashCode, cb);
    }

    public static encodeValue(val: any, expiresIn?: number): string {
        return jsonwebtoken.sign(val, RestAuth.hashCode, { expiresIn: expiresIn | (60 * 60 * 1000) });
    }
}
