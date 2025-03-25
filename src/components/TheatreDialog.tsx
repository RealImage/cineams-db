
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Screen, 
  Theatre, 
  WireTAPDevice, 
  DeliveryTimeSlot,
  DCPPhysicalDeliveryMethod,
  DCPNetworkDeliveryMethod,
  DCPModemDeliveryMethod,
  Contact,
  DeliveryAddress
} from "@/types";
import { DataTable, Column } from "@/components/ui/data-table";
import { ScreenDialog } from "./ScreenDialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Building, 
  Bike, 
  Car, 
  Monitor, 
  Server, 
  Ticket, 
  Cable, 
  Network,
  Clock,
  Truck,
  FileText,
  Globe,
  Phone,
  Mail,
  Key,
  Upload,
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TheatreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theatre?: Theatre;
  onSave: (theatre: Partial<Theatre>) => void;
  isFullPage?: boolean;
}

export const TheatreDialog = ({
  open,
  onOpenChange,
  theatre,
  onSave,
  isFullPage = false,
}: TheatreDialogProps) => {
  const isEditing = !!theatre;
  
  const [formData, setFormData] = useState<Partial<Theatre>>(
    theatre || {
      name: "",
      displayName: "",
      uuid: crypto.randomUUID(),
      chainId: "",
      chainName: "",
      companyId: "",
      companyName: "",
      listing: "Listed",
      type: "Multiplex",
      address: "",
      status: "Active",
      screenCount: 0,
      locationType: "Information Not Available",
      bikeParkingAvailable: false,
      carParkingAvailable: false,
      theatreManagementSystem: "Information Not Available",
      ticketingSystem: "Information Not Available",
      wireTAPDevices: [],
      // Content delivery defaults
      deliveryTimeSlots: [],
      deliveryAddress: { useTheatreAddress: true },
      deliveryInstructions: "",
      dcpPhysicalDeliveryMethods: [],
      dcpNetworkDeliveryMethods: [],
      dcpModemDeliveryMethods: [],
      dcpDeliveryContacts: [],
      sendEmailsForDCPDelivery: false,
      dcpContentTypesForEmail: [],
      // Key delivery defaults
      keyDeliveryContacts: [],
      kdmDeliveryEmailsInFLMX: "useDropbox",
      // Ingest settings defaults
      autoIngestOfContentEnabled: false,
      autoIngestContentTypes: [],
      qcnTheatreIPAddressRange: ""
    }
  );
  
  const [screens, setScreens] = useState<Screen[]>(
    theatre?.screens || []
  );

  const [wireDevices, setWireDevices] = useState<WireTAPDevice[]>(
    theatre?.wireTAPDevices || []
  );
  
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | undefined>(undefined);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNumberChange = (name: string, value: string) => {
    const numberValue = value === '' ? undefined : parseInt(value, 10);
    setFormData((prev) => ({ ...prev, [name]: numberValue }));
  };
  
  // Screen management
  const handleCreateScreen = () => {
    if (!formData.id) {
      toast.error("Please save the theatre first before adding screens");
      return;
    }
    setEditingScreen(undefined);
    setScreenDialogOpen(true);
  };
  
  const handleEditScreen = (screen: Screen) => {
    setEditingScreen(screen);
    setScreenDialogOpen(true);
  };
  
  const handleDeleteScreen = (screen: Screen) => {
    setScreens(screens.filter((s) => s.id !== screen.id));
    toast.success(`Screen "${screen.name}" deleted successfully`);
    
    // Update screen count
    setFormData(prev => ({
      ...prev,
      screenCount: (prev.screenCount || 0) - 1
    }));
  };
  
  const handleSaveScreen = (screenData: Partial<Screen>) => {
    if (editingScreen) {
      // Update existing screen
      setScreens(screens.map((s) => 
        s.id === editingScreen.id ? { ...s, ...screenData, updatedAt: new Date().toISOString() } as Screen : s
      ));
    } else {
      // Create new screen
      const newScreen = {
        ...screenData,
        theatreId: formData.id as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Screen;
      
      setScreens([...screens, newScreen]);
      
      // Update screen count
      setFormData(prev => ({
        ...prev,
        screenCount: (prev.screenCount || 0) + 1
      }));
    }
  };
  
  const screenColumns: Column<Screen>[] = [
    {
      header: "Number",
      accessor: "number" as keyof Screen
    },
    {
      header: "Name",
      accessor: "name" as keyof Screen
    },
    {
      header: "Status",
      accessor: "status" as keyof Screen,
      cell: (row: Screen) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : row.status === "Inactive" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: "Devices",
      accessor: "devices" as keyof Screen,
      cell: (row: Screen) => row.devices?.length || 0
    }
  ];
  
  const screenActions = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditScreen
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteScreen
    }
  ];
  
  // WireTAP Device management
  const handleAddWireTAPDevice = () => {
    const newDevice: WireTAPDevice = {
      id: crypto.randomUUID(),
      serialNumber: "",
      mappingStatus: "Unmapped",
      theatreId: formData.id,
      theatreName: formData.name,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setWireDevices([...wireDevices, newDevice]);
  };
  
  const handleDeleteWireTAPDevice = (deviceId: string) => {
    setWireDevices(wireDevices.filter(device => device.id !== deviceId));
    toast.success("Device removed successfully");
  };
  
  const handleWireTAPDeviceChange = (deviceId: string, field: keyof WireTAPDevice, value: any) => {
    setWireDevices(wireDevices.map(device => 
      device.id === deviceId 
        ? { ...device, [field]: value, updatedAt: new Date().toISOString() } 
        : device
    ));
  };

  // Delivery Time Slots
  const handleAddDeliveryTimeSlot = () => {
    const newTimeSlot: DeliveryTimeSlot = {
      id: crypto.randomUUID(),
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00"
    };

    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: [...(prev.deliveryTimeSlots || []), newTimeSlot]
    }));
  };

  const handleDeleteDeliveryTimeSlot = (slotId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).filter(slot => slot.id !== slotId)
    }));
  };

  const handleDeliveryTimeSlotChange = (slotId: string, field: keyof DeliveryTimeSlot, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: (prev.deliveryTimeSlots || []).map(slot => 
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleCopyToAllDays = (slotId: string) => {
    const sourceSlot = formData.deliveryTimeSlots?.find(slot => slot.id === slotId);
    if (!sourceSlot) return;

    const weekdays: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    // Filter out existing slots
    const existingDays = formData.deliveryTimeSlots?.map(slot => slot.day) || [];
    const daysToAdd = weekdays.filter(day => !existingDays.includes(day));

    // Create new slots for missing days
    const newSlots = daysToAdd.map(day => ({
      id: crypto.randomUUID(),
      day,
      startTime: sourceSlot.startTime,
      endTime: sourceSlot.endTime
    }));

    setFormData(prev => ({
      ...prev,
      deliveryTimeSlots: [...(prev.deliveryTimeSlots || []), ...newSlots]
    }));

    toast.success("Time slots copied to all days");
  };

  // Delivery Address
  const handleDeliveryAddressChange = (field: keyof DeliveryAddress, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliveryAddress: {
        ...(prev.deliveryAddress || { useTheatreAddress: true }),
        [field]: value
      }
    }));
  };

  // DCP Physical Delivery Methods
  const handleAddPhysicalDeliveryMethod = () => {
    const newMethod: DCPPhysicalDeliveryMethod = {
      id: crypto.randomUUID(),
      mediaType: "",
      details: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: [...(prev.dcpPhysicalDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeletePhysicalDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handlePhysicalDeliveryMethodChange = (methodId: string, field: keyof DCPPhysicalDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpPhysicalDeliveryMethods: (prev.dcpPhysicalDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Network Delivery Methods
  const handleAddNetworkDeliveryMethod = () => {
    const newMethod: DCPNetworkDeliveryMethod = {
      id: crypto.randomUUID(),
      networkURL: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: [...(prev.dcpNetworkDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeleteNetworkDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handleNetworkDeliveryMethodChange = (methodId: string, field: keyof DCPNetworkDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpNetworkDeliveryMethods: (prev.dcpNetworkDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Modem Delivery Methods
  const handleAddModemDeliveryMethod = () => {
    const newMethod: DCPModemDeliveryMethod = {
      id: crypto.randomUUID(),
      modemPhoneNumber: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: [...(prev.dcpModemDeliveryMethods || []), newMethod]
    }));
  };

  const handleDeleteModemDeliveryMethod = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).filter(method => method.id !== methodId)
    }));
  };

  const handleModemDeliveryMethodChange = (methodId: string, field: keyof DCPModemDeliveryMethod, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpModemDeliveryMethods: (prev.dcpModemDeliveryMethods || []).map(method => 
        method.id === methodId ? { ...method, [field]: value } : method
      )
    }));
  };

  // DCP Delivery Contacts
  const handleAddDCPDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: "",
      email: ""
    };

    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: [...(prev.dcpDeliveryContacts || []), newContact]
    }));
  };

  const handleDeleteDCPDeliveryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).filter(contact => contact.id !== contactId)
    }));
  };

  const handleDCPDeliveryContactChange = (contactId: string, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      dcpDeliveryContacts: (prev.dcpDeliveryContacts || []).map(contact => 
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // DCP Content Types for Email
  const contentTypeOptions = [
    { id: "FTR", label: "Feature" },
    { id: "TLR", label: "Trailer" },
    { id: "ADV", label: "Advertisement" },
    { id: "PSA", label: "Public Service Announcement" },
    { id: "POL", label: "Policy Trailer" },
    { id: "SHR", label: "Short" },
    { id: "TSR", label: "Teaser" },
    { id: "RTG", label: "Rating Tag" },
    { id: "PRE", label: "Pre-show" },
    { id: "INT", label: "Intermission" },
    { id: "PLY", label: "Policy" },
    { id: "EXT", label: "Extras" },
    { id: "SNP", label: "Snippet" },
    { id: "VAR", label: "Various" }
  ];

  const handleContentTypeChange = (contentType: string) => {
    setFormData(prev => {
      const currentTypes = prev.dcpContentTypesForEmail || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter(type => type !== contentType)
        : [...currentTypes, contentType];
      
      return {
        ...prev,
        dcpContentTypesForEmail: updatedTypes
      };
    });
  };

  // Key Delivery Contacts
  const handleAddKeyDeliveryContact = () => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: "",
      email: ""
    };

    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: [...(prev.keyDeliveryContacts || []), newContact]
    }));
  };

  const handleDeleteKeyDeliveryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).filter(contact => contact.id !== contactId)
    }));
  };

  const handleKeyDeliveryContactChange = (contactId: string, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyDeliveryContacts: (prev.keyDeliveryContacts || []).map(contact => 
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // Auto Ingest Content Types
  const handleAutoIngestContentTypeChange = (contentType: string) => {
    setFormData(prev => {
      const currentTypes = prev.autoIngestContentTypes || [];
      const updatedTypes = currentTypes.includes(contentType)
        ? currentTypes.filter(type => type !== contentType)
        : [...currentTypes, contentType];
      
      return {
        ...prev,
        autoIngestContentTypes: updatedTypes
      };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.displayName || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Include screens and WireTAP devices in the theatre data
    const theatreData = {
      ...formData,
      screens: screens,
      wireTAPDevices: wireDevices,
    };
    
    onSave(theatreData);
    onOpenChange(false);
    
    toast.success(
      isEditing 
        ? `Theatre "${formData.name}" updated successfully` 
        : `Theatre "${formData.name}" created successfully`
    );
  };
  
  // Conditional rendering based on isFullPage
  const renderDialogContent = () => {
    return (
      <div className={isFullPage ? "container mx-auto max-w-5xl py-6" : ""}>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="location">Location & Systems</TabsTrigger>
              <TabsTrigger value="delivery">Content & Key Delivery</TabsTrigger>
              <TabsTrigger value="screens">Screen Management</TabsTrigger>
            </TabsList>
            
            {/* General Information Tab */}
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Theatre Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternateNames">Alternate Names (comma separated)</Label>
                <Input
                  id="alternateNames"
                  name="alternateNames"
                  value={formData.alternateNames?.join(", ") || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    alternateNames: e.target.value.split(",").map(name => name.trim()).filter(name => name)
                  }))}
                  placeholder="e.g. CCM, Metropolis Cinema"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uuid">UUID</Label>
                  <Input
                    id="uuid"
                    name="uuid"
                    value={formData.uuid}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thirdPartyId">Third-Party ID</Label>
                  <Input
                    id="thirdPartyId"
                    name="thirdPartyId"
                    value={formData.thirdPartyId || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chainId">Theatre Chain</Label>
                  <Select
                    value={formData.chainId}
                    onValueChange={(value) => handleSelectChange("chainId", value)}
                  >
                    <SelectTrigger id="chainId">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cinema City International</SelectItem>
                      <SelectItem value="2">Regal Cinemas</SelectItem>
                      <SelectItem value="3">AMC Theatres</SelectItem>
                      <SelectItem value="4">Landmark Theatres</SelectItem>
                      <SelectItem value="5">Alamo Drafthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">Theatre Company</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => handleSelectChange("companyId", value)}
                  >
                    <SelectTrigger id="companyId">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Global Entertainment Holdings</SelectItem>
                      <SelectItem value="2">Cineworld Group</SelectItem>
                      <SelectItem value="3">AMC Entertainment</SelectItem>
                      <SelectItem value="4">Cohen Media Group</SelectItem>
                      <SelectItem value="5">Alamo Drafthouse Cinema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing">Theatre Listing</Label>
                  <Select
                    value={formData.listing}
                    onValueChange={(value) => handleSelectChange("listing", value as "Listed" | "Private")}
                  >
                    <SelectTrigger id="listing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Listed">Listed</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Theatre Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multiplex">Multiplex</SelectItem>
                      <SelectItem value="Single Screen">Single Screen</SelectItem>
                      <SelectItem value="IMAX Multiplex">IMAX Multiplex</SelectItem>
                      <SelectItem value="Arthouse">Arthouse</SelectItem>
                      <SelectItem value="Dine-in Multiplex">Dine-in Multiplex</SelectItem>
                      <SelectItem value="Premium Multiplex">Premium Multiplex</SelectItem>
                      <SelectItem value="Drive-in">Drive-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      latitude: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      longitude: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value as "Active" | "Inactive" | "Deleted")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status !== "Active" && (
                  <div className="space-y-2">
                    <Label htmlFor="closureDetails">Closure Details</Label>
                    <Input
                      id="closureDetails"
                      name="closureDetails"
                      value={formData.closureDetails || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Location & Systems Tab */}
            <TabsContent value="location" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Location Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationType">Location Type</Label>
                      <Select
                        value={formData.locationType}
                        onValueChange={(value) => handleSelectChange("locationType", value)}
                      >
                        <SelectTrigger id="locationType">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Mall">Mall</SelectItem>
                          <SelectItem value="Standalone">Standalone</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Parking Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Bike className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="bikeParkingAvailable">Bike Parking Available</Label>
                    </div>
                    <Switch 
                      id="bikeParkingAvailable"
                      checked={formData.bikeParkingAvailable || false}
                      onCheckedChange={(checked) => handleSwitchChange("bikeParkingAvailable", checked)}
                    />
                  </div>
                  
                  {formData.bikeParkingAvailable && (
                    <div className="space-y-2">
                      <Label htmlFor="bikeParkingCapacity">Bike Parking Capacity</Label>
                      <Input
                        id="bikeParkingCapacity"
                        type="number"
                        value={formData.bikeParkingCapacity || ""}
                        onChange={(e) => handleNumberChange("bikeParkingCapacity", e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="carParkingAvailable">Car Parking Available</Label>
                    </div>
                    <Switch 
                      id="carParkingAvailable"
                      checked={formData.carParkingAvailable || false}
                      onCheckedChange={(checked) => handleSwitchChange("carParkingAvailable", checked)}
                    />
                  </div>
                  
                  {formData.carParkingAvailable && (
                    <div className="space-y-2">
                      <Label htmlFor="carParkingCapacity">Car Parking Capacity</Label>
                      <Input
                        id="carParkingCapacity"
                        type="number"
                        value={formData.carParkingCapacity || ""}
                        onChange={(e) => handleNumberChange("carParkingCapacity", e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Theatre Systems</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theatreManagementSystem">Theatre Management System (TMS)</Label>
                      <Select
                        value={formData.theatreManagementSystem}
                        onValueChange={(value) => handleSelectChange("theatreManagementSystem", value)}
                      >
                        <SelectTrigger id="theatreManagementSystem">
                          <SelectValue placeholder="Select TMS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Arts Alliance Media">Arts Alliance Media</SelectItem>
                          <SelectItem value="CinemaNext">CinemaNext</SelectItem>
                          <SelectItem value="GDC TMS">GDC TMS</SelectItem>
                          <SelectItem value="Qube TMS">Qube TMS</SelectItem>
                          <SelectItem value="Dolby TMS">Dolby TMS</SelectItem>
                          <SelectItem value="Sony TMS">Sony TMS</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ticketingSystem">Ticketing System</Label>
                      <Select
                        value={formData.ticketingSystem}
                        onValueChange={(value) => handleSelectChange("ticketingSystem", value)}
                      >
                        <SelectTrigger id="ticketingSystem">
                          <SelectValue placeholder="Select ticketing system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information Not Available">Information Not Available</SelectItem>
                          <SelectItem value="Vista">Vista</SelectItem>
                          <SelectItem value="TicketNew">TicketNew</SelectItem>
                          <SelectItem value="QuickTickets">QuickTickets</SelectItem>
                          <SelectItem value="iCirena">iCirena</SelectItem>
                          <SelectItem value="CineSync">CineSync</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Cable className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">WireTAP Devices</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Manage the WireTAP devices installed in this theatre
                    </p>
                    <Button type="button" onClick={handleAddWireTAPDevice} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Device
                    </Button>
                  </div>
                  
                  {wireDevices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mapping</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wireDevices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell>
                              <Input
                                value={device.serialNumber}
                                onChange={(e) => handleWireTAPDeviceChange(device.id, "serialNumber", e.target.value)}
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={device.status}
                                onValueChange={(value) => handleWireTAPDeviceChange(device.id, "status", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={device.mappingStatus}
                                onValueChange={(value) => handleWireTAPDeviceChange(device.id, "mappingStatus", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Mapped">Mapped</SelectItem>
                                  <SelectItem value="Unmapped">Unmapped</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWireTAPDevice(device.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No WireTAP devices added yet.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Content & Key Delivery Tab */}
            <TabsContent value="delivery" className="mt-4">
              <div className="space-y-8">
                {/* Part 1: Content Delivery */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Content Delivery</h3>
                  </div>
                  
                  {/* Delivery Time Slots */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Delivery Time Slots</Label>
                      <Button type="button" onClick={handleAddDeliveryTimeSlot} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                      </Button>
                    </div>
                    
                    {formData.deliveryTimeSlots && formData.deliveryTimeSlots.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.deliveryTimeSlots.map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell>
                                <Select
                                  value={slot.day}
                                  onValueChange={(value) => handleDeliveryTimeSlotChange(
                                    slot.id, 
                                    "day", 
                                    value as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
                                  )}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                    <SelectItem value="Saturday">Saturday</SelectItem>
                                    <SelectItem value="Sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => handleDeliveryTimeSlotChange(slot.id, "startTime", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => handleDeliveryTimeSlotChange(slot.id, "endTime", e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToAllDays(slot.id)}
                                  title="Copy to all days"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDeliveryTimeSlot(slot.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No delivery time slots added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* Delivery Address */}
                  <div className="space-y-4 mb-6">
                    <Label className="text-base">Delivery Address</Label>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id="useTheatreAddress"
                        checked={formData.deliveryAddress?.useTheatreAddress || false}
                        onCheckedChange={(checked) => handleDeliveryAddressChange("useTheatreAddress", checked)}
                      />
                      <Label htmlFor="useTheatreAddress">Use Theatre Address</Label>
                    </div>
                    
                    {!formData.deliveryAddress?.useTheatreAddress && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryAddress">Address</Label>
                            <Input
                              id="deliveryAddress"
                              value={formData.deliveryAddress?.address || ""}
                              onChange={(e) => handleDeliveryAddressChange("address", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryCity">City</Label>
                            <Input
                              id="deliveryCity"
                              value={formData.deliveryAddress?.city || ""}
                              onChange={(e) => handleDeliveryAddressChange("city", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryState">State</Label>
                            <Input
                              id="deliveryState"
                              value={formData.deliveryAddress?.state || ""}
                              onChange={(e) => handleDeliveryAddressChange("state", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryPostalCode">Postal Code</Label>
                            <Input
                              id="deliveryPostalCode"
                              value={formData.deliveryAddress?.postalCode || ""}
                              onChange={(e) => handleDeliveryAddressChange("postalCode", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryCountry">Country</Label>
                            <Input
                              id="deliveryCountry"
                              value={formData.deliveryAddress?.country || ""}
                              onChange={(e) => handleDeliveryAddressChange("country", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Delivery Instructions */}
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="deliveryInstructions">Delivery Instructions / Notes</Label>
                    <Textarea
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter special instructions for delivery"
                    />
                  </div>
                  
                  {/* DCP Physical Delivery Methods */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">DCP Physical Delivery Methods</Label>
                      <Button type="button" onClick={handleAddPhysicalDeliveryMethod} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Method
                      </Button>
                    </div>
                    
                    {formData.dcpPhysicalDeliveryMethods && formData.dcpPhysicalDeliveryMethods.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Media Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpPhysicalDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input
                                  value={method.mediaType}
                                  onChange={(e) => handlePhysicalDeliveryMethodChange(method.id, "mediaType", e.target.value)}
                                  className="h-8"
                                  placeholder="e.g. Hard Drive, USB"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={method.details}
                                  onChange={(e) => handlePhysicalDeliveryMethodChange(method.id, "details", e.target.value)}
                                  className="h-8"
                                  placeholder="Additional details"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePhysicalDeliveryMethod(method.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No physical delivery methods added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* DCP Network Delivery Methods */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">DCP Network Delivery Methods</Label>
                      <Button type="button" onClick={handleAddNetworkDeliveryMethod} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Method
                      </Button>
                    </div>
                    
                    {formData.dcpNetworkDeliveryMethods && formData.dcpNetworkDeliveryMethods.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Network URL</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpNetworkDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input
                                  value={method.networkURL}
                                  onChange={(e) => handleNetworkDeliveryMethodChange(method.id, "networkURL", e.target.value)}
                                  className="h-8"
                                  placeholder="e.g. ftp://server.example.com"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNetworkDeliveryMethod(method.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No network delivery methods added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* DCP Modem Delivery Methods */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">DCP Modem Delivery Methods</Label>
                      <Button type="button" onClick={handleAddModemDeliveryMethod} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Method
                      </Button>
                    </div>
                    
                    {formData.dcpModemDeliveryMethods && formData.dcpModemDeliveryMethods.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Modem Phone Number</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpModemDeliveryMethods.map((method) => (
                            <TableRow key={method.id}>
                              <TableCell>
                                <Input
                                  value={method.modemPhoneNumber}
                                  onChange={(e) => handleModemDeliveryMethodChange(method.id, "modemPhoneNumber", e.target.value)}
                                  className="h-8"
                                  placeholder="e.g. +1-123-456-7890"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteModemDeliveryMethod(method.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No modem delivery methods added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* DCP Delivery Contacts */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">DCP Delivery Contacts</Label>
                      <Button type="button" onClick={handleAddDCPDeliveryContact} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Contact
                      </Button>
                    </div>
                    
                    {formData.dcpDeliveryContacts && formData.dcpDeliveryContacts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.dcpDeliveryContacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell>
                                <Input
                                  value={contact.name || ""}
                                  onChange={(e) => handleDCPDeliveryContactChange(contact.id, "name", e.target.value)}
                                  className="h-8"
                                  placeholder="Contact Name (optional)"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={contact.email}
                                  onChange={(e) => handleDCPDeliveryContactChange(contact.id, "email", e.target.value)}
                                  className="h-8"
                                  placeholder="email@example.com"
                                  type="email"
                                  required
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDCPDeliveryContact(contact.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No DCP delivery contacts added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* Email Settings for DCP Delivery */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <Switch
                        id="sendEmailsForDCPDelivery"
                        checked={formData.sendEmailsForDCPDelivery || false}
                        onCheckedChange={(checked) => handleSwitchChange("sendEmailsForDCPDelivery", checked)}
                      />
                      <Label htmlFor="sendEmailsForDCPDelivery">
                        Send Emails for DCP Delivery
                      </Label>
                    </div>
                    
                    {formData.sendEmailsForDCPDelivery && (
                      <div className="space-y-2 pl-8">
                        <Label className="block mb-2">Send Emails for DCP Content Types:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {contentTypeOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`content-type-${option.id}`}
                                checked={(formData.dcpContentTypesForEmail || []).includes(option.id)}
                                onChange={() => handleContentTypeChange(option.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor={`content-type-${option.id}`}>{option.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Part 2: Keys Delivery */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Key Delivery</h3>
                  </div>
                  
                  {/* Key Delivery Contacts */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Key Delivery Contacts</Label>
                      <Button type="button" onClick={handleAddKeyDeliveryContact} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Contact
                      </Button>
                    </div>
                    
                    {formData.keyDeliveryContacts && formData.keyDeliveryContacts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.keyDeliveryContacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell>
                                <Input
                                  value={contact.name || ""}
                                  onChange={(e) => handleKeyDeliveryContactChange(contact.id, "name", e.target.value)}
                                  className="h-8"
                                  placeholder="Contact Name (optional)"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={contact.email}
                                  onChange={(e) => handleKeyDeliveryContactChange(contact.id, "email", e.target.value)}
                                  className="h-8"
                                  placeholder="email@example.com"
                                  type="email"
                                  required
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteKeyDeliveryContact(contact.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground border rounded-md">
                        No key delivery contacts added yet.
                      </div>
                    )}
                  </div>
                  
                  {/* KDM Delivery Emails in FLM-X */}
                  <div className="space-y-4 mb-6">
                    <Label className="text-base">KDM Delivery Emails in FLM-X</Label>
                    
                    <RadioGroup
                      value={formData.kdmDeliveryEmailsInFLMX || "useDropbox"}
                      onValueChange={(value) => 
                        handleSelectChange(
                          "kdmDeliveryEmailsInFLMX", 
                          value as "useDropbox" | "useKeyDeliveryContacts"
                        )
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="useDropbox" id="kdm-dropbox" />
                        <Label htmlFor="kdm-dropbox">Use dropbox@qubewire.com</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="useKeyDeliveryContacts" id="kdm-contacts" />
                        <Label htmlFor="kdm-contacts">Use above emails from Key Delivery Contacts</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                {/* Part 3: Ingest Settings */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Ingest Settings</h3>
                  </div>
                  
                  {/* Auto Ingest of Content */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <Switch
                        id="autoIngestOfContentEnabled"
                        checked={formData.autoIngestOfContentEnabled || false}
                        onCheckedChange={(checked) => handleSwitchChange("autoIngestOfContentEnabled", checked)}
                      />
                      <Label htmlFor="autoIngestOfContentEnabled">
                        Auto Ingest of Content Enabled
                      </Label>
                    </div>
                    
                    {formData.autoIngestOfContentEnabled && (
                      <div className="space-y-2 pl-8">
                        <Label className="block mb-2">Select Content Types enabled for Auto Ingest:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {contentTypeOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`auto-ingest-${option.id}`}
                                checked={(formData.autoIngestContentTypes || []).includes(option.id)}
                                onChange={() => handleAutoIngestContentTypeChange(option.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor={`auto-ingest-${option.id}`}>{option.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* QCN Theatre IP Address Range */}
                  <div className="space-y-2">
                    <Label htmlFor="qcnTheatreIPAddressRange">QCN Theatre IP Address Range</Label>
                    <Input
                      id="qcnTheatreIPAddressRange"
                      name="qcnTheatreIPAddressRange"
                      value={formData.qcnTheatreIPAddressRange || ""}
                      onChange={handleChange}
                      placeholder="e.g. 192.168.1.0/24"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Screen Management Tab */}
            <TabsContent value="screens" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Screen Management</h3>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateScreen}
                    size="sm"
                    disabled={!formData.id}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Screen
                  </Button>
                </div>
                
                {screens.length > 0 ? (
                  <DataTable
                    data={screens}
                    columns={screenColumns}
                    searchPlaceholder="Search screens..."
                    actions={screenActions}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    {formData.id ? (
                      <p>No screens added yet. Click "Add Screen" to create a screen.</p>
                    ) : (
                      <p>Please save the theatre first before adding screens.</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Theatre" : "Create Theatre"}
            </Button>
          </div>
        </form>
      </div>
    );
  };
  
  // Render the component using either a Dialog or directly based on isFullPage
  return isFullPage ? (
    renderDialogContent()
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${theatre?.name}` : "Add New Theatre"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update theatre details and configuration"
              : "Fill in the details to add a new theatre"}
          </DialogDescription>
        </DialogHeader>
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
};
