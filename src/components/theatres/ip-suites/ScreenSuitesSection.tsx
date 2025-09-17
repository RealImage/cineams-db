import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, X, Trash2 } from "lucide-react";
import { AddSuiteDialog } from "./AddSuiteDialog";
import { EditSuiteDialog } from "./EditSuiteDialog";
import { toast } from "sonner";

interface SuiteDevice {
  id: string;
  deviceModel: string;
  serialNumber: string;
  deviceRole: string;
  certificateStatus: 'Active' | 'Inactive' | 'Unknown';
  softwareVersion: string;
}

interface ScreenSuite {
  id: string;
  suiteNumber: string;
  creationDate: string;
  effectiveFromDate: string;
  devices: SuiteDevice[];
}

interface ScreenSuitesSectionProps {
  screenId: string;
  screenName: string;
  suites: ScreenSuite[];
  availableDevices: SuiteDevice[];
  onSuitesChange: (screenId: string, suites: ScreenSuite[]) => void;
}

export const ScreenSuitesSection = ({ 
  screenId, 
  screenName, 
  suites, 
  availableDevices,
  onSuitesChange 
}: ScreenSuitesSectionProps) => {
  const [addSuiteDialogOpen, setAddSuiteDialogOpen] = useState(false);
  const [editSuiteDialogOpen, setEditSuiteDialogOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<ScreenSuite | undefined>(undefined);

  const handleAddSuite = (suiteData: Omit<ScreenSuite, 'id' | 'suiteNumber' | 'creationDate'>) => {
    const newSuite: ScreenSuite = {
      id: crypto.randomUUID(),
      suiteNumber: `Suite ${String(suites.length + 1).padStart(2, '0')}`,
      creationDate: new Date().toISOString().split('T')[0],
      ...suiteData
    };
    const updatedSuites = [...suites, newSuite];
    onSuitesChange(screenId, updatedSuites);
    toast.success("Suite created successfully");
  };

  const handleEditSuite = (suiteData: Partial<ScreenSuite>) => {
    if (!editingSuite) return;
    
    const updatedSuites = suites.map(suite => 
      suite.id === editingSuite.id ? { ...suite, ...suiteData } : suite
    );
    onSuitesChange(screenId, updatedSuites);
    toast.success("Suite updated successfully");
  };

  const handleDeleteSuite = (suiteId: string, suiteName: string) => {
    if (confirm(`Are you sure you want to delete ${suiteName}? This action cannot be undone.`)) {
      const updatedSuites = suites.filter(suite => suite.id !== suiteId);
      onSuitesChange(screenId, updatedSuites);
      toast.success("Suite deleted successfully");
    }
  };

  const handleRemoveDeviceFromSuite = (suiteId: string, deviceId: string) => {
    if (confirm("Are you sure you want to remove this device from the suite?")) {
      const updatedSuites = suites.map(suite => 
        suite.id === suiteId 
          ? { ...suite, devices: suite.devices.filter(device => device.id !== deviceId) }
          : suite
      );
      onSuitesChange(screenId, updatedSuites);
      toast.success("Device removed from suite");
    }
  };

  const openEditDialog = (suite: ScreenSuite) => {
    setEditingSuite(suite);
    setEditSuiteDialogOpen(true);
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⚠️ Inactive</Badge>;
      case 'Unknown':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">❓ Unknown</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const validateSuite = (suite: ScreenSuite) => {
    const hasScreenManager = suite.devices.some(device => 
      device.deviceRole === "Server (SM)" || device.deviceRole === "Root Media Block (RMB)"
    );
    const allDevicesHaveValidCerts = suite.devices.every(device => 
      device.certificateStatus === "Active"
    );
    
    return { hasScreenManager, allDevicesHaveValidCerts };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Screen Suites</h4>
        <Button
          type="button"
          onClick={() => setAddSuiteDialogOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Suite
        </Button>
      </div>

      {suites.length > 0 ? (
        <div className="space-y-4">
          {suites.map((suite) => {
            const validation = validateSuite(suite);
            return (
              <Card key={suite.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{suite.suiteNumber}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>Creation Date: {suite.creationDate}</div>
                        <div>Effective From: {suite.effectiveFromDate}</div>
                      </div>
                      {(!validation.hasScreenManager || !validation.allDevicesHaveValidCerts) && (
                        <div className="mt-2 space-y-1">
                          {!validation.hasScreenManager && (
                            <Badge variant="destructive" className="mr-2">
                              Missing Screen Manager/RMB
                            </Badge>
                          )}
                          {!validation.allDevicesHaveValidCerts && (
                            <Badge variant="destructive">
                              Invalid Certificates
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(suite)}
                        title="Edit Suite"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSuite(suite.id, suite.suiteNumber)}
                        title="Delete Suite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {suite.devices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device Model</TableHead>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Cert. Status</TableHead>
                          <TableHead>Software Version</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suite.devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.deviceModel}</TableCell>
                            <TableCell className="font-mono">{device.serialNumber}</TableCell>
                            <TableCell>{device.deviceRole}</TableCell>
                            <TableCell>{getCertificateStatusBadge(device.certificateStatus)}</TableCell>
                            <TableCell className="font-mono">{device.softwareVersion}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDeviceFromSuite(suite.id, device.id)}
                                title="Remove Device"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="border rounded-md p-6 text-center">
                      <p className="text-muted-foreground mb-3">No devices assigned to this suite yet</p>
                      <Button
                        type="button"
                        onClick={() => openEditDialog(suite)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Device
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <p className="text-muted-foreground mb-4">No suites have been created yet</p>
          <Button
            type="button"
            onClick={() => setAddSuiteDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Suite
          </Button>
        </div>
      )}

      <AddSuiteDialog
        open={addSuiteDialogOpen}
        onOpenChange={setAddSuiteDialogOpen}
        availableDevices={availableDevices}
        onSave={handleAddSuite}
      />

      <EditSuiteDialog
        open={editSuiteDialogOpen}
        onOpenChange={setEditSuiteDialogOpen}
        suite={editingSuite}
        availableDevices={availableDevices}
        onSave={handleEditSuite}
      />
    </div>
  );
};