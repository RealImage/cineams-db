import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlmFeed } from "@/data/flmFeedsData";
import { useToast } from "@/hooks/use-toast";

const domainOptions = [
  "amcnetworks.com",
  "cinemacloudworks.com",
  "cinemadb.io",
  "cinemark.com",
  "dcddistribution.com",
  "disney.com",
  "eikon.group",
  "emick.com",
  "fathomevents.com",
  "maccs.com",
  "metameida.global",
  "nbcuniversal.com",
  "rentrak.com",
  "technicolor.com",
  "vert-ent.com",
  "warnerbros.com",
  "yashrajfilms.com",
];

interface MapThirdPartyIdDialogProps {
  feed: FlmFeed | null;
  onClose: () => void;
}

export const MapThirdPartyIdDialog = ({ feed, onClose }: MapThirdPartyIdDialogProps) => {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Third-party ID mapped",
      description: `${domain}:${identifier} mapped to ${feed?.theatreName}.`,
    });
    setDomain("");
    setIdentifier("");
    onClose();
  };

  return (
    <Dialog open={!!feed} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Map Third Party ID</DialogTitle>
          <DialogDescription>
            Map a third-party identifier to <span className="font-medium">{feed?.theatreName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Feed Theatre ID</Label>
              <Input value={feed?.theatreIdFeed ?? ""} readOnly disabled className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flm-domain">Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger id="flm-domain">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domainOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flm-id">ID</Label>
              <Input
                id="flm-id"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter ID"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!domain || !identifier}>
              Map ID
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
