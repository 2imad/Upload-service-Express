"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
};
exports.imageFilter = imageFilter;
const loadCollection = (colName, db) => {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        });
    });
};
exports.loadCollection = loadCollection;
//# sourceMappingURL=utils.js.map