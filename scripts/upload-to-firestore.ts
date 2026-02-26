/**
 * universities.json과 summary.json을 Firestore에 업로드
 * 사용법: GOOGLE_CLOUD_PROJECT=rinfo-library-stats npx tsx upload-to-firestore.ts
 */
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

initializeApp({ credential: applicationDefault(), projectId: "rinfo-library-stats" });
const db = getFirestore();

async function main() {
  const universities = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "output/universities.json"), "utf-8")
  );
  const summary = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "output/summary.json"), "utf-8")
  );

  console.log(`Uploading ${universities.length} universities...`);

  // Firestore batch write (500개 제한)
  const BATCH_SIZE = 500;
  for (let i = 0; i < universities.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = universities.slice(i, i + BATCH_SIZE);
    for (const u of chunk) {
      const ref = db.collection("universities").doc(u.id);
      batch.set(ref, u);
    }
    await batch.commit();
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs`);
  }

  // Summary 업로드
  await db.collection("summary").doc("2025").set(summary);
  console.log("  Summary uploaded");

  console.log("Done!");
}

main().catch(console.error);
