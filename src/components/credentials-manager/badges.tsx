import { Badge } from "@/components/ui/badge";
import { DciCompliance } from "@/data/credentialsManagerData";

export const DciBadge = ({ value }: { value: DciCompliance }) => (
  <Badge variant={value === "true" ? "positive" : value === "false" ? "negative" : "secondary"}>
    {value === "NA" ? "NA" : value === "true" ? "True" : "False"}
  </Badge>
);

export const DefaultCredentialsBadge = ({ available }: { available: boolean }) => (
  <Badge variant={available ? "positive" : "notice"}>{available ? "Available" : "Missing"}</Badge>
);
