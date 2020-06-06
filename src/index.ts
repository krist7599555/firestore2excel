// https://firebase.google.com/docs/firestore/quickstart

import admin, { ServiceAccount } from "firebase-admin";
import XLSX from 'xlsx';
import { FIREBASE_ADMIN, FIREBASE_CLIENT } from "../config/firebase";

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_ADMIN as ServiceAccount),
  databaseURL: FIREBASE_CLIENT.databaseURL,
});

const db = admin.firestore();

async function main() {
  const collections = []
  for (const collection of await db.listCollections()) {
    console.error(`${collection.id} ...`);
    const query_snapshot = await collection.get();
    const documents = query_snapshot.docs.map(doc => doc.data());
    console.error(`${collection.id}: ${documents.length} (finish)`);
    collections.push({
      name: collection.id,
      value: documents
    });
  }
  // console.log(JSON.stringify(collections, null, 2));

  // excel writer
  const wb = XLSX.utils.book_new();
  for (const {name, value} of collections) {
    const sheet = XLSX.utils.json_to_sheet(value);
    XLSX.utils.book_append_sheet(wb, sheet, name);
  }
  XLSX.writeFile(wb, `output/${FIREBASE_ADMIN.project_id}.xlsx`)
}
main();
