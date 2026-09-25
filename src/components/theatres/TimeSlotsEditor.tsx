import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeliveryTimeSlot } from "@/types";

const weekDayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => ({ value: d, label: d }));

/** An editable list of weekly day / start / end slots, e.g. auto-ingestion windows. */
export const TimeSlotsEditor = ({
  label,
  slots,
  onChange,
  emptyText,
}: {
  label: string;
  slots: DeliveryTimeSlot[];
  onChange: (slots: DeliveryTimeSlot[]) => void;
  emptyText: string;
}) => {
  const update = (id: string, patch: Partial<DeliveryTimeSlot>) => onChange(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const add = () => onChange([...slots, { id: crypto.randomUUID(), day: "Monday", startTime: "00:00", endTime: "06:00" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Time Slot
        </Button>
      </div>
      {slots.length === 0 ? (
        <p className="rounded-md border p-4 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="grid grid-cols-[1fr_8rem_8rem_2.125rem] items-center gap-2">
              <Combobox aria-label="Day" value={slot.day} onChange={(v) => update(slot.id, { day: v ?? "" })} options={weekDayOptions} placeholder="Select day" />
              <Input type="time" aria-label="Start time" value={slot.startTime} onChange={(e) => update(slot.id, { startTime: e.target.value })} />
              <Input type="time" aria-label="End time" value={slot.endTime} onChange={(e) => update(slot.id, { endTime: e.target.value })} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove time slot" onClick={() => onChange(slots.filter((s) => s.id !== slot.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
