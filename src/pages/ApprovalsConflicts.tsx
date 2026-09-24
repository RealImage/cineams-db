import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useApprovalsSummary } from "@/hooks/api/approvals";
import { QueryState } from "@/components/ui/query-state";

interface DashboardItem {
  label: string;
  count: number;
}

const DashboardItemRow = ({ item, onClick }: { item: DashboardItem; onClick?: () => void }) => (
  <div
    className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
    onClick={onClick}
  >
    <span className="text-sm">{item.label}</span>
    <Badge variant={item.count > 0 ? "default" : "secondary"} className="min-w-[3rem] justify-center">
      {item.count.toLocaleString()}
    </Badge>
  </div>
);

const approvalRoutes: Record<string, string> = {
  "Company Claims": "/approvals-conflicts/company-claims",
  "Partners": "/approvals-conflicts/partners",
};

const ApprovalsConflicts = () => {
  const summaryQuery = useApprovalsSummary();
  return (
    <QueryState query={summaryQuery} label="approvals and conflicts">
      {(summary) => <ApprovalsConflictsView approvalItems={summary.approvals} conflictItems={summary.conflicts} />}
    </QueryState>
  );
};

const ApprovalsConflictsView = ({ approvalItems, conflictItems }: { approvalItems: DashboardItem[]; conflictItems: DashboardItem[] }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Approvals Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {approvalItems.map((item) => (
                <DashboardItemRow
                  key={item.label}
                  item={item}
                  onClick={approvalRoutes[item.label] ? () => navigate(approvalRoutes[item.label]) : undefined}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Conflicts Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Conflicts Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {conflictItems.map((item) => (
                <DashboardItemRow key={item.label} item={item} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ApprovalsConflicts;
