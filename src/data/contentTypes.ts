/** DCP content types (CPL kinds), e.g. for auto-ingestion settings. */
export const contentTypeOptions = [
  { id: "FTR", label: "Feature" },
  { id: "TLR", label: "Trailer" },
  { id: "ADV", label: "Advertisement" },
  { id: "SHT", label: "Short" },
  { id: "MTC", label: "Movie Teaser" },
  { id: "NWS", label: "Newsreel" },
  { id: "DOC", label: "Documentary" },
  { id: "ANM", label: "Animated Film" },
  { id: "MSC", label: "Music Video" },
  { id: "SPV", label: "Special Venue" },
  { id: "EDU", label: "Educational Film" },
  { id: "ISR", label: "Intermission Reel" },
  { id: "OTH", label: "Other" },
  { id: "UNK", label: "Unknown" }
];

export const contentTypeLabel = (id: string) => contentTypeOptions.find((o) => o.id === id)?.label ?? id;
