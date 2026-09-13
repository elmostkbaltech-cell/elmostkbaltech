'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import HeroSection from '@/components/HeroSection';
import ActivationForm from '@/components/ActivationForm';
import WarrantyDashboard from '@/components/WarrantyDashboard';
import MaintenanceTracker from '@/components/MaintenanceTracker';
import ContactPage from '@/components/ContactPage';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { activeTab, currentWarranty } = useApp();

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection />
            
            {/* Quick preview of active dashboard below hero if current warranty exists */}
            {currentWarranty && (
              <section className="py-12 border-t border-slate-800/80 bg-slate-950/60">
                <div className="max-w-7xl mx-auto px-4">
                  <WarrantyDashboard />
                </div>
              </section>
            )}
          </motion.div>
        )}

        {activeTab === 'activate' && (
          <motion.div
            key="activate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ActivationForm />
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <WarrantyDashboard />
          </motion.div>
        )}

        {activeTab === 'maintenance' && (
          <motion.div
            key="maintenance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto py-10 px-4"
          >
            <MaintenanceTracker
              ticket={currentWarranty?.maintenanceTicket}
              deviceModel={currentWarranty?.modelName || 'AIWA Ultra 9" QLED'}
            />
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ContactPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
