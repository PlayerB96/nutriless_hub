"use client";

import { ReactNode, useEffect } from "react";
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
    // 👇 Evita el scroll de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 tablet:p-4 desktop:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={`bg-bg text-text rounded-xl tablet:rounded-2xl shadow-xl w-full ${width} max-h-[85vh] tablet:max-h-[80vh] mt-12 tablet:mt-16 desktop:mt-20 relative flex flex-col`}
          >
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-bg px-4 pt-4 pb-3 tablet:px-6 tablet:pt-6 tablet:pb-4 border-b border-muted rounded-t-xl tablet:rounded-t-2xl">
              {showCloseButton && (
                <button
                  className="absolute top-4 right-4 text-xl cursor-pointer"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
              {title && (
                <h2 className="text-lg tablet:text-xl font-semibold pr-8">
                  {title}
                </h2>
              )}
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto px-4 py-3 tablet:px-6 tablet:py-4 flex-1">
              {children}
            </div>

            {/* Footer fijo */}
            {footer && (
              <div className="sticky bottom-0 z-10 bg-bg px-4 pt-3 pb-4 tablet:px-6 tablet:pt-4 tablet:pb-6 border-t border-muted rounded-b-xl tablet:rounded-b-2xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
