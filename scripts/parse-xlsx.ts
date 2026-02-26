/**
 * xlsx 파일을 읽어 University JSON 데이터로 변환하는 스크립트
 *
 * 사용법: npx tsx scripts/parse-xlsx.ts
 * 결과: scripts/output/universities.json, scripts/output/summary.json 생성
 */
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const XLSX_PATH = path.resolve(
  __dirname,
  "../대학도서관 통계분석용 데이터 추출(2025년)_20251002.xlsx"
);
const OUTPUT_DIR = path.resolve(__dirname, "output");

function num(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

interface SheetData {
  [key: string]: Record<string, unknown>;
}

function loadSheet(wb: XLSX.WorkBook, sheetName: string): SheetData {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet not found: ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const result: SheetData = {};
  for (const row of rows) {
    const code = str(row["기관코드"]);
    if (code) result[code] = row;
  }
  return result;
}

function main() {
  console.log("Reading xlsx...");
  const wb = XLSX.readFile(XLSX_PATH);
  console.log("Sheets:", wb.SheetNames);

  const s1 = loadSheet(wb, "1. 기본정보");
  const s2 = loadSheet(wb, "2. 소장 및 구독자료");
  const s3 = loadSheet(wb, "3. 시설");
  const s4 = loadSheet(wb, "4. 인적자원");
  const s5 = loadSheet(wb, "5. 예산 및 결산");
  const s6 = loadSheet(wb, "6. 이용 및 이용자");
  const s7 = loadSheet(wb, "7. 전자서비스");

  const ids = Object.keys(s1);
  console.log(`Found ${ids.length} universities`);

  const universities = ids.map((id) => {
    const r1 = s1[id] || {};
    const r2 = s2[id] || {};
    const r3 = s3[id] || {};
    const r4 = s4[id] || {};
    const r5 = s5[id] || {};
    const r6 = s6[id] || {};
    const r7 = s7[id] || {};

    const studentsCurr = num(r1["재학생수(당해년도)"]);
    const totalBooks = num(r2["2-1.책수_총계"]);
    const totalTypes = num(r2["2-1.종수_총계"]);
    const annualIncrease = num(r2["2-5.증가책수_계(합계)"]);
    const buildingArea = num(r3["3.도서관 건물 연면적(㎡)"]);
    const totalStaff = num(r4["4-2.직원_합계"]);
    const fullTimeTotal = num(r4["4-2.직원_정규직_합계"]);
    const librarians1 = num(r4["4-2.직원_1급 정사서_합계"]);
    const librarians2 = num(r4["4-2.직원_2급 정사서_합계"]);
    const librariansJun = num(r4["4-2.직원_준사서_합계"]);
    const librarians = librarians1 + librarians2 + librariansJun;
    const univTotal = num(r5["5.대학총결산"]);
    const materialBudget = num(r5["5.자료구입비합계(결산)"]);
    const digitalDomestic = num(r5["5.전자자료 소계_국내(결산)"]);
    const digitalForeign = num(r5["5.전자자료 소계_국외(결산)"]);
    const digitalTotal = digitalDomestic + digitalForeign;
    const loanBooks = num(r6["6-2-2.합계_합계"]);
    const borrowers = num(r6["6-2-1.대출자수_계"]);

    const indicators = {
      booksPerStudent: studentsCurr > 0 ? round(totalBooks / studentsCurr) : 0,
      annualIncreasePerStudent: studentsCurr > 0 ? round(annualIncrease / studentsCurr) : 0,
      areaPerStudent: studentsCurr > 0 ? round(buildingArea / studentsCurr) : 0,
      staffPer1000: studentsCurr > 0 ? round((totalStaff / studentsCurr) * 1000) : 0,
      budgetRatio: univTotal > 0 ? round((materialBudget / univTotal) * 100) : 0,
      budgetPerStudent: studentsCurr > 0 ? round(materialBudget / studentsCurr) : 0,
      digitalBudgetRatio: materialBudget > 0 ? round((digitalTotal / materialBudget) * 100) : 0,
      loansPerStudent: studentsCurr > 0 ? round(loanBooks / studentsCurr) : 0,
      borrowerRatio: studentsCurr > 0 ? round((borrowers / studentsCurr) * 100) : 0,
    };

    return {
      id,
      name: str(r1["기관명"]),
      type: str(r1["1-1.기관의성격1"]),
      category: str(r1["1-1.기관의성격2"]),
      studentsPrevYear: num(r1["재학생수(전년도)"]),
      studentsCurrYear: studentsCurr,
      size: str(r1["규모"]),
      collection: {
        domestic: {
          total: num(r2["2-1.국내서(책수_계)"]),
          types: num(r2["2-1.국내서(종수_계)"]),
        },
        foreign: {
          total: num(r2["2-1.국외서(책수_계)"]),
          types: num(r2["2-1.국외서(종수_계)"]),
        },
        totalBooks,
        totalTypes,
        ebooks: num(r2["2-1.e-Book_계"]),
        nonBookMaterials: num(r2["2-2.비도서자료_계(점수)"]),
        annualIncrease,
        annualDiscard: num(r2["2-5.연간폐기권수(합계)"]),
      },
      digital: {
        ejournalPackages: num(r2["2-3.전자저널_계(패키지)"]),
        ejournalTypes: num(r2["2-3.전자저널_계(종수-serial)"]),
        webDbPackages: num(r2["2-3.웹 데이터베이스_계(패키지)"]),
        ebookPackages: num(r2["2-3.e-Book_계(패키지)"]),
        ebookTypes: num(r2["2-3.e-Book_계(종수)"]),
        totalPackages: num(r2["2-3.합계(패키지)"]),
        totalTypes: num(r2["2-3.합계(종수)"]),
      },
      facilities: {
        buildingArea,
        seats: num(r3["3.총 열람석 수"]),
        computers: num(r3["3.총 보유 컴퓨터(PC)수"]),
      },
      staff: {
        totalStaff,
        librarians,
        fullTimeRatio: totalStaff > 0 ? round((fullTimeTotal / totalStaff) * 100) : 0,
      },
      budget: {
        universityTotal: univTotal,
        materialBudgetTotal: materialBudget,
        domesticBooks: num(r5["5.도서자료_국내(결산)"]),
        foreignBooks: num(r5["5.도서자료_국외(결산)"]),
        digitalTotal,
        ejournalDomestic: num(r5["5.전자저널_국내(결산)"]),
        ejournalForeign: num(r5["5.전자저널_국외(결산)"]),
        webDbDomestic: num(r5["5.웹DB_국내(결산)"]),
        webDbForeign: num(r5["5.웹DB_국외(결산)"]),
      },
      usage: {
        serviceTargets: num(r6["6-1.봉사대상자수_계(당해년도)"]),
        visitors: num(r6["6-1.이용자수"]),
        borrowers,
        loanCount: num(r6["6-2-1.대출횟수_계"]),
        loanBooks,
        illRequests: num(r6["6-3.상호대차_신청"]),
        illProvided: num(r6["6-3.상호대차_제공"]),
        educationSessions:
          num(r6["6-4.대면교육_교육횟수"]) + num(r6["6-4.비대면 교육_교육횟수"]),
        educationParticipants:
          num(r6["6-4.대면교육_참가자수"]) + num(r6["6-4.비대면 교육_참가자 수"]),
      },
      eService: {
        marcRecords: num(r7["7-1.MARC 데이터 구축_합계"]),
        digitalContents: num(r7["7-2.디지털콘텐츠(계)_합_계"]),
        homepageVisits: num(r7["7-3.홈페이지 접속건수"]),
        opacSearches: num(r7["7-3.OPAC 검색건수"]),
        dbSearches: num(r7["7-3.상용 DB 이용 검색 건수(계)"]),
        dbDownloadsFulltext: num(r7["7-3.상용 DB 이용 다운로드(전문) 건수(계)"]),
        dbDownloadsDataset: num(r7["7-3.상용 DB 이용 다운로드(데이터셋) 건수(계)"]),
      },
      indicators,
    };
  });

  // Summary 생성
  const totalUniversities = universities.length;
  const sumBooks = universities.reduce((s, u) => s + u.collection.totalBooks, 0);
  const sumBudget = universities.reduce((s, u) => s + u.budget.materialBudgetTotal, 0);
  const sumVisitors = universities.reduce((s, u) => s + u.usage.visitors, 0);
  const sumLoans = universities.reduce((s, u) => s + u.usage.loanBooks, 0);
  const sumStudents = universities.reduce((s, u) => s + u.studentsCurrYear, 0);
  const avgBps = sumStudents > 0 ? round(sumBooks / sumStudents) : 0;
  const avgBudgetPS = sumStudents > 0 ? round(sumBudget / sumStudents) : 0;

  const withBudget = universities.filter((u) => u.budget.materialBudgetTotal > 0);
  const avgDigRatio =
    withBudget.length > 0
      ? round(
          withBudget.reduce((s, u) => s + u.indicators.digitalBudgetRatio, 0) /
            withBudget.length
        )
      : 0;

  const summary = {
    totalUniversities,
    totalBooks: sumBooks,
    avgBooksPerStudent: avgBps,
    totalMaterialBudget: sumBudget,
    totalVisitors: sumVisitors,
    totalLoans: sumLoans,
    avgBudgetPerStudent: avgBudgetPS,
    avgDigitalBudgetRatio: avgDigRatio,
  };

  // 출력
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "universities.json"),
    JSON.stringify(universities, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\nOutput: ${OUTPUT_DIR}/`);
  console.log(`  universities.json: ${universities.length} records`);
  console.log(`  summary.json: generated`);
  console.log(`\nSummary:`);
  console.log(`  Total Universities: ${summary.totalUniversities}`);
  console.log(`  Total Books: ${summary.totalBooks.toLocaleString()}`);
  console.log(`  Avg Books/Student: ${summary.avgBooksPerStudent}`);
  console.log(`  Total Material Budget: ₩${summary.totalMaterialBudget.toLocaleString()}`);
  console.log(`  Total Visitors: ${summary.totalVisitors.toLocaleString()}`);
  console.log(`  Total Loans: ${summary.totalLoans.toLocaleString()}`);
}

function round(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

main();
