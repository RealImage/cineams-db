import { CompanyClaim } from "@/data/companyClaimsData";
import { formatDateTime } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface ClaimDetailSheetProps {
  claim: CompanyClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
);

export const ClaimDetailSheet = ({ claim, open, onOpenChange }: ClaimDetailSheetProps) => {
  if (!claim) return null;

  const handleAccept = () => {
    toast.success(`Claim by "${claim.claimedBy}" for ${claim.companyName} has been accepted.`);
    onOpenChange(false);
  };

  const handleReject = () => {
    toast.error(`Claim by "${claim.claimedBy}" for ${claim.companyName} has been rejected.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Claim Details</SheetTitle>
          <SheetDescription>Review the company claim information below.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <DetailRow label="Name" value={claim.company} />
          <DetailRow label="Legal Name" value={claim.legalName} />
          <DetailRow label="Company Role" value={claim.companyRole} />
          <Separator />
          <DetailRow label="City" value={claim.city} />
          <DetailRow label="Street Address" value={claim.streetAddress} />
          <DetailRow label="Company Website" value={claim.companyWebsite} />
          <DetailRow label="Company Phone" value={claim.companyPhone} />
          <Separator />
          <DetailRow label="Company Type" value={claim.companyType} />
          <DetailRow label="Company Name" value={claim.companyName} />
          <DetailRow label="Theatre Count" value={claim.theatreCount} />
          <DetailRow label="Screen Count" value={claim.screenCount} />
          <Separator />
          <DetailRow label="Claimed By" value={claim.claimedBy} />
          <DetailRow label="Claimed On" value={formatDateTime(claim.claimedOn)} />
        </div>

        <SheetFooter className="flex flex-row gap-2 sm:justify-start">
          <Button onClick={handleAccept} className="flex-1">Accept</Button>
          <Button variant="destructive" onClick={handleReject} className="flex-1">Reject</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
