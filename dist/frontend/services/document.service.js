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
    get default () {
        return _default;
    },
    get documentService () {
        return documentService;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Document Service
 */ let DocumentService = class DocumentService {
    /**
     * Get all documents
     */ async getDocuments(filters) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value])=>{
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        const query = params.toString();
        return _api.default.get(`${this.baseUrl}${query ? `?${query}` : ''}`);
    }
    /**
     * Get document by ID
     */ async getDocument(id) {
        return _api.default.get(`${this.baseUrl}/${id}`);
    }
    /**
     * Upload document
     */ async uploadDocument(file, data, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        Object.entries(data).forEach(([key, value])=>{
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        return _api.default.upload(`${this.baseUrl}/upload`, file, onProgress);
    }
    /**
     * Update document
     */ async updateDocument(id, data) {
        return _api.default.put(`${this.baseUrl}/${id}`, data);
    }
    /**
     * Sign document
     */ async signDocument(id, data) {
        return _api.default.post(`${this.baseUrl}/${id}/sign`, data);
    }
    /**
     * Generate signed URL
     */ async generateSignedUrl(id, data) {
        return _api.default.post(`${this.baseUrl}/${id}/signed-url`, data);
    }
    /**
     * Delete document
     */ async deleteDocument(id) {
        return _api.default.delete(`${this.baseUrl}/${id}`);
    }
    /**
     * Get document statistics
     */ async getStatistics() {
        return _api.default.get(`${this.baseUrl}/statistics`);
    }
    /**
     * Download document
     */ async downloadDocument(id, filename) {
        return _api.default.download(`${this.baseUrl}/${id}/download`, filename);
    }
    constructor(){
        this.baseUrl = '/documents';
    }
};
const documentService = new DocumentService();
const _default = documentService;

//# sourceMappingURL=document.service.js.map