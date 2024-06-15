"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoredShader = void 0;
const OfflineStorage_1 = require("../store/OfflineStorage");
class StoredShader extends OfflineStorage_1.IEntityBase {
    constructor(name, description, source) {
        super();
        this.name = name;
        this.description = description;
        this.source = source;
    }
}
exports.StoredShader = StoredShader;
