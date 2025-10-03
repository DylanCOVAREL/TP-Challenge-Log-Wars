import fs from "fs";
import { parse } from "fast-csv";

export async function readCsvStream(filePath: string, onRow: (row: any) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ headers: true, trim: true, ignoreEmpty: true }))
      .on("error", reject)
      .on("data", onRow)
      .on("end", () => resolve());
  });
}
