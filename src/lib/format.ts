/** Formats whole Uganda shillings the way the pricing screens show them: "UGX 1,500". */
export function formatUgx(amount: number): string {
  if (!Number.isFinite(amount)) throw new RangeError('amount must be a finite number');
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}
