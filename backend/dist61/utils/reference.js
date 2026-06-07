/**
 * Generate a unique reference number for transactions
 * @param prefix Prefix for the reference (e.g., 'DATA', 'AIRTIME')
 * @returns A unique reference string
 */
export const generateReference = (prefix) => {
    return `${prefix}_${Date.now()}${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
};
