export interface University {
  id: string;
  name: string;
  type: string;
  category: string;
  studentsPrevYear: number;
  studentsCurrYear: number;
  size: string;

  collection: {
    domestic: { total: number; types: number };
    foreign: { total: number; types: number };
    totalBooks: number;
    totalTypes: number;
    ebooks: number;
    nonBookMaterials: number;
    annualIncrease: number;
    annualDiscard: number;
  };

  digital: {
    ejournalPackages: number;
    ejournalTypes: number;
    webDbPackages: number;
    ebookPackages: number;
    ebookTypes: number;
    totalPackages: number;
    totalTypes: number;
  };

  facilities: {
    buildingArea: number;
    seats: number;
    computers: number;
  };

  staff: {
    totalStaff: number;
    librarians: number;
    fullTimeRatio: number;
  };

  budget: {
    universityTotal: number;
    materialBudgetTotal: number;
    domesticBooks: number;
    foreignBooks: number;
    digitalTotal: number;
    ejournalDomestic: number;
    ejournalForeign: number;
    webDbDomestic: number;
    webDbForeign: number;
  };

  usage: {
    serviceTargets: number;
    visitors: number;
    borrowers: number;
    loanCount: number;
    loanBooks: number;
    illRequests: number;
    illProvided: number;
    educationSessions: number;
    educationParticipants: number;
  };

  eService: {
    marcRecords: number;
    digitalContents: number;
    homepageVisits: number;
    opacSearches: number;
    dbSearches: number;
    dbDownloadsFulltext: number;
    dbDownloadsDataset: number;
  };

  indicators: {
    booksPerStudent: number;
    annualIncreasePerStudent: number;
    areaPerStudent: number;
    staffPer1000: number;
    budgetRatio: number;
    budgetPerStudent: number;
    digitalBudgetRatio: number;
    loansPerStudent: number;
    borrowerRatio: number;
  };
}

export interface SummaryStats {
  totalUniversities: number;
  totalBooks: number;
  avgBooksPerStudent: number;
  totalMaterialBudget: number;
  totalVisitors: number;
  totalLoans: number;
  avgBudgetPerStudent: number;
  avgDigitalBudgetRatio: number;
}
