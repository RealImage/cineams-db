import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { deviceRoles } from "@/data/credentialsManagerData";

/** Free-text list entry: type and press Enter or comma to add; paste a comma-separated list. */
export const TagInput = ({
  id,
  value,
  onChange,
  placeholder,
  uppercase = false,
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  uppercase?: boolean;
}) => {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const items = raw.split(",").map((x) => (uppercase ? x.trim().toUpperCase() : x.trim())).filter(Boolean);
    if (items.length) onChange(Array.from(new Set([...value, ...items])));
    setText("");
  };
  return (
    <div className="flex min-h-[2.125rem] flex-wrap items-center gap-1 rounded-sm border border-input bg-card px-1.5 py-1 focus-within:border-primary">
      {value.map((v) => (
        <Badge key={v} variant="secondary" className="gap-1 pr-1">
          {v}
          <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))} className="rounded-sm hover:bg-black/10">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); add(text); }
          if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => text && add(text)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm leading-5 outline-none placeholder:text-grey-300"
      />
    </div>
  );
};

/** Multi-select over the fixed device role list (code + description). */
export const RoleMultiSelect = ({
  id,
  value,
  onChange,
  exclude = [],
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Roles already covered elsewhere (shown checked and disabled). */
  exclude?: string[];
}) => {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const options = deviceRoles.filter((r) => !q || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  const toggle = (code: string) =>
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);

  return (
    <div className="space-y-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button id={id} variant="outline" className="w-full justify-between bg-card font-normal ring-1 ring-inset ring-input">
            <span className={cn("truncate", !value.length && "text-grey-300")}>
              {value.length ? `${value.length} selected` : "Select roles"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          <Input placeholder="Search roles" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-1" />
          <div className="max-h-60 overflow-y-auto" role="listbox" aria-multiselectable="true">
            {options.map((r) => {
              const covered = exclude.includes(r.code);
              const checked = covered || value.includes(r.code);
              return (
                <label
                  key={r.code}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-sm hover:bg-black/[.03]",
                    covered && "cursor-not-allowed text-grey-300",
                  )}
                >
                  <Checkbox checked={checked} disabled={covered} onCheckedChange={() => toggle(r.code)} />
                  <span className="w-12 shrink-0 font-medium">{r.code}</span>
                  <span className="truncate text-muted-foreground">{r.description}</span>
                  {covered && <Check className="ml-auto h-3.5 w-3.5" aria-label="Already included" />}
                </label>
              );
            })}
            {options.length === 0 && <p className="py-2 text-center text-sm text-muted-foreground">No matches</p>}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((code) => (
            <Badge key={code} variant="product" className="gap-1 pr-1">
              {code}
              <button type="button" aria-label={`Remove ${code}`} onClick={() => toggle(code)} className="rounded-sm hover:bg-black/10">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
