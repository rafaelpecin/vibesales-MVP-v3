import JSZip from "jszip";
import { arrayToCsv } from "./googleAdsExport";

interface MetaAdsData {
  url: string;
  shortTitles: string[]; // 10 items, max 30 chars
  longTitles: string[];  // 10 items, max 90 chars
  descriptions: string[]; // 10 items, max 90 chars
  keywords: string[];
}

export { arrayToCsv };

export async function exportMetaAds(data: MetaAdsData): Promise<void> {
  const campaignName = "Vibe Sales Campaign";
  const adSetName = "Ad Set 1";

  // campaigns.csv
  const campaignsCsv = arrayToCsv(
    ["Campaign Name", "Objective", "Daily Budget"],
    [[campaignName, "CONVERSIONS", "10.00"]]
  );

  // ad_sets.csv
  const adSetsCsv = arrayToCsv(
    ["Campaign Name", "Ad Set Name", "Targeting", "Daily Budget"],
    [[campaignName, adSetName, "Broad Audience", "10.00"]]
  );

  // ads.csv — one row per ad using descriptions as Primary Text, longTitles as Headline
  const count = Math.max(data.descriptions.length, data.longTitles.length);
  const adRows: string[][] = [];
  for (let i = 0; i < count; i++) {
    const primaryText = data.descriptions[i % data.descriptions.length] ?? "";
    const headline = data.longTitles[i % data.longTitles.length] ?? "";
    const linkDescription = data.longTitles[(i + 1) % data.longTitles.length] ?? "";
    adRows.push([adSetName, primaryText, headline, linkDescription, data.url]);
  }
  const adsCsv = arrayToCsv(
    ["Ad Set Name", "Primary Text", "Headline", "Link Description", "Website URL"],
    adRows
  );

  // Bundle into zip
  const zip = new JSZip();
  zip.file("campaigns.csv", campaignsCsv);
  zip.file("ad_sets.csv", adSetsCsv);
  zip.file("ads.csv", adsCsv);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meta-ads-export.zip";
  a.click();
  URL.revokeObjectURL(url);
}
