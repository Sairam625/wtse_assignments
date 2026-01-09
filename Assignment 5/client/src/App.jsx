import React from 'react';
import ElectricityBill from './components/ElectricityBill';
import { motion } from 'framer-motion';

function App() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="app-container"
        >
            <h1>Electricity Bill System</h1>
            <ElectricityBill />
        </motion.div>
    );
}

export default App;
