"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = require("./user");
const group_1 = require("./group");
let RoleMapping = class RoleMapping extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => user_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], RoleMapping.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => user_1.default),
    __metadata("design:type", user_1.default)
], RoleMapping.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => group_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], RoleMapping.prototype, "groupId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => group_1.default),
    __metadata("design:type", group_1.default)
], RoleMapping.prototype, "group", void 0);
RoleMapping = __decorate([
    sequelize_typescript_1.Table({
        tableName: 'RoleMapping',
        modelName: 'RoleMapping',
        freezeTableName: true,
    })
], RoleMapping);
exports.default = RoleMapping;
