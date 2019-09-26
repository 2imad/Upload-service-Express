import * as del from "del";
import { Collection } from "lokijs";

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const loadCollection = (colName, db: Loki): Promise<Collection<any>> => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection =
        db.getCollection(colName) || db.addCollection(colName);
      resolve(_collection);
    });
  });
};

export { loadCollection, imageFilter };
