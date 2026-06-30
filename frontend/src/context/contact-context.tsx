"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

export type ServiceType = "Study in China" | "Product Sourcing" | "General";

interface ContactContextType {
  selectedService: ServiceType | null;
  setSelectedService: (service: ServiceType | null) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(
  undefined,
);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );

  const value = useMemo(
    () => ({ selectedService, setSelectedService }),
    [selectedService],
  );

  return (
    <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
  );
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContact must be used within ContactProvider");
  }
  return context;
}