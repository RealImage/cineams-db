import { useState, useMemo } from "react";
import { PartnerRequest, OperationsRegion, locationOptions, chainOptions, theatreOptions } from "@/data/partnersData";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PartnerDetailSheetProps {
  partner: PartnerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
);

type ParameterType = "Location" | "Chain" | "Theatre";

const optionsMap: Record<ParameterType, string[]> = {
  Location: locationOptions,
  Chain: chainOptions,
  Theatre: theatreOptions,
};

export const PartnerDetailSheet = ({ partner, open, onOpenChange }: PartnerDetailSheetProps) => {
  const [regions, setRegions] = useState<OperationsRegion[]>([]);
  const [parameterType, setParameterType] = useState<ParameterType>("Location");
  const [searchValue, setSearchValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    return optionsMap[parameterType].filter((opt) =>
      opt.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [parameterType, searchValue]);

  if (!partner) return null;

  const handleAdd = () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a value");
      return;
    }
    const newRegion: OperationsRegion = {
      id: crypto.randomUUID(),
      parameterType,
      value: searchValue.trim(),
    };
    setRegions((prev) => [...prev, newRegion]);
    setSearchValue("");
    toast.success("Operations region added");
  };

  const handleDelete = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
    toast.success("Operations region removed");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Partner Request</SheetTitle>
          <SheetDescription>Review the partner details below.</SheetDescription>
        </SheetHeader>

        {/* Section 1: Partner Details */}
        <div className="py-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Partner Details</h3>
          <div className="grid gap-3">
            <DetailRow label="Name" value={partner.name} />
            <DetailRow label="Company Legal Name" value={partner.companyLegalName} />
            <DetailRow label="Company Role" value={partner.companyRole} />
            <DetailRow label="Street Address" value={partner.streetAddress} />
            <DetailRow label="Location" value={`${partner.city}, ${partner.state}, ${partner.country}`} />
            <DetailRow label="Company Website" value={partner.companyWebsite} />
            <DetailRow label="Company Phone" value={partner.companyPhone} />
          </div>
        </div>

        <Separator />

        {/* Section 2: Partner Operations Region */}
        <div className="py-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Partner Operations Region</h3>

          <div className="flex items-end gap-2">
            <div className="space-y-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground">Parameter Type</span>
              <Select value={parameterType} onValueChange={(v) => { setParameterType(v as ParameterType); setSearchValue(""); }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Location">Location</SelectItem>
                  <SelectItem value="Chain">Chain</SelectItem>
                  <SelectItem value="Theatre">Theatre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex-1">
              <span className="text-xs text-muted-foreground">Value</span>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Input
                    placeholder={`Search ${parameterType.toLowerCase()}...`}
                    value={searchValue}
                    onChange={(e) => { setSearchValue(e.target.value); setPopoverOpen(true); }}
                    onFocus={() => setPopoverOpen(true)}
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {filteredOptions.map((option) => (
                          <CommandItem
                            key={option}
                            value={option}
                            onSelect={(val) => {
                              setSearchValue(val);
                              setPopoverOpen(false);
                            }}
                          >
                            {option}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleAdd} size="sm" className="flex-shrink-0">
              Add
            </Button>
          </div>

          {regions.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="text-sm">{region.parameterType}</TableCell>
                      <TableCell className="text-sm">{region.value}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(region.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
