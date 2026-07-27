import { FormSchema } from "@/components/dashboard/forms/FormTableRenderer";

/**
 * Checks if a specific row (colKey) or field (subKey) should be read-only and automated by the calculation engine.
 */
export function isCalculatedField(
  colKey: string, 
  subKey: string = "", 
  subKeys: string[] = [], 
  allColumns: any[] = []
): boolean {
  const trimmedCol = colKey.trim();
  const trimmedSub = subKey.trim();

  // 1. Vertical Summary Rows are completely automated
  const summaryKeywords = [
    "ጠቅላላ ድምር",
    "አጠቃላይ ድምር",
    "ድምር",
    "ጠቅላላ የተመዘገበ ንብረት ብዛት",
    "በጠቅላላው የተሰበሰበው ገቢ በብር",
    "ያዋቀሩ%"
  ];
  if (summaryKeywords.some(k => trimmedCol === k || trimmedCol.endsWith("ድምር"))) {
    return true;
  }

  // 2. Horizontal Sums (Row totals like "ድምር", "ድ", "ድም")
  if (trimmedSub === "ድምር" || trimmedSub === "ድ" || trimmedSub === "ድም") {
    return true;
  }

  // 3. Horizontal Subtractions / Remainders
  if (trimmedSub === "ያላዋቀሩ" && subKeys.includes("ብዛት") && subKeys.includes("ያዋቀሩ")) {
    return true;
  }
  if (trimmedSub === "ያልተመለሰ" && subKeys.some(k => k.startsWith("ጉድለት")) && subKeys.includes("የተመለሰ")) {
    return true;
  }

  // 4. Horizontal Percentages & Ratios (only when automated numerator & denominator exist)
  if (trimmedSub === "%" || trimmedSub === "ውሳኔ ያገኙ %" || trimmedSub === "የተፈጸመ %" || trimmedSub === "በመቶኛ") {
    // Plan vs Performance ("እቅድ" / "ዕቅድ" vs "ክንውን")
    if (subKeys.some(k => k === "እቅድ" || k === "ዕቅድ") && subKeys.includes("ክንውን")) return true;
    // Deficit vs Recovered
    if (subKeys.some(k => k.startsWith("ጉድለት")) && subKeys.includes("የተመለሰ")) return true;
    // Total vs Solved ("ብዛት" vs "የተፈታ")
    if (subKeys.includes("ብዛት") && subKeys.includes("የተፈታ")) return true;
    // Complaints Decision ("የቀረቡ" vs "ውሳኔ ያገኙ ብዛት")
    if (subKeys.includes("የቀረቡ") && subKeys.includes("ውሳኔ ያገኙ ብዛት")) return true;
    // Executed vs Total ("የተፈጸመ ብዛት" vs "ድምር")
    if (subKeys.includes("የተፈጸመ ብዛት") && subKeys.includes("ድምር")) return true;
    // Cross-row automations in Forms 14 & 15
    if (trimmedCol.includes("ወደ ዳታ ቤዝ የገባ መረጃ ብዛት") && subKeys.includes("ድ")) return true;
    if (trimmedCol.includes("በኮንፈረንስ ቀርቦ የጸደቀ") && subKeys.includes("ብዛት")) return true;
    if (trimmedCol.includes("የአሠራር ሥርዓት መጠበቁ በኮሚሽን የተረጋገጠ") && subKeys.includes("ብዛት")) return true;
  }

  if (trimmedCol === "ያዋቀሩ%") {
    return true;
  }

  return false;
}

/**
 * Computes all automatic additions, subtractions, totals, and percentages for a given form schema and data.
 */
export function computeFormCalculations(schema: FormSchema, initialData: any = {}): any {
  if (!schema || !schema.columns || !Array.isArray(schema.columns)) {
    return initialData;
  }

  // Deep clone data to prevent unexpected mutations
  const data = JSON.parse(JSON.stringify(initialData || {}));

  // Safe number parsing
  const parseNum = (val: any): number => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) return 0;
    return Number(val);
  };

  const formatNum = (num: number): string => {
    return (Math.round(num * 100) / 100).toString();
  };

  const formatPerc = (num: number, den: number): string => {
    if (den <= 0 || isNaN(num) || isNaN(den)) return "0";
    const perc = (num / den) * 100;
    return perc.toFixed(2);
  };

  const summaryKeywords = [
    "ጠቅላላ ድምር",
    "አጠቃላይ ድምር",
    "ድምር",
    "ጠቅላላ የተመዘገበ ንብረት ብዛት",
    "በጠቅላላው የተሰበሰበው ገቢ በብር",
    "ያዋቀሩ%"
  ];
  const isSummaryRow = (key: string) => summaryKeywords.some(k => key.trim() === k || key.trim().endsWith("ድምር"));

  // --- STEP 1: Horizontal computations on regular rows ---
  for (const col of schema.columns) {
    const rowKey = col.key;
    if (isSummaryRow(rowKey)) continue; // Will be handled in steps 2 and 3

    if (!data[rowKey]) data[rowKey] = {};
    const rowData = data[rowKey];
    const subKeys = col.subKeys || [];

    if (subKeys.length > 0) {
      // 1A. Subtractions / remainders
      if (subKeys.includes("ብዛት") && subKeys.includes("ያዋቀሩ") && subKeys.includes("ያላዋቀሩ")) {
        const total = parseNum(rowData["ብዛት"]);
        const established = parseNum(rowData["ያዋቀሩ"]);
        if (rowData["ብዛት"] !== undefined || rowData["ያዋቀሩ"] !== undefined) {
          rowData["ያላዋቀሩ"] = formatNum(Math.max(0, total - established));
        }
      }

      const deficitKey = subKeys.find(k => k.startsWith("ጉድለት"));
      if (deficitKey && subKeys.includes("የተመለሰ") && subKeys.includes("ያልተመለሰ")) {
        const deficit = parseNum(rowData[deficitKey]);
        const recovered = parseNum(rowData["የተመለሰ"]);
        if (rowData[deficitKey] !== undefined || rowData["የተመለሰ"] !== undefined) {
          rowData["ያልተመለሰ"] = formatNum(Math.max(0, deficit - recovered));
        }
      }

      // 1B. Horizontal row sums ("ድምር", "ድ", "ድም")
      const totalKey = subKeys.find(k => k === "ድምር" || k === "ድ" || k === "ድም");
      if (totalKey) {
        const addKeys = subKeys.filter(k => k !== totalKey && !k.includes("%") && k !== "ውሳኔ ያገኙ %" && k !== "የተፈጸመ %");
        let sum = 0;
        let anyVal = false;
        for (const k of addKeys) {
          if (rowData[k] !== undefined && rowData[k] !== "") {
            anyVal = true;
            sum += parseNum(rowData[k]);
          }
        }
        if (anyVal || rowData[totalKey] !== undefined) {
          rowData[totalKey] = formatNum(sum);
        }
      }

      // 1C. Horizontal percentages
      const percKey = subKeys.find(k => k === "%" || k.includes("%") || k === "በመቶኛ");
      if (percKey) {
        const planKey = subKeys.find(k => k === "እቅድ" || k === "ዕቅድ");
        if (planKey && subKeys.includes("ክንውን")) {
          const plan = parseNum(rowData[planKey]);
          const perf = parseNum(rowData["ክንውን"]);
          if (rowData[planKey] !== undefined || rowData["ክንውን"] !== undefined) {
            rowData[percKey] = formatPerc(perf, plan);
          }
        } else if (deficitKey && subKeys.includes("የተመለሰ")) {
          const deficit = parseNum(rowData[deficitKey]);
          const recovered = parseNum(rowData["የተመለሰ"]);
          if (rowData[deficitKey] !== undefined || rowData["የተመለሰ"] !== undefined) {
            rowData[percKey] = formatPerc(recovered, deficit);
          }
        } else if (subKeys.includes("ብዛት") && subKeys.includes("የተፈታ")) {
          const total = parseNum(rowData["ብዛት"]);
          const solved = parseNum(rowData["የተፈታ"]);
          if (rowData["ብዛት"] !== undefined || rowData["የተፈታ"] !== undefined) {
            rowData[percKey] = formatPerc(solved, total);
          }
        } else if (subKeys.includes("የቀረቡ") && subKeys.includes("ውሳኔ ያገኙ ብዛት") && percKey === "ውሳኔ ያገኙ %") {
          const sub = parseNum(rowData["የቀረቡ"]);
          const dec = parseNum(rowData["ውሳኔ ያገኙ ብዛት"]);
          if (rowData["የቀረቡ"] !== undefined || rowData["ውሳኔ ያገኙ ብዛት"] !== undefined) {
            rowData["ውሳኔ ያገኙ %"] = formatPerc(dec, sub);
          }
        } else if (subKeys.includes("የተፈጸመ ብዛት") && subKeys.includes("ድምር") && percKey === "የተፈጸመ %") {
          const exec = parseNum(rowData["የተፈጸመ ብዛት"]);
          const tot = parseNum(rowData["ድምር"]);
          if (rowData["የተፈጸመ ብዛት"] !== undefined || rowData["ድምር"] !== undefined) {
            rowData["የተፈጸመ %"] = formatPerc(exec, tot);
          }
        } else if (rowKey.includes("ወደ ዳታ ቤዝ የገባ መረጃ ብዛት") && subKeys.includes("ድ")) {
          const totalPartyMembers = parseNum(data["የፓርቲ አባላት ብዛት"]?.["ድምር"]);
          const dbMembers = parseNum(rowData["ድ"]);
          if (data["የፓርቲ አባላት ብዛት"] !== undefined || rowData["ድ"] !== undefined) {
            rowData[percKey] = formatPerc(dbMembers, totalPartyMembers);
          }
        } else if (rowKey.includes("በኮንፈረንስ ቀርቦ የጸደቀ") && subKeys.includes("ብዛት")) {
          const totalRemoved = parseNum(data["ከዚህ ውስጥ ከአባልነት የተሰረዙ ብዛት"]);
          const approved = parseNum(rowData["ብዛት"]);
          if (data["ከዚህ ውስጥ ከአባልነት የተሰረዙ ብዛት"] !== undefined || rowData["ብዛት"] !== undefined) {
            rowData[percKey] = formatPerc(approved, totalRemoved);
          }
        } else if (rowKey.includes("የአሠራር ሥርዓት መጠበቁ በኮሚሽን የተረጋገጠ") && subKeys.includes("ብዛት")) {
          const totalActions = parseNum(data["በጠቅላላ የተወሰደ ርምጃ ብዛት"]);
          const verified = parseNum(rowData["ብዛት"]);
          if (data["በጠቅላላ የተወሰደ ርምጃ ብዛት"] !== undefined || rowData["ብዛት"] !== undefined) {
            rowData[percKey] = formatPerc(verified, totalActions);
          }
        }
      }
    }
  }

  // --- STEP 2: Vertical Summary Rows ---
  for (let i = 0; i < schema.columns.length; i++) {
    const col = schema.columns[i];
    const rowKey = col.key;
    if (!isSummaryRow(rowKey)) continue;

    if (!data[rowKey]) data[rowKey] = {};
    const rowData = data[rowKey];
    const subKeys = col.subKeys || [];

    // Special Form 01 row: "ያዋቀሩ%"
    if (rowKey === "ያዋቀሩ%") {
      const totEstablished = parseNum(data["ጠቅላላ ድምር"]?.["ያዋቀሩ"]);
      const totCount = parseNum(data["ጠቅላላ ድምር"]?.["ብዛት"]);
      data[rowKey] = formatPerc(totEstablished, totCount);
      continue;
    }

    const precedingCols = schema.columns.slice(0, i).filter(c => !isSummaryRow(c.key));

    if (subKeys.length > 0) {
      for (const sub of subKeys) {
        if (sub.includes("%") || sub.includes("በመቶኛ")) continue; // Handled in Step 3

        let verticalSum = 0;
        let anyVal = false;
        for (const pCol of precedingCols) {
          const pVal = data[pCol.key]?.[sub];
          if (pVal !== undefined && pVal !== "") {
            anyVal = true;
            verticalSum += parseNum(pVal);
          }
        }
        if (anyVal || rowData[sub] !== undefined) {
          rowData[sub] = formatNum(verticalSum);
        }
      }
    } else {
      let verticalSum = 0;
      let anyVal = false;
      for (const pCol of precedingCols) {
        if (pCol.subKeys.length === 0) {
          const pVal = data[pCol.key];
          if (pVal !== undefined && pVal !== "") {
            anyVal = true;
            verticalSum += parseNum(pVal);
          }
        }
      }
      if (anyVal || data[rowKey] !== undefined) {
        data[rowKey] = formatNum(verticalSum);
      }
    }
  }

  // --- STEP 3: Recompute Horizontal Calculations on Vertical Summary Rows ---
  for (const col of schema.columns) {
    const rowKey = col.key;
    if (!isSummaryRow(rowKey) || rowKey === "ያዋቀሩ%") continue;

    const rowData = data[rowKey];
    if (!rowData || typeof rowData !== "object") continue;
    const subKeys = col.subKeys || [];

    if (subKeys.length > 0) {
      // Subtractions on total row
      if (subKeys.includes("ብዛት") && subKeys.includes("ያዋቀሩ") && subKeys.includes("ያላዋቀሩ")) {
        const total = parseNum(rowData["ብዛት"]);
        const established = parseNum(rowData["ያዋቀሩ"]);
        rowData["ያላዋቀሩ"] = formatNum(Math.max(0, total - established));
      }
      const deficitKey = subKeys.find(k => k.startsWith("ጉድለት"));
      if (deficitKey && subKeys.includes("የተመለሰ") && subKeys.includes("ያልተመለሰ")) {
        const deficit = parseNum(rowData[deficitKey]);
        const recovered = parseNum(rowData["የተመለሰ"]);
        rowData["ያልተመለሰ"] = formatNum(Math.max(0, deficit - recovered));
      }

      // Sums on total row
      const totalKey = subKeys.find(k => k === "ድምር" || k === "ድ" || k === "ድም");
      if (totalKey) {
        const addKeys = subKeys.filter(k => k !== totalKey && !k.includes("%") && k !== "ውሳኔ ያገኙ %" && k !== "የተፈጸመ %");
        let sum = 0;
        for (const k of addKeys) {
          sum += parseNum(rowData[k]);
        }
        rowData[totalKey] = formatNum(sum);
      }

      // Percentages on total row
      const percKey = subKeys.find(k => k === "%" || k.includes("%") || k === "በመቶኛ");
      if (percKey) {
        const planKey = subKeys.find(k => k === "እቅድ" || k === "ዕቅድ");
        if (planKey && subKeys.includes("ክንውን")) {
          const plan = parseNum(rowData[planKey]);
          const perf = parseNum(rowData["ክንውን"]);
          rowData[percKey] = formatPerc(perf, plan);
        } else if (deficitKey && subKeys.includes("የተመለሰ")) {
          const deficit = parseNum(rowData[deficitKey]);
          const recovered = parseNum(rowData["የተመለሰ"]);
          rowData[percKey] = formatPerc(recovered, deficit);
        } else if (subKeys.includes("ብዛት") && subKeys.includes("የተፈታ")) {
          const total = parseNum(rowData["ብዛት"]);
          const solved = parseNum(rowData["የተፈታ"]);
          rowData[percKey] = formatPerc(solved, total);
        }
      }
    }
  }

  return data;
}
