/// <reference types="express" />
import * as express from 'express';
import { Connection } from '../';
/**
 *
 * login, logout & profile api (change password etc..)
 */
export default function (db: Connection): express.Router;
