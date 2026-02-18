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
    get clientService () {
        return clientService;
    },
    get default () {
        return _default;
    }
});
const _api = /*#__PURE__*/ _interop_require_default(require("./api"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Client Service
 */ let ClientService = class ClientService {
    /**
     * Get all clients
     */ async getClients(filters) {
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
     * Get client by ID
     */ async getClient(id) {
        return _api.default.get(`${this.baseUrl}/${id}`);
    }
    /**
     * Create client
     */ async createClient(data) {
        return _api.default.post(this.baseUrl, data);
    }
    /**
     * Update client
     */ async updateClient(id, data) {
        return _api.default.put(`${this.baseUrl}/${id}`, data);
    }
    /**
     * Delete client
     */ async deleteClient(id) {
        return _api.default.delete(`${this.baseUrl}/${id}`);
    }
    /**
     * Get client statistics
     */ async getStatistics() {
        return _api.default.get(`${this.baseUrl}/statistics`);
    }
    /**
     * Bulk import clients
     */ async bulkImport(clients) {
        return _api.default.post(`${this.baseUrl}/bulk-import`, {
            clients
        });
    }
    constructor(){
        this.baseUrl = '/clients';
    }
};
const clientService = new ClientService();
const _default = clientService;

//# sourceMappingURL=client.service.js.map