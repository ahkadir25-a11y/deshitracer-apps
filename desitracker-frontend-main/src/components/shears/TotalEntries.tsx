interface TotalEntriesProps {
  total?: number;
}

function TotalEntries({ total }: TotalEntriesProps) {
  return (
    <p className="font-poppins text-sm whitespace-nowrap">
      Total - <span className="font-poppins text-sm font-medium">{total} </span>
      entries
    </p>
  );
}

export default TotalEntries;
