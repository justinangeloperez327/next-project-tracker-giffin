export function toDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}
export function dateString(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}
export function dateInputs<
  T extends {
    site_measurement_date: Date | null;
    drawing_issued_date: Date | null;
    delivery_date: Date | null;
    installation_date: Date | null;
  },
>(row: T) {
  return {
    ...row,
    site_measurement_date: dateString(row.site_measurement_date),
    drawing_issued_date: dateString(row.drawing_issued_date),
    delivery_date: dateString(row.delivery_date),
    installation_date: dateString(row.installation_date),
  };
}
