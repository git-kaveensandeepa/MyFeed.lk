import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`User: ${data.email}, Rank: ${data.memberNumber}, Created: ${data.createdAt?.toDate?.()}`);
  });
  process.exit(0);
}
check();
