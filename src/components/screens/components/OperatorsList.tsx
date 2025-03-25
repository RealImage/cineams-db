
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operator } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface OperatorsListProps {
  operators: Operator[];
  onOperatorChange: (index: number, field: string, value: string) => void;
  onAddOperator: () => void;
  onRemoveOperator: (index: number) => void;
}

export const OperatorsList = ({
  operators,
  onOperatorChange,
  onAddOperator,
  onRemoveOperator,
}: OperatorsListProps) => {
  return (
    <div className="space-y-2">
      {operators && operators.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map((operator, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={operator.name}
                    onChange={(e) => onOperatorChange(index, "name", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="email"
                    value={operator.email}
                    onChange={(e) => onOperatorChange(index, "email", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="tel"
                    value={operator.phone || ""}
                    onChange={(e) => onOperatorChange(index, "phone", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveOperator(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">No operators have been added yet</p>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onAddOperator}>
        <Plus className="h-4 w-4 mr-2" /> Add Operator
      </Button>
    </div>
  );
};
