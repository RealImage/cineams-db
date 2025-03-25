
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Screen, TemporaryClosure } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { tempClosureReasonsList } from "../constants";

interface TemporaryClosuresTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const TemporaryClosuresTab = ({
  formData,
  setFormData,
}: TemporaryClosuresTabProps) => {
  const [tempClosureStartDate, setTempClosureStartDate] = useState<Date | undefined>(undefined);
  const [tempClosureEndDate, setTempClosureEndDate] = useState<Date | undefined>(undefined);
  const [tempClosureReason, setTempClosureReason] = useState<string>("");
  const [tempClosureNotes, setTempClosureNotes] = useState<string>("");
  
  const handleAddTempClosure = () => {
    if (!tempClosureStartDate || !tempClosureReason) {
      toast.error("Please fill in all required fields for temporary closure");
      return;
    }
    
    const newClosure = {
      id: crypto.randomUUID(),
      startDate: tempClosureStartDate.toISOString(),
      endDate: tempClosureEndDate?.toISOString(),
      reason: tempClosureReason,
      notes: tempClosureNotes,
      active: true
    };
    
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: [...(prev.temporaryClosures || []), newClosure]
    }));
    
    setTempClosureStartDate(undefined);
    setTempClosureEndDate(undefined);
    setTempClosureReason("");
    setTempClosureNotes("");
  };
  
  const handleRemoveTempClosure = (closureId: string) => {
    setFormData((prev) => ({
      ...prev,
      temporaryClosures: (prev.temporaryClosures || []).filter(closure => closure.id !== closureId)
    }));
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add Temporary Closure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tempClosureStartDate">Start Date (Required)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="tempClosureStartDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tempClosureStartDate && "text-muted-foreground"
                  )}
                >
                  {tempClosureStartDate ? format(tempClosureStartDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tempClosureStartDate}
                  onSelect={setTempClosureStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tempClosureEndDate">End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="tempClosureEndDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !tempClosureEndDate && "text-muted-foreground"
                  )}
                >
                  {tempClosureEndDate ? format(tempClosureEndDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tempClosureEndDate}
                  onSelect={setTempClosureEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tempClosureReason">Reason (Required)</Label>
          <Select
            value={tempClosureReason}
            onValueChange={setTempClosureReason}
          >
            <SelectTrigger id="tempClosureReason">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              {tempClosureReasonsList.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tempClosureNotes">Notes</Label>
          <Textarea
            id="tempClosureNotes"
            value={tempClosureNotes}
            onChange={(e) => setTempClosureNotes(e.target.value)}
            placeholder="Additional details about the closure"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleAddTempClosure}>
          <Plus className="h-4 w-4 mr-2" /> Add Closure
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label>Current Temporary Closures</Label>
        {formData.temporaryClosures && formData.temporaryClosures.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.temporaryClosures.map((closure) => (
                <TableRow key={closure.id}>
                  <TableCell>{format(new Date(closure.startDate), "PPP")}</TableCell>
                  <TableCell>
                    {closure.endDate ? format(new Date(closure.endDate), "PPP") : "Indefinite"}
                  </TableCell>
                  <TableCell>{closure.reason}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTempClosure(closure.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No temporary closures have been added yet</p>
        )}
      </div>
    </div>
  );
};
