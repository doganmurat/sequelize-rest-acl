/**
 * Auth Middleware
 *
 * This module will read user token from
 * header(x-access-token) OR
 * req.body.token OR req.query.token
 * and will read user & groups from db
 */
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
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
export declare class RestAuth {
    private static hashCode;
    private static userCache;
    static rootMiddleware(dbConnection: Sequelize, defineModels: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static middleware(permittedGroups: string | string[], resourceName: string, isSelfFn?: (req: RequestWithAuth, cb: (err: Error, result: boolean) => void) => void): (req: RequestWithAuth, res: Response, next: NextFunction) => void;
    static decodeValue(val: string, cb: (err: Error, decoded: any) => void): void;
    static encodeValue(val: any, expiresIn?: number): string;
}
