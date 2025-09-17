import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { AddIPDialog } from "./AddIPDialog";
import { EditIPDialog } from "./EditIPDialog";
import { toast } from "sonner";

interface ScreenIP {
  id: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
}

interface ScreenIPsTableProps {
  screenId: string;
  screenName: string;
  ips: ScreenIP[];
  onIPsChange: (screenId: string, ips: ScreenIP[]) => void;
}

export const ScreenIPsTable = ({ screenId, screenName, ips, onIPsChange }: ScreenIPsTableProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIP, setEditingIP] = useState<ScreenIP | undefined>(undefined);

  const handleAddIP = (ipData: Omit<ScreenIP, 'id'>) => {
    const newIP: ScreenIP = {
      id: crypto.randomUUID(),
      ...ipData
    };
    const updatedIPs = [...ips, newIP];
    onIPsChange(screenId, updatedIPs);
    toast.success("IP configuration added successfully");
  };

  const handleEditIP = (ipData: Omit<ScreenIP, 'id'>) => {
    if (!editingIP) return;
    
    const updatedIPs = ips.map(ip => 
      ip.id === editingIP.id ? { ...ip, ...ipData } : ip
    );
    onIPsChange(screenId, updatedIPs);
    toast.success("IP configuration updated successfully");
  };

  const handleDeleteIP = (ipId: string) => {
    if (confirm("Are you sure you want to delete this IP?")) {
      const updatedIPs = ips.filter(ip => ip.id !== ipId);
      onIPsChange(screenId, updatedIPs);
      toast.success("IP configuration deleted successfully");
    }
  };

  const openEditDialog = (ip: ScreenIP) => {
    setEditingIP(ip);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Screen IPs</h4>
        <Button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add IP
        </Button>
      </div>

      {ips.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Subnet Mask</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ips.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono">{ip.ipAddress}</TableCell>
                  <TableCell className="font-mono">{ip.subnetMask}</TableCell>
                  <TableCell className="font-mono">{ip.gateway || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(ip)}
                        title="Edit IP"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIP(ip.id)}
                        title="Delete IP"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <p className="text-muted-foreground mb-4">No IP configurations have been added yet</p>
          <Button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" /> Add IP
          </Button>
        </div>
      )}

      <AddIPDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddIP}
      />

      <EditIPDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ip={editingIP}
        onSave={handleEditIP}
      />
    </div>
  );
};