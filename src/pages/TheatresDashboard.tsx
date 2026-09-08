import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardItem {
  label: string;
  count: number;
  path?: string;
}

const approvals: DashboardItem[] = [
  { label: "Chain Updates", count: 0 },
  { label: "Company Claims", count: 22, path: "/approvals-conflicts/company-claims" },
  { label: "Integrators", count: 0 },
  { label: "Partners", count: 1, path: "/approvals-conflicts/partners" },
  { label: "Theatre Additions", count: 0 },
  { label: "Theatre Deletions", count: 0 },
  { label: "Theatre Updates", count: 0 },
];

const conflicts: DashboardItem[] = [
  { label: "Device Conflicts", count: 1 },
  { label: "Facilities without Chains", count: 10435 },
  { label: "Facilities without Location", count: 2118 },
  { label: "Facility Duplications", count: 0 },
  { label: "Missing Models", count: 65 },
  { label: "Missing Places", count: 0 },
  { label: "Missing Province Codes", count: 0 },
  { label: "Screens with Numeric Names", count: 2 },
  { label: "Screens without Devices", count: 185986 },
  { label: "Screens without Screen Names or Numbers", count: 0 },
];

const thirdParty: DashboardItem[] = [
  { label: "Third-party Chain Updates: API", count: 0 },
  { label: "Third-party Theatre Updates: API", count: 0 },
  { label: "Third-party Theatre Updates: FLM", count: 3024, path: "/theatres/flm-feeds" },
  { label: "WireTAPs", count: 10322, path: "/qube-appliances/wiretap" },
];

const Row = ({ item, onClick }: { item: DashboardItem; onClick?: () => void }) => (
  <div
    className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
      onClick ? "hover:bg-muted/50 cursor-pointer" : ""
    }`}
    onClick={onClick}
  >
    <span className="text-sm">{item.label}</span>
    <Badge
      variant={item.count > 0 ? "default" : "secondary"}
      className="min-w-[3rem] justify-center"
    >
      {item.count.toLocaleString()}
    </Badge>
  </div>
);

const Section = ({
  title,
  items,
  delay,
}: {
  title: string;
  items: DashboardItem[];
  delay: number;
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {items.map((item) => (
            <Row
              key={item.label}
              item={item}
              onClick={item.path ? () => navigate(item.path!) : undefined}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TheatresDashboard = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="space-y-6">
      <Section title="Approvals" items={approvals} delay={0} />
      <Section title="Third-party Updates" items={thirdParty} delay={0.2} />
    </div>
    <Section title="Conflicts" items={conflicts} delay={0.1} />
  </div>
);

export default TheatresDashboard;
