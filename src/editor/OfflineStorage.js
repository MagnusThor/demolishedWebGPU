"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineStorage = exports.IEntityBase = void 0;
class IEntityBase {
    constructor() {
        this.id = crypto.randomUUID();
        this.created = Date.now();
        this.lastModified = Date.now();
    }
}
exports.IEntityBase = IEntityBase;
class OfflineStorage {
    constructor(label) {
        this.label = label;
    }
    serialize() {
        const data = localStorage.getItem(this.label);
        if (!data) {
            throw `no storage found for ${this.label}`;
        }
        else {
            const model = JSON.parse(data);
            this.model = model;
            return model;
        }
    }
    deSerialize() {
        const data = JSON.stringify(this.model);
        return data;
    }
    save() {
        const data = this.deSerialize();
        localStorage.setItem(this.label, data);
    }
    getLocalStorage() {
        return this.serialize();
    }
    insert(item) {
        this.model.collection.push(item);
        return item;
    }
    update(item) {
        const index = this.model.collection.findIndex((pre) => pre.id === item.id);
        console.log(index);
        if (index !== -1) {
            item.lastModified = Date.now();
            this.model.collection[index] = item;
        }
    }
    delete(item) {
        const index = this.model.collection.findIndex((pre) => pre.id === item.id);
        if (index !== -1) {
            this.model.collection.splice(index, 1);
        }
    }
    findById(uuid) {
        return this.model.collection.find((pre) => pre.id === uuid);
    }
    find(query) {
        return this.model.collection.filter(query);
    }
    setup() {
        this.model = { label: this.label, collection: [] };
        return this.model;
    }
    init() {
        this.model = this.getLocalStorage();
    }
}
exports.OfflineStorage = OfflineStorage;
