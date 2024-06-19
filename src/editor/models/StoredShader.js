"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOfShader = exports.StoredShader = void 0;
const OfflineStorage_1 = require("../store/OfflineStorage");
class StoredShader extends OfflineStorage_1.IEntityBase {
    constructor(name, description) {
        super();
        this.name = name;
        this.description = description;
        this.documents = new Array();
    }
    addDocument(name, source, type) {
        this.documents.push({
            name: name, source: source, type: type
        });
    }
}
exports.StoredShader = StoredShader;
var TypeOfShader;
(function (TypeOfShader) {
    TypeOfShader["MainFrag"] = "Main Fragment";
    TypeOfShader["Frag"] = "Fragment";
    TypeOfShader["Compute"] = "Compute";
})(TypeOfShader || (exports.TypeOfShader = TypeOfShader = {}));
