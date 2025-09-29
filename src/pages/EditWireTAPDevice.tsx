import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  HardDrive, 
  Wifi, 
  Database, 
  Building2,
  Lock 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BasicDetailsForm from "@/components/wiretap/BasicDetailsForm";
import HardwareSpecsForm from "@/components/wiretap/HardwareSpecsForm";
import ConnectivitySpecsForm from "@/components/wiretap/ConnectivitySpecsForm";
import DeviceLogsTable from "@/components/wiretap/DeviceLogsTable";
import { WireTAPDevice } from "@/types/wireTAP";
import { wireTapDevices } from "@/data/wireTapDevices";

const EditWireTAPDevice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("basic-details");
  const [device, setDevice] = useState<WireTAPDevice | null>(null);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Details
    hardwareSerialNumber: "",
    applicationSerialNumber: "",
    hostName: "",
    applianceType: "WireTAP",
    mappingStatus: "No",
    theatreId: "",
    theatreName: "",
    noMappingReason: "",
    pullOutStatus: false,
    pullOutDate: null,
    pullOutReason: "",
    
    // Hardware Specifications
    storage: "512 GB",
    ramSize: "",
    ramUnit: "GB",
    mobileNumber: "",
    simNumber: "",
    
    // Connectivity Specifications
    downloadRestrictions: false,
    restrictionDays: [],
    restrictionTimeStart: "",
    restrictionTimeEnd: "",
    theatreNetworkInterface: "eth0",
    theatreBandwidth: "",
    theatreBandwidthUnit: "MBPS",
    proposedBandwidth: "",
    proposedBandwidthUnit: "MBPS",
    connectivityType: "Fixed Broadband",
    ispCompany: "",
    internetInstallationDate: null,
    pricePerGB: "",
    ispEquipmentModel: "",
    ispThirdPartyHandler: "",
    ispCharges: "",
    monthlyFUPLimit: "",
    ispPaymentResponsibility: "",
    billingType: "Postpaid",
    billingCycle: "Monthly",
    billingDate: "1",
    planStartDate: null,
    internetIPType: "DHCP",
    ingestIPType: "DHCP",
    ingestIPAddress: "",
    ingestIPMask: "",
    ingestIPGateway: ""
  });

  useEffect(() => {
    if (id === "new") {
      // Handle new device from AddDeviceDialog
      const deviceData = location.state?.deviceData;
      if (deviceData) {
        setIsNewDevice(true);
        // Create a mock device object for display
        setDevice({
          id: "new",
          hardwareSerialNumber: deviceData.hardwareSerialNumber,
          applicationSerialNumber: deviceData.applicationSerialNumber,
          hostName: deviceData.hostName,
          clusterName: deviceData.clusterName,
          wireTapApplianceType: deviceData.wireTapApplianceType,
          activationStatus: "Inactive",
          vpnStatus: "Disabled",
          theatreId: "",
          theatreName: "",
          theatreUUID: "",
          theatreAddress: "",
          storageCapacity: "512 GB",
          bandwidth: "",
          connectivityType: "Fixed Broadband",
          ispName: "",
          mappingStatus: "Unmapped",
          pullOutStatus: "Installed",
          updatedBy: "System",
          updatedAt: new Date().toISOString()
        });
        setFormData(prev => ({
          ...prev,
          hardwareSerialNumber: deviceData.hardwareSerialNumber,
          applicationSerialNumber: deviceData.applicationSerialNumber,
          hostName: deviceData.hostName,
          applianceType: deviceData.wireTapApplianceType,
        }));
      } else {
        toast.error("Device data not found");
        navigate("/wiretap-devices");
      }
    } else {
      // Find existing device by ID and populate the form
      const currentDevice = wireTapDevices.find(d => d.id === id);
      if (currentDevice) {
        setDevice(currentDevice);
        setFormData({
          // Basic Details
          hardwareSerialNumber: currentDevice.hardwareSerialNumber,
          applicationSerialNumber: currentDevice.applicationSerialNumber,
          hostName: currentDevice.hostName,
          applianceType: "WireTAP",
          mappingStatus: currentDevice.mappingStatus === "Mapped" ? "Yes" : "No",
          theatreId: currentDevice.theatreId,
          theatreName: currentDevice.theatreName,
          noMappingReason: currentDevice.mappingStatus === "Unmapped" ? "Not specified" : "",
          pullOutStatus: false,
          pullOutDate: null,
          pullOutReason: "",
          
          // Hardware Specifications - Map from device data
          storage: currentDevice.storageCapacity,
          ramSize: "8", // Default values as these aren't in the device type
          ramUnit: "GB",
          mobileNumber: "",
          simNumber: "",
          
          // Connectivity Specifications - Map from device data
          downloadRestrictions: false,
          restrictionDays: [],
          restrictionTimeStart: "",
          restrictionTimeEnd: "",
          theatreNetworkInterface: "eth0",
          theatreBandwidth: currentDevice.bandwidth,
          theatreBandwidthUnit: "MBPS",
          proposedBandwidth: "",
          proposedBandwidthUnit: "MBPS",
          connectivityType: currentDevice.connectivityType,
          ispCompany: currentDevice.ispName,
          internetInstallationDate: null,
          pricePerGB: "",
          ispEquipmentModel: "",
          ispThirdPartyHandler: "",
          ispCharges: "",
          monthlyFUPLimit: "",
          ispPaymentResponsibility: "",
          billingType: "Postpaid",
          billingCycle: "Monthly",
          billingDate: "1",
          planStartDate: null,
          internetIPType: "DHCP",
          ingestIPType: "DHCP",
          ingestIPAddress: "",
          ingestIPMask: "",
          ingestIPGateway: ""
        });
      } else {
        toast.error("Device not found");
        navigate("/wiretap-devices");
      }
    }
  }, [id, navigate, location.state]);

  const handleFormChange = (sectionData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...sectionData }));
  };

  const handleSubmit = () => {
    // Validate the form data
    if (!formData.hardwareSerialNumber) {
      toast.error("Hardware Serial Number is required");
      setActiveTab("basic-details");
      return;
    }
    
    if (!formData.applicationSerialNumber) {
      toast.error("Application Serial Number is required");
      setActiveTab("basic-details");
      return;
    }

    if (formData.mappingStatus === "Yes" && !formData.theatreId) {
      toast.error("Theatre selection is required when mapping status is Yes");
      setActiveTab("basic-details");
      return;
    }

    if (formData.mappingStatus === "No" && !formData.noMappingReason) {
      toast.error("Reason for no mapping is required");
      setActiveTab("basic-details");
      return;
    }

    if (formData.pullOutStatus && !formData.pullOutDate) {
      toast.error("Pull out date is required when pull out status is enabled");
      setActiveTab("basic-details");
      return;
    }

    // Submit the form - in a real app, this would be an API call
    console.log("Updating device:", id, formData);
    toast.success("WireTAP device updated successfully");
    navigate("/wiretap-devices");
  };

  const handleNext = () => {
    if (activeTab === "basic-details") {
      setActiveTab("hardware-specs");
    } else if (activeTab === "hardware-specs") {
      setActiveTab("connectivity-specs");
    } else if (activeTab === "connectivity-specs") {
      setActiveTab("device-logs");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "device-logs") {
      setActiveTab("connectivity-specs");
    } else if (activeTab === "connectivity-specs") {
      setActiveTab("hardware-specs");
    } else if (activeTab === "hardware-specs") {
      setActiveTab("basic-details");
    }
  };

  const isLastStep = activeTab === "device-logs";
  const isFirstStep = activeTab === "basic-details";

  if (!device) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNewDevice ? "Add WireTAP Device" : "Edit WireTAP Device"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNewDevice 
              ? `Complete registration for ${device.hardwareSerialNumber}`
              : `Update details for ${device.hardwareSerialNumber}`
            }
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/wiretap-devices")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Devices
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-details" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Basic Details
          </TabsTrigger>
          <TabsTrigger value="hardware-specs" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Device Specifications
          </TabsTrigger>
          <TabsTrigger value="connectivity-specs" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" /> Connectivity Specifications
          </TabsTrigger>
          <TabsTrigger value="device-logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Device Logs
          </TabsTrigger>
        </TabsList>
        
        <Card className="mt-4">
          <CardContent className="pt-6">
            <TabsContent value="basic-details">
              <BasicDetailsForm formData={formData} onChange={handleFormChange} />
            </TabsContent>
            
            <TabsContent value="hardware-specs">
              <HardwareSpecsForm formData={formData} onChange={handleFormChange} />
            </TabsContent>
            
            <TabsContent value="connectivity-specs">
              <Alert className="mb-6">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  These connectivity specifications are properties of the theatre and cannot be edited from this device page. 
                  To modify these settings, please edit the theatre configuration.
                </AlertDescription>
              </Alert>
              <div className="opacity-60 pointer-events-none">
                <ConnectivitySpecsForm formData={formData} onChange={handleFormChange} />
              </div>
            </TabsContent>
            
            <TabsContent value="device-logs">
              <DeviceLogsTable deviceId={id} />
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            <div className="flex gap-2">
              {!isLastStep ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" /> Update Device
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </Tabs>
    </motion.div>
  );
};

export default EditWireTAPDevice;