import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlmFeed } from "@/data/flmFeedsData";
import { FlmDetailSheet } from "@/components/flm/FlmDetailSheet";
import { MapThirdPartyIdDialog } from "@/components/flm/MapThirdPartyIdDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { flmFeeds } from "@/data/flmFeedsData";
import { formatDate, formatTime } from "@/lib/dateUtils";

const SOURCES = ["MACCS", "DCIP", "Qube Radar", "Cinergy", "Sony", "KDMx"];

const FLMFeeds = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [isNew, setIsNew] = useState("all");
  const [detailFeed, setDetailFeed] = useState<FlmFeed | null>(null);
  const [mapFeed, setMapFeed] = useState<FlmFeed | null>(null);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
    });
  };

  const handleIgnore = (feed: FlmFeed) => {
    setIgnoredIds((prev) => new Set(prev).add(feed.id));
    toast({ title: "Update ignored", description: `${feed.theatreName} feed update has been ignored.` });
  };

  const handleAddTheatre = (feed: FlmFeed) => {
    toast({ title: "Add Theatre", description: `Starting add-theatre flow for ${feed.theatreName}.` });
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return flmFeeds.filter((f) => {
      if (ignoredIds.has(f.id)) return false;
      const matchesSearch =
        !q ||
        [f.theatreName, f.theatreDisplayName, f.chain, f.location, f.theatreIdFeed, f.theatreUuid]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesSource = source === "all" || f.source === source;
      const matchesStatus = status === "all" || f.status === status;
      const matchesNew =
        isNew === "all" || (isNew === "yes" ? f.isNewTheatre : !f.isNewTheatre);
      return matchesSearch && matchesSource && matchesStatus && matchesNew;
    });
  }, [search, source, status, isNew, ignoredIds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground text-sm">
          Theatre records received through FLM feeds ({rows.length})
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search theatre, chain, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[260px]"
            />
          </div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={isNew} onValueChange={setIsNew}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="New Theatre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Theatres</SelectItem>
              <SelectItem value="yes">New Only</SelectItem>
              <SelectItem value="no">Existing Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Auto-Updated">Auto-Updated</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Theatre Name</TableHead>
              <TableHead>Target Chain</TableHead>
              <TableHead>Source Feed</TableHead>
              <TableHead>Source Theatre ID</TableHead>
              <TableHead>New Theatre?</TableHead>
              <TableHead>Received On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No feed records found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-default">
                        <div className="font-medium">{f.theatreName}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs space-y-2 p-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Name</p>
                            <p className="text-sm font-medium">{f.theatreName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreName, "Theatre Name")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Display Name</p>
                            <p className="text-sm">{f.theatreDisplayName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreDisplayName, "Theatre Display Name")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre UUID</p>
                            <p className="font-mono text-xs break-all">{f.theatreUuid}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.theatreUuid, "Theatre UUID")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Theatre Address</p>
                            <p className="text-sm">{f.address}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(f.address, "Theatre Address")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-sm">{f.chain}</TableCell>
                <TableCell>
                  <Badge variant="outline">{f.source}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs">{f.theatreIdFeed}</div>
                  <div className="text-xs text-muted-foreground">{f.location}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={f.isNewTheatre ? "default" : "secondary"}>
                    {f.isNewTheatre ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{formatDate(f.receivedOn)}</div>
                  <div className="text-xs text-muted-foreground">{formatTime(f.receivedOn)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={f.status === "Auto-Updated" ? "secondary" : "outline"}>
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDetailFeed(f)}>
                        View FLM Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMapFeed(f)}>
                        Map Third Party ID
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleIgnore(f)}>
                        Ignore Update
                      </DropdownMenuItem>
                      {f.isNewTheatre && (
                        <DropdownMenuItem onClick={() => handleAddTheatre(f)}>
                          Add New Theatre
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FlmDetailSheet feed={detailFeed} onClose={() => setDetailFeed(null)} />
      <MapThirdPartyIdDialog feed={mapFeed} onClose={() => setMapFeed(null)} />
    </motion.div>
  );
};

export default FLMFeeds;
