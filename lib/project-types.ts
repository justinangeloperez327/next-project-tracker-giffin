export const categories = [
  "Substation",
  "Guardrail",
  "Handrail",
  "Bus Shelters",
] as const;
export type Project = {
  id: string;
  so_no: string;
  jo_no: string;
  project_name: string;
  client: string;
  contract_price: string;
  category: string;
};
export const currency = (value: number | string) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  }).format(Number(value));
