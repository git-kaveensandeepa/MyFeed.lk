import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getCountFromServer } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function check() {
  const coll = collection(db, "users");
  const countSnap = await getCountFromServer(coll);
  console.log("Total Users: " + countSnap.data().count);
  
  const snap = await getDocs(coll);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`User: ${data.email}, Rank: ${data.memberNumber}, Created: ${data.createdAt}`);
  });
  process.exit(0);
}
check();
