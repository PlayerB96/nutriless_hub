"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "w-full max-w-md",
  showCloseButton = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={`bg-bg text-text rounded-2xl shadow-xl ${width} max-h-[80vh] mt-20 relative flex flex-col`}
          >
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-bg px-6 pt-6 pb-4 border-b border-muted rounded-t-2xl">
              {showCloseButton && (
                <button
                  className="absolute top-4 right-4 text-xl cursor-pointer"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
              {title && <h2 className="text-xl font-semibold">{title}</h2>}
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>

            {/* Footer fijo */}
            {footer && (
              <div className="sticky bottom-0 z-10 bg-bg px-6 pt-4 pb-6 border-t border-muted rounded-b-2xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
