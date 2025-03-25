
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Screen, Suite } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface SuitesTabProps {
  formData: Partial<Screen>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Screen>>>;
}

export const SuitesTab = ({
  formData,
  setFormData,
}: SuitesTabProps) => {
  const handleAddSuite = () => {
    setFormData((prev) => {
      const newSuite: Suite = {
        id: crypto.randomUUID(),
        name: `Suite ${(prev.suites || []).length + 1}`,
        devices: [],
        ipAddresses: [],
        status: "Invalid"
      };
      
      return {
        ...prev,
        suites: [...(prev.suites || []), newSuite]
      };
    });
  };
  
  const handleRemoveSuite = (suiteId: string) => {
    setFormData((prev) => ({
      ...prev,
      suites: (prev.suites || []).filter(suite => suite.id !== suiteId)
    }));
  };
  
  const getSuiteStatus = (suite: Suite): "Valid" | "Invalid" => {
    const hasSMRole = (suite.devices || []).some((deviceId: string) => {
      const device = (formData.devices || []).find(d => d.id === deviceId);
      return device && device.role === "SM";
    });
    
    return hasSMRole ? "Valid" : "Invalid";
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label>Suites</Label>
        {formData.suites && formData.suites.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>IP Addresses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.suites.map((suite) => (
                <TableRow key={suite.id}>
                  <TableCell>{suite.name}</TableCell>
                  <TableCell>
                    {suite.devices.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {suite.devices.map(deviceId => {
                          const device = formData.devices?.find(d => d.id === deviceId);
                          return (
                            <div key={deviceId}>
                              {device ? `${device.manufacturer} ${device.model}` : 'Unknown device'}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      "No devices"
                    )}
                  </TableCell>
                  <TableCell>
                    {suite.ipAddresses.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {suite.ipAddresses.map(ipIndex => {
                          const ip = formData.ipAddresses?.[ipIndex];
                          return (
                            <div key={ipIndex}>
                              {ip ? ip.address : 'Unknown IP'}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      "No IP addresses"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSuiteStatus(suite) === "Valid" ? "default" : "destructive"}>
                      {getSuiteStatus(suite)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSuite(suite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No suites have been added yet</p>
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleAddSuite}>
          <Plus className="h-4 w-4 mr-2" /> Add Suite
        </Button>
      </div>
    </div>
  );
};
