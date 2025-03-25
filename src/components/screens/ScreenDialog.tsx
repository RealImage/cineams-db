
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Screen, ScreenDevice, Suite } from "@/types";
import { toast } from "sonner";
import { GeneralTab } from "./tabs/GeneralTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { DimensionsTab } from "./tabs/DimensionsTab";
import { ProjectionTab } from "./tabs/ProjectionTab";
import { SoundTab } from "./tabs/SoundTab";
import { DevicesTab } from "./tabs/DevicesTab";
import { SuitesTab } from "./tabs/SuitesTab";
import { TemporaryClosuresTab } from "./tabs/TemporaryClosuresTab";

interface ScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatreId: string;
  screen?: Screen;
  onSave: (screen: Partial<Screen>) => void;
}

export const ScreenDialog = ({
  open,
  onOpenChange,
  theatreId,
  screen,
  onSave,
}: ScreenDialogProps) => {
  const isEditing = !!screen;
  
  const [formData, setFormData] = useState<Partial<Screen>>(
    screen || {
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
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[0] : ""
  );
  
  const [thirdPartyValue, setThirdPartyValue] = useState<string>(
    screen?.thirdPartyId ? screen.thirdPartyId.split(':')[1] || "" : ""
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Screen" : "Create New Screen"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of an existing screen" 
              : "Enter the details to create a new screen"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
              <TabsTrigger value="sound">Sound</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="suites">Suites</TabsTrigger>
              <TabsTrigger value="closures">Temporary Closures</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <GeneralTab 
                formData={formData}
                setFormData={setFormData}
                thirdPartyDomain={thirdPartyDomain}
                setThirdPartyDomain={setThirdPartyDomain}
                thirdPartyValue={thirdPartyValue}
                setThirdPartyValue={setThirdPartyValue}
              />
            </TabsContent>
            
            <TabsContent value="details">
              <DetailsTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="dimensions">
              <DimensionsTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="projection">
              <ProjectionTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="sound">
              <SoundTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="devices">
              <DevicesTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="suites">
              <SuitesTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
            
            <TabsContent value="closures">
              <TemporaryClosuresTab 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button type="submit" variant="default">
              {isEditing ? "Update Screen" : "Create Screen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
