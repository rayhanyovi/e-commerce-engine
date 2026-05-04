import { DocsBadge } from "./docs-badge";

export interface RouteTableEntry {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  access: "Public" | "Customer" | "Admin";
}

export function DocsRouteTable({
  endpoints,
}: {
  endpoints: RouteTableEntry[];
}) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="px-4 py-3 font-medium text-muted">Method</th>
            <th className="px-4 py-3 font-medium text-muted">Path</th>
            <th className="px-4 py-3 font-medium text-muted">Summary</th>
            <th className="px-4 py-3 font-medium text-muted">Access</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3">
                <DocsBadge
                  label={ep.method}
                  variant={ep.method.toLowerCase() as "get" | "post" | "patch" | "delete"}
                />
              </td>
              <td className="px-4 py-3">
                <code className="rounded-lg border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {ep.path}
                </code>
              </td>
              <td className="px-4 py-3 text-muted">{ep.summary}</td>
              <td className="px-4 py-3">
                <DocsBadge
                  label={ep.access}
                  variant={ep.access.toLowerCase() as "public" | "customer" | "admin"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
