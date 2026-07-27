import { computeFormCalculations, isCalculatedField } from "./formCalculations";
import { FormSchema } from "@/components/dashboard/forms/FormTableRenderer";

describe("formCalculations", () => {
  describe("isCalculatedField", () => {
    it("identifies summary rows as read-only", () => {
      expect(isCalculatedField("ጠቅላላ ድምር")).toBe(true);
      expect(isCalculatedField("አጠቃላይ ድምር", "እቅድ")).toBe(true);
      expect(isCalculatedField("ያዋቀሩ%")).toBe(true);
    });

    it("identifies row total keys as calculated fields", () => {
      expect(isCalculatedField("የክልል ኮሚሽን", "ድምር")).toBe(true);
      expect(isCalculatedField("የክልል ኮሚሽን", "ድ")).toBe(true);
      expect(isCalculatedField("የክልል ኮሚሽን", "ድም")).toBe(true);
    });

    it("identifies calculated differences and percentage fields", () => {
      expect(isCalculatedField("ለክልል ተጠሪ ዞን", "ያላዋቀሩ", ["ብዛት", "ያዋቀሩ", "ያላዋቀሩ"])).toBe(true);
      expect(isCalculatedField("ለክልል ተጠሪ ዞን", "%", ["እቅድ", "ክንውን", "%"])).toBe(true);
      expect(isCalculatedField("ለክልል ተጠሪ ዞን", "ያዋቀሩ", ["ብዛት", "ያዋቀሩ", "ያላዋቀሩ"])).toBe(false);
      expect(isCalculatedField("ለክልል ተጠሪ ዞን", "እቅድ", ["እቅድ", "ክንውን", "%"])).toBe(false);
    });
  });

  describe("computeFormCalculations", () => {
    it("automatically computes Form 01 subtractions, totals, and percentages", () => {
      const schema: FormSchema = {
        id: "form_01",
        table_title: "Form 01",
        columns: [
          { key: "ዞን", subKeys: ["ብዛት", "ያዋቀሩ", "ያላዋቀሩ"] },
          { key: "ወረዳ", subKeys: ["ብዛት", "ያዋቀሩ", "ያላዋቀሩ"] },
          { key: "ጠቅላላ ድምር", subKeys: ["ብዛት", "ያዋቀሩ", "ያላዋቀሩ"] },
          { key: "ያዋቀሩ%", subKeys: [] }
        ]
      };

      const rawData = {
        "ዞን": { "ብዛት": "100", "ያዋቀሩ": "80" },
        "ወረዳ": { "ብዛት": "50", "ያዋቀሩ": "20" }
      };

      const result = computeFormCalculations(schema, rawData);

      // Check row level calculation (ያላዋቀሩ = ብዛት - ያዋቀሩ)
      expect(result["ዞን"]["ያላዋቀሩ"]).toBe("20");
      expect(result["ወረዳ"]["ያላዋቀሩ"]).toBe("30");

      // Check vertical total sum (ጠቅላላ ድምር)
      expect(result["ጠቅላላ ድምር"]["ብዛት"]).toBe("150");
      expect(result["ጠቅላላ ድምር"]["ያዋቀሩ"]).toBe("100");
      expect(result["ጠቅላላ ድምር"]["ያላዋቀሩ"]).toBe("50");

      // Check percentage row (ያዋቀሩ% = 100 / 150 * 100)
      expect(result["ያዋቀሩ%"]).toBe("66.67");
    });

    it("automatically computes Plan, Performance, and Percentages (Form 04 pattern)", () => {
      const schema: FormSchema = {
        id: "form_04",
        table_title: "Form 04",
        columns: [
          { key: "ክልል ጽ/ቤት", subKeys: ["እቅድ", "ክንውን", "%"] },
          { key: "ዞን ጽ/ቤት", subKeys: ["እቅድ", "ክንውን", "%"] },
          { key: "ጠቅላላ ድምር", subKeys: ["እቅድ", "ክንውን", "%"] }
        ]
      };

      const rawData = {
        "ክልል ጽ/ቤት": { "እቅድ": "200", "ክንውን": "150" },
        "ዞን ጽ/ቤት": { "እቅድ": "300", "ክንውን": "300" }
      };

      const result = computeFormCalculations(schema, rawData);

      expect(result["ክልል ጽ/ቤት"]["%"]).toBe("75.00");
      expect(result["ዞን ጽ/ቤት"]["%"]).toBe("100.00");

      expect(result["ጠቅላላ ድምር"]["እቅድ"]).toBe("500");
      expect(result["ጠቅላላ ድምር"]["ክንውን"]).toBe("450");
      // Percentage of total (450 / 500 * 100) = 90%
      expect(result["ጠቅላላ ድምር"]["%"]).toBe("90.00");
    });

    it("automatically computes male and female sum (Form 02 pattern)", () => {
      const schema: FormSchema = {
        id: "form_02",
        table_title: "Form 02",
        columns: [
          { key: "የክልል ኮሚሽን", subKeys: ["ወ", "ሴ", "ድ"] },
          { key: "የዞን ኮሚሽን", subKeys: ["ወ", "ሴ", "ድ"] },
          { key: "ጠቅላላ ድምር", subKeys: ["ወ", "ሴ", "ድ"] }
        ]
      };

      const rawData = {
        "የክልል ኮሚሽን": { "ወ": "40", "ሴ": "25" },
        "የዞን ኮሚሽን": { "ወ": "60", "ሴ": "35" }
      };

      const result = computeFormCalculations(schema, rawData);

      expect(result["የክልል ኮሚሽን"]["ድ"]).toBe("65");
      expect(result["የዞን ኮሚሽን"]["ድ"]).toBe("95");
      expect(result["ጠቅላላ ድምር"]["ወ"]).toBe("100");
      expect(result["ጠቅላላ ድምር"]["ሴ"]).toBe("60");
      expect(result["ጠቅላላ ድምር"]["ድ"]).toBe("160");
    });
  });
});
