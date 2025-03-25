
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { IPAddress } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface IPAddressListProps {
  ipAddresses: IPAddress[];
  onIPAddressChange: (index: number, field: string, value: string) => void;
  onAddIPAddress: () => void;
  onRemoveIPAddress: (index: number) => void;
}

export const IPAddressList = ({
  ipAddresses,
  onIPAddressChange,
  onAddIPAddress,
  onRemoveIPAddress,
}: IPAddressListProps) => {
  return (
    <div className="space-y-2">
      {ipAddresses && ipAddresses.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Subnet</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ipAddresses.map((ip, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={ip.address}
                    onChange={(e) => onIPAddressChange(index, "address", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={ip.subnet}
                    onChange={(e) => onIPAddressChange(index, "subnet", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={ip.gateway}
                    onChange={(e) => onIPAddressChange(index, "gateway", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveIPAddress(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">No IP addresses have been added yet</p>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onAddIPAddress}>
        <Plus className="h-4 w-4 mr-2" /> Add IP Address
      </Button>
    </div>
  );
};
