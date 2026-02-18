"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FileStorageModule", {
    enumerable: true,
    get: function() {
        return FileStorageModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _filestoragecontroller = require("./controllers/file-storage.controller");
const _filestorageservice = require("./services/file-storage.service");
const _storageproviderservice = require("./services/storage-provider.service");
const _s3storageservice = require("./providers/s3-storage.service");
const _localstorageservice = require("./providers/local-storage.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let FileStorageModule = class FileStorageModule {
};
FileStorageModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule
        ],
        controllers: [
            _filestoragecontroller.FileStorageController
        ],
        providers: [
            _filestorageservice.FileStorageService,
            _storageproviderservice.StorageProviderService,
            {
                provide: 'StorageService',
                useFactory: (storageProviderService)=>{
                    return storageProviderService.getStorageService();
                },
                inject: [
                    _storageproviderservice.StorageProviderService
                ]
            },
            _s3storageservice.S3StorageService,
            _localstorageservice.LocalStorageService
        ],
        exports: [
            _filestorageservice.FileStorageService,
            _storageproviderservice.StorageProviderService,
            'StorageService'
        ]
    })
], FileStorageModule);

//# sourceMappingURL=file-storage.module.js.map