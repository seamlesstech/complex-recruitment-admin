import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({
  children,
  minWidthClassName = "min-w-[640px]",
}: {
  children: ReactNode;
  minWidthClassName?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${minWidthClassName} border-collapse text-sm`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-surface-secondary">{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({
  children,
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80 first:pl-0 last:pr-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-surface-secondary">{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-hover">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-3 py-2.5 align-middle text-fg first:pl-0 last:pr-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
