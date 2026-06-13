import React from 'react';

interface Column {
  header: string;
  accessor: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export const DataTable = ({ columns, data }: DataTableProps) => {
  return (
    <div className="bg-surface-primary rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-secondary text-text-muted border-b border-border">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-6 py-4 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[rgba(1,75,170,0.04)] transition-colors">
              {columns.map((col) => (
                <td key={col.header} className="px-6 py-4 text-text-primary">{row[col.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
