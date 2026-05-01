import { motion } from "framer-motion";

const EdgeAppliances = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <h1 className="text-2xl font-bold">Edge</h1>
    <p className="text-muted-foreground">Edge appliances will be listed here.</p>
  </motion.div>
);

export default EdgeAppliances;