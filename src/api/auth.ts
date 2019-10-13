import * as express from 'express';
import { ModelRestApi } from 'sx-sequelize-api';
import { Sequelize } from 'sequelize-typescript';
import { Response, NextFunction } from 'express';
import { RestAuth, RequestWithAuth } from '../';
import User from '../models/user';
import Group from '../models/group';
import RoleMapping from '../models/role-mapping';
import * as Debug from 'debug';
const debug = Debug('sx-sequelize-acl:Auth');

/**
 *
 * login, logout & profile api (change password etc..)
 */
export default function(connection: Sequelize): express.Router {
    let router: express.Router = express.Router();
    let DbModel = User;
    let GroupDbModel = Group;
    let RoleMappingDbModel = RoleMapping;

    let modelApi = new ModelRestApi(DbModel, connection);

    // login, logout
    router.post('/login', RestAuth.middleware('@all', 'LOGIN'), login);
    router.post('/logout', RestAuth.middleware('@auth', 'LOGOUT'), logout);

    // Profile get, update
    router.get('/:id', RestAuth.middleware('@self', 'GET profile', isSelfFn), modelApi.getById());
    router.put('/:id', RestAuth.middleware('@self', 'UPDATE profile', isSelfFn), modelApi.updateById());

    return router;

    function login(req: RequestWithAuth, res: Response, next: NextFunction): void {
        DbModel.findOne({ where: { username: req.body.username } })
            .then((user: User): void | Response => {
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
                    .then((roleMappings: RoleMapping[]): void | Response => {
                        let groupNameArray: string[] = [];
                        for (let i = 0; i < roleMappings.length; i++) groupNameArray.push(roleMappings[i].group.name);

                        debug(`${user.username} logged in.`);
                        debug(`user groups: ${groupNameArray}`);
                        return res.json({
                            token: RestAuth.encodeValue({ userId: user.id }),
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
                    .catch((err: Error): void | Response => {
                        debug(`Can not query RoleMappingModel for userId:${user.id}`);
                        debug(err);
                        return next();
                    });
            })
            .catch((err: Error): void | Response => {
                debug(`Can not query UserModel for username:${req.body.username}`);
                debug(err);
                return next(new Error('LOGIN_FAILED'));
            });
    }

    function logout(req: RequestWithAuth, res: Response): void {
        // Nothing to do
        res.json(true);
    }

    function isSelfFn(req: RequestWithAuth, cb: (err: Error, result: boolean) => void): void {
        return cb(null, req.currentUser.user.id + '' === req.params.id);
    }
}
