"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get LOGGING_OPTIONS () {
        return LOGGING_OPTIONS;
    },
    get LoggingModule () {
        return LoggingModule;
    }
});
const _common = require("@nestjs/common");
const _nestwinston = require("nest-winston");
const _config = require("@nestjs/config");
const _loggerconfig = require("./logger.config");
const _loggingservice = require("./logging.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const LOGGING_OPTIONS = 'LOGGING_OPTIONS';
let LoggingModule = class LoggingModule {
    /**
   * Register logging module synchronously
   */ static register(options = {}) {
        const optionsProvider = {
            provide: LOGGING_OPTIONS,
            useValue: options
        };
        return {
            module: LoggingModule,
            imports: [
                _config.ConfigModule,
                _nestwinston.WinstonModule.forRootAsync({
                    imports: [
                        _config.ConfigModule
                    ],
                    inject: [
                        _config.ConfigService
                    ],
                    useFactory: (configService)=>(0, _loggerconfig.createLoggerConfig)(configService)
                })
            ],
            providers: [
                optionsProvider,
                _loggingservice.LoggingService
            ],
            exports: [
                _loggingservice.LoggingService
            ],
            global: true
        };
    }
    /**
   * Register logging module asynchronously
   */ static registerAsync(options) {
        const asyncOptionsProvider = {
            provide: LOGGING_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || []
        };
        return {
            module: LoggingModule,
            imports: [
                ...options.imports || [],
                _nestwinston.WinstonModule.forRootAsync({
                    inject: [
                        _config.ConfigService
                    ],
                    useFactory: (configService)=>{
                        return (0, _loggerconfig.createLoggerConfig)(configService);
                    }
                })
            ],
            providers: [
                asyncOptionsProvider,
                _loggingservice.LoggingService
            ],
            exports: [
                _loggingservice.LoggingService
            ],
            global: true
        };
    }
};
LoggingModule = _ts_decorate([
    (0, _common.Module)({})
], LoggingModule);

//# sourceMappingURL=logging.module.js.map