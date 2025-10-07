/* eslint-disable @typescript-eslint/no-require-imports */
// This is a Node.js script to import dares into Firestore
// Run with: node scripts/importDares.js

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importDares() {
  try {
    // Read dares from JSON file
    const daresPath = path.join(__dirname, "../data/dares.json");
    const daresData = JSON.parse(fs.readFileSync(daresPath, "utf8"));

    console.log(`Importing ${daresData.length} dares...`);

    const batch = db.batch();

    daresData.forEach((dare) => {
      const dareRef = db.collection("dares").doc(dare.id);
      batch.set(dareRef, {
        category: dare.category,
        text: dare.text,
        timeLimit: dare.timeLimit,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("✅ Successfully imported all dares!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing dares:", error);
    process.exit(1);
  }
}

importDares();
