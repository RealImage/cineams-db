
import { useState, useEffect } from "react";
import { Theatre } from "@/types";
import { toast } from "sonner";

export const useTheatres = (initialTheatres: Theatre[]) => {
  const [theatres, setTheatres] = useState<Theatre[]>(initialTheatres);
  
  const handleSaveTheatre = (theatreData: Partial<Theatre>, editingTheatre?: Theatre) => {
    if (editingTheatre) {
      setTheatres(
        theatres.map((t) => 
          t.id === editingTheatre.id ? { ...t, ...theatreData, updatedAt: new Date().toISOString() } as Theatre : t
        )
      );
    } else {
      const newTheatre: Theatre = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...theatreData,
      } as Theatre;
      
      setTheatres([newTheatre, ...theatres]);
    }
  };
  
  const handleDeleteTheatre = (theatreId: string) => {
    setTheatres(theatres.filter((t) => t.id !== theatreId));
  };
  
  const handleToggleStatus = (theatre: Theatre) => {
    const newStatus = theatre.status === "Active" ? "Inactive" : "Active";
    const updatedTheatres = theatres.map((t) => 
      t.id === theatre.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } as Theatre : t
    );
    
    setTheatres(updatedTheatres);
    return newStatus;
  };
  
  return {
    theatres,
    setTheatres,
    handleSaveTheatre,
    handleDeleteTheatre,
    handleToggleStatus
  };
};
