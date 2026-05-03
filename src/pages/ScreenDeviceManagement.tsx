import { motion } from "framer-motion";

const ScreenDeviceManagement = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <p className="text-muted-foreground">Screen Device Management will be listed here.</p>
  </motion.div>
);

export default ScreenDeviceManagement;
