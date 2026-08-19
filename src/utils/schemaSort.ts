export interface FormSchemaSortable {
  id?: string;
  table_title?: string;
  [key: string]: any;
}

/**
 * Sorts form schemas in natural ascending order (from Form 01 up to Form 25+).
 * Correctly handles sub-forms like form_06_1 (ቅጽ 06-1) and form_06_2 (ቅጽ 06-2).
 */
export function sortFormSchemas<T extends FormSchemaSortable>(schemas: T[]): T[] {
  if (!Array.isArray(schemas)) return [];
  
  return [...schemas].sort((a, b) => {
    const getNum = (item: T) => {
      if (item.id) {
        const idMatch = item.id.match(/form_(\d+)(?:_(\d+))?/i);
        if (idMatch) {
          const major = parseInt(idMatch[1], 10);
          const minor = idMatch[2] ? parseInt(idMatch[2], 10) / 100 : 0;
          return major + minor;
        }
      }
      if (item.table_title) {
        const titleMatch = item.table_title.match(/ቅጽ\s*(\d+)(?:[-_](\d+))?/i);
        if (titleMatch) {
          const major = parseInt(titleMatch[1], 10);
          const minor = titleMatch[2] ? parseInt(titleMatch[2], 10) / 100 : 0;
          return major + minor;
        }
      }
      return 9999;
    };

    const numA = getNum(a);
    const numB = getNum(b);
    if (numA !== numB) {
      return numA - numB;
    }
    return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
  });
}
