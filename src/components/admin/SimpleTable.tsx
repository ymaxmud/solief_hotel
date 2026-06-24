export function SimpleTable({ headers, rows, emptyLabel }: { headers: string[]; rows: Array<Array<React.ReactNode>>; emptyLabel: string }) {
  if (!rows.length) return <p className="rounded-lg bg-white/70 p-5 text-sm text-greenGray">{emptyLabel}</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-charcoal/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-greenGray text-white">
          <tr>{headers.map((header) => <th key={header} className="p-3 font-bold">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-charcoal/10">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
