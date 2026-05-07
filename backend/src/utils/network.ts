// Normalize network input (name or ID) to provider ID (1-4)

export type NetworkId = 1 | 2 | 3 | 4;

const NETWORK_MAP: Record<string, NetworkId> = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  'mtn': 1,
  'mt': 1,
  'mtn (vtu)': 1,
  'airtel': 2,
  'airtel (vtu)': 2,
  'glo': 3,
  '9mobile': 4,
  '9mobile (vtu)': 4,
  '9-mobile': 4,
  '9 mob': 4,
};

const NETWORK_NAMES: Record<NetworkId, string> = {
  1: 'MTN',
  2: 'AIRTEL',
  3: 'GLO',
  4: '9MOBILE',
};

export function normalizeNetwork(input: string | number | undefined): NetworkId | null {
  if (input == null) return null;
  const key = String(input).trim().toLowerCase();
  if (key in NETWORK_MAP) return NETWORK_MAP[key];
  // numeric fallback
  const n = Number(key);
  if ([1, 2, 3, 4].includes(n)) return n as NetworkId;
  return null;
}

export function getNetworkName(id: NetworkId): string {
  return NETWORK_NAMES[id] || 'UNKNOWN';
}
