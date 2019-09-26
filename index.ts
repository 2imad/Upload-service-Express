import * as express from "express";
import * as multer from "multer";
import * as cors from "cors";
import * as fs from "fs";
import * as path from "path";
import * as Loki from "lokijs";
import { loadCollection, imageFilter } from "./utils";

const PORT = process.env.PORT || 3000;
const DB_NAME = "db.json";
const COLLECTION_NAME = "images";
const UPLOAD_PATH = "uploads";

const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: imageFilter });
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: "fs" });

const app = express();
app.use(cors());

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.post("/profile", upload.single("avatar"), async (req, res) => {
  const col = await loadCollection(COLLECTION_NAME, db);
  const data = col.insert(req.file);
  const { $loki, filename, originalName } = data;
  db.saveDatabase();
  res.send({
    id: $loki,
    fileName: filename,
    originalName: originalName
  });
});
app.post("/photos/upload", upload.array("photos", 12), async (req, res) => {
  try {
    const col = await loadCollection(COLLECTION_NAME, db);
    let data = [].concat(col.insert(req.files));

    db.saveDatabase();
    res.send(
      data.map(x => ({
        id: x.$loki,
        fileName: x.filename,
        originalName: x.originalname
      }))
    );
  } catch (err) {
    res.sendStatus(400);
  }
});
app.get("/images", async (req, res) => {
  try {
    const col = await loadCollection(COLLECTION_NAME, db);
    res.send(col.data);
  } catch (e) {
    res.sendStatus(400);
  }
});
app.get("/images/:id", async (req, res) => {
  try {
    const col = await loadCollection(COLLECTION_NAME, db);
    const result = col.get(+req.params.id);

    if (!result) {
      res.sendStatus(404);
      return;
    }
    res.setHeader("Content-Type", result.mimetype);
    fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
  } catch (err) {
    res.sendStatus(400);
  }
});
