import JSZip from "jszip";

interface GoogleAdsData {
  url: string;
  shortTitles: string[]; // 10 items, max 30 chars
  longTitles: string[];  // 10 items, max 90 chars
  descriptions: string[]; // 10 items, max 90 chars
  keywords: string[];
}

export function arrayToCsv(headers: string[], rows: string[][]): string {
  const escape = (field: string): string => {
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escape).join(",");
  const dataLines = rows.map((row) => row.map(escape).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

export async function exportGoogleAds(data: GoogleAdsData): Promise<void> {
  const campaignName = "Vibe Sales Campaign";
  const adGroupName = "Ad Group 1";

  // campaigns.csv
  const campaignsCsv = arrayToCsv(
    ["Campaign Name", "Daily Budget", "Bid Strategy"],
    [[campaignName, "10.00", "Maximize Clicks"]]
  );

  // ad_groups.csv — one row per ad concept (one group for now)
  const adGroupsCsv = arrayToCsv(
    ["Campaign Name", "Ad Group Name", "Default Max CPC"],
    [[campaignName, adGroupName, "1.00"]]
  );

  // ads.csv — one row per unique headline combination, up to 10 rows
  const adRows: string[][] = [];
  const count = Math.min(data.shortTitles.length, 10);
  for (let i = 0; i < count; i++) {
    const h1 = data.shortTitles[i] ?? "";
    const h2 = data.shortTitles[(i + 1) % data.shortTitles.length] ?? "";
    const h3 = data.shortTitles[(i + 2) % data.shortTitles.length] ?? "";
    const d1 = data.descriptions[i % data.descriptions.length] ?? "";
    const d2 = data.descriptions[(i + 1) % data.descriptions.length] ?? "";
    adRows.push([campaignName, adGroupName, h1, h2, h3, d1, d2, data.url]);
  }
  const adsCsv = arrayToCsv(
    ["Campaign", "Ad Group", "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2", "Final URL"],
    adRows
  );

  // keywords.csv — one row per keyword
  const keywordRows: string[][] = data.keywords.map((kw) => [
    campaignName,
    adGroupName,
    kw,
    "Broad",
    "1.00",
  ]);
  const keywordsCsv = arrayToCsv(
    ["Campaign", "Ad Group", "Keyword", "Match Type", "Max CPC"],
    keywordRows
  );

  // Bundle into zip
  const zip = new JSZip();
  zip.file("campaigns.csv", campaignsCsv);
  zip.file("ad_groups.csv", adGroupsCsv);
  zip.file("ads.csv", adsCsv);
  zip.file("keywords.csv", keywordsCsv);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "google-ads-export.zip";
  a.click();
  URL.revokeObjectURL(url);
}
