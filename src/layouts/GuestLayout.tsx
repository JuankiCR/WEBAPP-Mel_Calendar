import React from "react";
import { motion } from "framer-motion";

const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      <main style={{ flex: 1, overflowY: "auto" }}>
        <motion.div
          key="page-content"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default GuestLayout;
