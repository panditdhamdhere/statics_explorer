import { ROBINHOOD_TESTNET_EXPLORER_URL } from "@/config/network";

export function explorerAddressUrl(address: string): string {
  return `${ROBINHOOD_TESTNET_EXPLORER_URL}/address/${address}`;
}

export function explorerTokenUrl(address: string): string {
  return `${ROBINHOOD_TESTNET_EXPLORER_URL}/token/${address}`;
}

export function explorerTxUrl(hash: string): string {
  return `${ROBINHOOD_TESTNET_EXPLORER_URL}/tx/${hash}`;
}

export function explorerBlockUrl(block: number | bigint): string {
  return `${ROBINHOOD_TESTNET_EXPLORER_URL}/block/${block.toString()}`;
}
