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
    return "Request timed out.";
  }
  if (RPC.test(raw)) {
    return "RPC request failed.";
  }
  if (NETWORK.test(raw) && /switch|add/i.test(raw)) {
    return "Couldn't switch to Robinhood Chain Testnet.";
  }

  if (/ERC721NonexistentToken|nonexistent token/i.test(raw)) {
    return "No position at this ID.";
  }

  return fallback;
}

export const UNAVAILABLE_FIELD = "Unavailable";

export const MISSING_RPC_MESSAGE =
  "Set NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL to load onchain data.";
