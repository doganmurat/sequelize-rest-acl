/// <reference types="express" />
import * as express from 'express';
import DbConnection from '../Connection';
export default function (db: DbConnection): express.Router;
