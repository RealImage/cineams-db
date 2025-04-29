
import { useState } from "react";
import { Screen } from "@/types";
import { toast } from "sonner";

interface UseScreenFormProps {
  initialData?: Screen;
  theatreId: string;
  onSave: (screen: Partial<Screen>) => void;
  onOpenChange: (open: boolean) => void;
}

export const useScreenForm = ({ 
  initialData,
  theatreId,
  onSave,
  onOpenChange
}: UseScreenFormProps) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<Partial<Screen>>(
    initialData || {
      id: crypto.randomUUID(),
      theatreId,
      number: "",
      name: "",
      uuid: crypto.randomUUID(),
      thirdPartyId: "",
      operators: [{ name: "", email: "", phone: "" }],
      autoScreenUpdateLock: false,
      flmManagementLock: false,
      multiThumbprintKdmScreen: false,
      status: "Active",
      closureNotes: "",
      seatingCapacity: undefined,
      coolingType: "",
      wheelchairAccessibility: false,
      motionSeats: false,
      dimensions: {
        auditoriumWidth: undefined,
        auditoriumHeight: undefined,
        auditoriumDepth: undefined,
        screenWidth: undefined,
        screenHeight: undefined,
        throwDistance: undefined,
        gain: undefined
      },
      projection: {
        type: "",
        manufacturer: "",
        masking: false
      },
      sound: {
        processor: "",
        speakers: "",
        soundMixes: [],
        iabSupported: false
      },
      devices: [],
      ipAddresses: [],
      suites: [],
      temporaryClosures: [],
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: ""
    }
  );
  
  const [thirdPartyDomain, setThirdPartyDomain] = useState<string>(
    initialData?.thirdPartyId ? initialData.thirdPartyId.split(':')[0] : ""
  );
  
  const [thirdPartyValue, setThirdPartyValue] = useState<string>(
    initialData?.thirdPartyId ? initialData.thirdPartyId.split(':')[1] || "" : ""
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const updatedFormData = {
      ...formData,
      thirdPartyId: thirdPartyDomain && thirdPartyValue 
        ? `${thirdPartyDomain}:${thirdPartyValue}` 
        : undefined
    };
    
    onSave(updatedFormData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Screen "${formData.name}" updated successfully` 
        : `Screen "${formData.name}" created successfully`
    );
  };

  return {
    formData,
    setFormData,
    thirdPartyDomain,
    setThirdPartyDomain,
    thirdPartyValue,
    setThirdPartyValue,
    isEditing,
    handleSubmit
  };
};
