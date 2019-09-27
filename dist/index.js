"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Loki = require("lokijs");
const utils_1 = require("./utils");
const PORT = process.env.PORT || 3001;
const DB_NAME = "db.json";
const COLLECTION_NAME = "images";
const UPLOAD_PATH = "uploads";
const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: utils_1.imageFilter });
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: "fs" });
const app = express();
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
app.post("/profile", upload.single("avatar"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
    const data = col.insert(req.file);
    const { $loki, filename, originalName } = data;
    db.saveDatabase();
    res.send({
        id: $loki,
        fileName: filename,
        originalName: originalName
    });
}));
app.post("/photos/upload", upload.array("photos", 12), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        let data = [].concat(col.insert(req.files));
        db.saveDatabase();
        res.send(data.map(x => ({
            id: x.$loki,
            fileName: x.filename,
            originalName: x.originalname
        })));
    }
    catch (err) {
        res.sendStatus(400);
    }
}));
app.get("/images", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        res.send(col.data);
    }
    catch (e) {
        res.sendStatus(400);
    }
}));
app.get("/images/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        const result = col.get(+req.params.id);
        if (!result) {
            res.sendStatus(404);
            return;
        }
        res.setHeader("Content-Type", result.mimetype);
        fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
    }
    catch (err) {
        res.sendStatus(400);
    }
}));
//# sourceMappingURL=index.js.map