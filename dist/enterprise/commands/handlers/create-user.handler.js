"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateUserCommandHandler", {
    enumerable: true,
    get: function() {
        return CreateUserCommandHandler;
    }
});
const _cqrs = require("@nestjs/cqrs");
const _createusercommand = require("../commands/create-user.command");
const _Userentity = require("../../database/entities/User.entity");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let CreateUserCommandHandler = class CreateUserCommandHandler {
    async execute(command) {
        // Create user in write model
        const user = this.userRepository.create({
            tenantId: command.tenantId,
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email,
            passwordHash: command.passwordHash,
            salt: command.salt,
            role: command.role,
            status: 'active'
        });
        const savedUser = await this.userRepository.save(user);
        // Publish event for read model update
        this.eventBus.publish(new UserCreatedEvent({
            userId: savedUser.id,
            tenantId: savedUser.tenantId,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            role: savedUser.role,
            createdAt: savedUser.createdAt
        }));
        // Publish event for audit logging
        this.eventBus.publish(new AuditLogEvent({
            tenantId: savedUser.tenantId,
            userId: savedUser.id,
            action: 'create',
            entityType: 'User',
            entityId: savedUser.id,
            newValues: savedUser,
            timestamp: new Date()
        }));
        return savedUser;
    }
    constructor(userRepository, eventBus){
        this.userRepository = userRepository;
        this.eventBus = eventBus;
    }
};
CreateUserCommandHandler = _ts_decorate([
    (0, _cqrs.CommandHandler)(_createusercommand.CreateUserCommand),
    _ts_param(0, (0, _typeorm.InjectRepository)(_Userentity.User)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof EventBus === "undefined" ? Object : EventBus
    ])
], CreateUserCommandHandler);

//# sourceMappingURL=create-user.handler.js.map