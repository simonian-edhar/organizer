"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentsModule", {
    enumerable: true,
    get: function() {
        return DocumentsModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _platformexpress = require("@nestjs/platform-express");
const _documentscontroller = require("./controllers/documents.controller");
const _documentservice = require("./services/document.service");
const _Documententity = require("../database/entities/Document.entity");
const _filestoragemodule = require("../file-storage/file-storage.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DocumentsModule = class DocumentsModule {
};
DocumentsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _Documententity.Document
            ]),
            _platformexpress.MulterModule.register({
                dest: './uploads',
                limits: {
                    fileSize: 50 * 1024 * 1024
                }
            }),
            _filestoragemodule.FileStorageModule
        ],
        controllers: [
            _documentscontroller.DocumentsController
        ],
        providers: [
            _documentservice.DocumentService
        ],
        exports: [
            _documentservice.DocumentService
        ]
    })
], DocumentsModule);

//# sourceMappingURL=documents.module.js.map