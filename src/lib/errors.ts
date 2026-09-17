const USER_REJECTED = /user rejected|denied|rejected the request/i;
const TIMEOUT = /timeout|timed out|took too long/i;
const NETWORK = /network|chain|unsupported/i;
const RPC = /rpc|fetch failed|http request failed|failed to fetch/i;

export function toUserErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallback;

  if (USER_REJECTED.test(raw)) {
    return "The wallet request was rejected.";
  }
  if (TIMEOUT.test(raw)) {
    return "The request timed out. Check the RPC configuration or try again.";
  }
  if (RPC.test(raw)) {
    return "Unable to reach Robinhood Chain Testnet. Check the RPC configuration or try again.";
  }
  if (NETWORK.test(raw) && /switch|add/i.test(raw)) {
    return "Unable to switch to Robinhood Chain Testnet from this wallet.";
  }

  if (/ERC721NonexistentToken|nonexistent token/i.test(raw)) {
    return "Unable to read a position for this ID on the selected deployment.";
  }

  return fallback;
}

export const UNAVAILABLE_FIELD =
  "Unavailable from current deployment/interface";

export const MISSING_RPC_MESSAGE =
  "Live chain reads are disabled until NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL is set. Public deployment metadata is still available.";
