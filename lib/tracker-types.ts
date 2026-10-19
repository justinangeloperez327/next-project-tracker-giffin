export const substationItems = [
  "Doors",
  "Grating beam support",
  "Grating panel",
] as const;
export const dateFields = [
  ["site_measurement_date", "Site measurement date"],
  ["drawing_issued_date", "Drawing issued date"],
  ["delivery_date", "Delivery date"],
  ["installation_date", "Installation date"],
] as const;
export type SubstationTracker = {
  item: (typeof substationItems)[number];
  site_measurement_date: string | null;
  drawing_issued_date: string | null;
  delivery_date: string | null;
  installation_date: string | null;
  remarks: string;
};
export type BusShelterTracker = { total: number; installed: number };
