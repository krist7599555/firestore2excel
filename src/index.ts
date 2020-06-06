// https://firebase.google.com/docs/firestore/quickstart

import admin, { ServiceAccount } from "firebase-admin";
import XLSX from 'xlsx';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { flattenKeys } from "./flattenKeys"
import { FIREBASE_ADMIN, FIREBASE_CLIENT } from "../config/firebase";

const OUTPUT_XLSX = `output/${FIREBASE_ADMIN.project_id}.xlsx`
const OUTPUT_JSON = `output/${FIREBASE_ADMIN.project_id}.json`

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_ADMIN as ServiceAccount),
  databaseURL: FIREBASE_CLIENT.databaseURL,
});

const db = admin.firestore();
interface Collection {
  collection: string;
  documents: any[];
}

function special_cleaning(c: Collection) {
  // if (c.collection == "party") {
  //   for (const d of c.documents) {
  //     d.tags = _.sortedUniq(d.tags);
  //   }
  // }
}
function special_excel_format(collection: string, data: any) {
  // for (const k of _.keys(data)) {
  //   if (/date/i.test(k)) {
  //     try {
  //       data[k + " (format)"] = dayjs.unix(data[k] / 1000).format("YYYY-MM-DD HH:mm");
  //     } catch {
  //     }
  //   }
  // }
}

async function main() {
  const collections: Collection[] = []
  for (const collection of await db.listCollections()) {
    // if (collection.id !== 'party') continue;
    console.info(`${collection.id} ...`);
    const query_snapshot = await collection.get();
    const documents = query_snapshot.docs.map(doc => doc.data());
    console.info(`${collection.id} ${documents.length} items (finish)`);
    collections.push({
      collection: collection.id,
      documents: documents
    });
  }
  console.info('cleaning ...')
  collections.forEach(special_cleaning);

  // json writer
  console.info('export json ...')
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(collections, null, 2));
  
  // excel writer
  console.info('export xlsx ...')
  const wb = XLSX.utils.book_new();
  for (const { collection, documents } of collections) {
    const new_documents = documents.map((d, idx, arr) => {
      const res = flattenKeys(d);
      special_excel_format(collection, res);
      return res
    });
    const sheet = XLSX.utils.json_to_sheet(new_documents, {
      header: (() => {
        const s = new Set<string>();
        for (const doc of new_documents) {
          _.forEach(_.keys(doc), k => s.add(k));
        }
        return _.sortBy(Array.from(s));
      })()
    });
    XLSX.utils.book_append_sheet(wb, sheet, collection);
  }
  XLSX.writeFile(wb, OUTPUT_XLSX);
}
main();
