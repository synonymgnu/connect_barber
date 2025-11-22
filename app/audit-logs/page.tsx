import AuditLogsTable from "../_components/admin/audit-logs-table"
import AuthCheck from "../_components/auth-check"

export default function AuditLogsPage() {
  return (
    <AuthCheck requiredRole="ADMIN">
      <AuditLogsTable />
    </AuthCheck>
  )
}
