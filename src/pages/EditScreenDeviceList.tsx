import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { theatres as mockTheatres } from "@/data/mockData";
import { Theatre } from "@/types";
import { IPSuitesTabContent } from "@/components/theatres/ip-suites/IPSuitesTabContent";

const EditScreenDeviceList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theatre, setTheatre] = useState<Theatre | undefined>(undefined);

  useEffect(() => {
    const found = mockTheatres.find((t) => t.id === id);
    if (found) setTheatre(JSON.parse(JSON.stringify(found)));
    else {
      toast.error("Theatre not found");
      navigate("/theatre-device-management/screen-devices");
    }
  }, [id, navigate]);

  const screensForTab = useMemo(
    () =>
      (theatre?.screens || []).map((s) => ({
        id: s.id,
        name: s.name,
        number: s.number,
        status: s.status,
      })),
    [theatre]
  );

  if (!theatre) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/theatre-device-management/screen-devices")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{theatre.name}</h2>
          <p className="text-sm text-muted-foreground">
            {theatre.chainName} · {theatre.city}, {theatre.state}, {theatre.country}
          </p>
        </div>
        <Button
          onClick={() => {
            toast.success("Screen device list saved");
            navigate("/theatre-device-management/screen-devices");
          }}
        >
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Theatre Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Theatre Name</Label>
            <Input value={theatre.name} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Theatre ID</Label>
            <Input value={theatre.id} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Chain</Label>
            <Input value={theatre.chainName} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input value={`${theatre.city}, ${theatre.state}, ${theatre.country}`} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Screens</Label>
            <Input value={String(theatre.screenCount)} readOnly />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Input value={theatre.status} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screen Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IPSuitesTabContent screens={screensForTab} onScreenDataChange={() => {}} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EditScreenDeviceList;