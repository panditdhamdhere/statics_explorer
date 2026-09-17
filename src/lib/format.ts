import { formatUnits, type Address, type Hex } from "viem";

export function truncateAddress(address: string, size = 4): string {
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

export function truncateHex(value: string, size = 6): string {
  if (value.length <= size * 2 + 2) return value;
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

export function formatTokenAmount(
  value: bigint,
  decimals: number,
  maxFractionDigits = 8,
): string {
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  if (!fraction || maxFractionDigits === 0) return whole;
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function formatEth(value: bigint): string {
  return `${formatTokenAmount(value, 18, 6)} ETH`;
}

export function stringifyBigInt(value: bigint): string {
  return value.toString();
}

export function checksumEquals(left: Address | string, right: Address | string) {
  return left.toLowerCase() === right.toLowerCase();
}

export function formatPoolId(id: Hex | string): string {
  return id;
}
