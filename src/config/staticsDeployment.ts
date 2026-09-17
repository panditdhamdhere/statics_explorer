import { getAddress, type Address, type Hex } from "viem";
import { PINNED_SDK_COMMIT } from "@/config/sources";

function address(value: string): Address {
  return getAddress(value);
}

function poolId(value: string): Hex {
  return value.toLowerCase() as Hex;
}

/**
 * Recorded Robinhood Chain Testnet integration-beta deployment.
 * Addresses come from the official deployment snapshot and the task-verified
 * address list. These are not mainnet addresses.
 *
 * Source: https://docs.staticsprotocol.com/docs/reference/robinhood-testnet-deployment/
 */
export const staticsDeployment = {
  network: "Robinhood Chain Testnet",
  chainId: 46630,
  label: "Robinhood Chain Testnet · Integration Beta",
  notProduction: true,
  explorer: "https://explorer.testnet.chain.robinhood.com",
  sdkCommit: PINNED_SDK_COMMIT,
  release: {
    initialRuntimeSourceCommit: "724df0fe80be8e376a5cb61811d02e1ef7413707",
    deploymentToolingCommit: "9baa3a87bf120fdd02340359a2594590394181a8",
    currentProtocolCommit: "aeed216abe9d8d08d589b5a66aba637f9a04822b",
    deploymentPinnedSdkCommit: PINNED_SDK_COMMIT,
    releaseStartBlock: 97_382_446,
    governedProtocolPoolsUpgradeBlock: 97_967_966,
  },
  contracts: {
    staticsDiamond: {
      name: "StaticsDiamond / PositionNFT",
      symbol: "STXPOS",
      address: address("0x2340741Ec94dF12678312f564eBc2c776d8FaA6a"),
      category: "Protocol core",
    },
    staticsDollarCoreDiamond: {
      name: "StaticsDollarCoreDiamond",
      address: address("0x6AB8009073e0e6E0b0458e39E3b547DA31b5724f"),
      category: "Dollar",
    },
    usdstx: {
      name: "Statics Dollar",
      symbol: "USDstx",
      address: address("0xd1F2DC3Ed9b70a85B6629C04afCEdb43B2Ca25ce"),
      category: "Dollar",
    },
    ethLev: {
      name: "Dollar risk shares",
      symbol: "ethLEV",
      address: address("0x5E316e8961C9C5ef4bb6dDc0573dc3cf232eEd6c"),
      category: "Dollar",
    },
    statics: {
      name: "Statics token",
      symbol: "STATICS",
      address: address("0xF46cC8F00C24bb622ECe0f771Cc4B53b40722d81"),
      category: "Token",
    },
    staticsDollarOracle: {
      name: "Statics Dollar oracle",
      address: address("0x69a88C213eda8db22373Fd9C113bB988231652e2"),
      category: "Oracle",
    },
    swapFeeHook: {
      name: "Swap-fee hook",
      address: address("0x9718C37742F6650BdD7147e0e4854f5bb0Bd90Cc"),
      category: "Liquidity",
    },
    liquidityManager: {
      name: "Liquidity manager",
      address: address("0x9E8B33ff86e36fe64ba2f1504fF53bE586F4183A"),
      category: "Liquidity",
    },
    positionRenderer: {
      name: "Position renderer",
      address: address("0x6da774A3B27B267D1926fEf7FFeB71cC80a6700C"),
      category: "PositionNFT",
    },
    avatarSvg: {
      name: "Avatar SVG",
      address: address("0x4D5513E2e4B0A0f547E850420437D841CFF6Ca8C"),
      category: "PositionNFT",
    },
    staticsFaucet: {
      name: "Statics faucet",
      address: address("0xDc74E592efbe3CE5A86785E89E50b53Fe0F8F04E"),
      category: "Testnet fixture",
    },
    tpa1BasketToken: {
      name: "TPA1 BasketToken",
      symbol: "TPA1",
      address: address("0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83"),
      category: "Genesis basket",
    },
    timelock: {
      name: "Timelock",
      address: address("0xd6DCf8aDE20bA8874f5c9A79870e6456B301dc29"),
      category: "Governance",
    },
    deployer: {
      name: "Deployer",
      address: address("0x6Ae2aD9905FEDC8270b828294D4b9CEC7CBBE316"),
      category: "Governance",
    },
    mockUsdg: {
      name: "Mock USDG",
      address: address("0x3c9dCe3FD17f3FC8A1929B1614b2c99124129Da1"),
      category: "Testnet fixture",
    },
    mockUsdgOracle: {
      name: "Mock USDG oracle",
      address: address("0x2da7445953d5f3E3128B967c476DF38F1783Fa38"),
      category: "Testnet fixture",
    },
    ethUsdFeed: {
      name: "ETH/USD feed",
      address: address("0xc13527fc5b442E18844476E9a01e483F56962a4e"),
      category: "Oracle",
    },
    sequencerUptimeFeed: {
      name: "Sequencer uptime feed",
      address: address("0xA9c1d13D7714ea511b1607F5f20fC6B3393eA5B6"),
      category: "Oracle",
    },
  },
  governance: {
    minimumDelaySeconds: 120,
    diamondOwners: "Timelock",
    proposerCanceller: "Deployer",
    executor: "Open (address(0))",
    guardianTreasury: "Deployer",
    basketCreationFee: "0",
    positionCreationFee: "0.001 ETH",
  },
  peggedProfile: {
    name: "Mock USDG profile 2",
    profileId: 2,
    decimals: 6,
    pegBand: "0.95–1.05",
    mintFee: "5 BPS",
    redemptionFee: "7 BPS",
    debtCeiling: "1,000,000 USDstx",
  },
  faucet: {
    cooldown: "One day per wallet",
    inventory: ["Mock USDG", "STATICS", "TSLA", "PLTR", "AMD"],
  },
  reuseChainDependencies: {
    weth: {
      name: "WETH",
      address: address("0x33e4191705c386532ba27cBF171Db86919200B94"),
      category: "Chain dependency",
    },
    poolManager: {
      name: "Uniswap v4 PoolManager",
      address: address("0x8366a39CC670B4001A1121B8F6A443A643e40951"),
      category: "Chain dependency",
    },
    positionManager: {
      name: "Uniswap v4 PositionManager",
      address: address("0x58DaEC3116AAe6D93017BaaEA7749052E8a04fa7"),
      category: "Chain dependency",
    },
    permit2: {
      name: "Permit2",
      address: address("0x000000000022D473030F116dDEE9F6B43aC78BA3"),
      category: "Chain dependency",
    },
    quoter: {
      name: "Quoter",
      address: address("0x8dc178eFb8111Bb0973Dd9d722eBefF267c98F94"),
      category: "Chain dependency",
    },
    stateView: {
      name: "StateView",
      address: address("0xF3334192D15450cdD385c8B70E03f9a6Bd9E673B"),
      category: "Chain dependency",
    },
    universalRouter: {
      name: "Universal Router",
      address: address("0x8876789976DecbFCbBbe364623C63652db8c0904"),
      category: "Chain dependency",
    },
  },
  upgrade: {
    interfaceId: "0xa076af5a",
    basketLiquidityFacet: address("0x8d9F1307c4659Bd49372c50F26455cc9B561d935"),
    borrowLiquidityFacet: address("0xa2a4C8214af55Fd3f0eB9ecf393E6D18a33789Ab"),
    liquidityRewardsFacet: address("0x9F7eB83b08a40a9Fb8474E2C81C37922F0810779"),
    protocolPoolFacet: address("0x117FBbb83daF7c20fCd4f05a7D17DCfA1b354b0C"),
    previousLiquidityManager: address(
      "0xbE5A795ae0754D8D36F6EdFD546e55f5E60d6455",
    ),
    currentLiquidityManager: address(
      "0x9E8B33ff86e36fe64ba2f1504fF53bE586F4183A",
    ),
  },
} as const;

export const tpa1Basket = {
  basketId: 0n,
  name: "Tesla-Palantir-AMD-1",
  symbol: "TPA1",
  token: address("0x8Dce6B4AC21769e437F414EA6dDacb407C5b4F83"),
  creatorLabel: "Governance timelock",
  documentedFixtureCompositionLabel: "Documented testnet fixture composition",
  documentedFixtureCompositionNote:
    "TPA1 is a testnet fixture example. This is not a production basket composition. Live launch compositions on later networks should be treated as TBD until finalized.",
  documentedFixtureComposition: [
    { symbol: "TSLA", amountPerBasketToken: "0.01" },
    { symbol: "PLTR", amountPerBasketToken: "0.01" },
    { symbol: "AMD", amountPerBasketToken: "0.01" },
  ] as const,
  constituents: [
    {
      symbol: "TSLA",
      address: address("0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E"),
    },
    {
      symbol: "PLTR",
      address: address("0x1FBE1a0e43594b3455993B5dE5Fd0A7A266298d0"),
    },
    {
      symbol: "AMD",
      address: address("0x71178BAc73cBeb415514eB542a8995b82669778d"),
    },
  ] as const,
  canonicalPools: [
    {
      pair: "TPA1 / TSLA",
      assetSymbol: "TSLA",
      asset: address("0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E"),
      poolId: poolId(
        "0xa046b35fa1fa5de399b403d5dc0f8d1ac836304af6ba84b2097ea3003002f395",
      ),
    },
    {
      pair: "TPA1 / PLTR",
      assetSymbol: "PLTR",
      asset: address("0x1FBE1a0e43594b3455993B5dE5Fd0A7A266298d0"),
      poolId: poolId(
        "0x78c00dcabb24279078b94ac61676a46c295f0385ffebd6c169fc833a51e77846",
      ),
    },
    {
      pair: "TPA1 / AMD",
      assetSymbol: "AMD",
      asset: address("0x71178BAc73cBeb415514eB542a8995b82669778d"),
      poolId: poolId(
        "0x506945b7cae6b7c5e9a260c1613dac4dd7a39d235af5e10747079aa3ae086308",
      ),
    },
  ] as const,
} as const;

export type DeploymentContract = {
  name: string;
  address: Address;
  category: string;
  symbol?: string;
};

export const directoryContracts: DeploymentContract[] = [
  {
    name: staticsDeployment.contracts.staticsDiamond.name,
    address: staticsDeployment.contracts.staticsDiamond.address,
    category: staticsDeployment.contracts.staticsDiamond.category,
    symbol: staticsDeployment.contracts.staticsDiamond.symbol,
  },
  {
    name: staticsDeployment.contracts.staticsDollarCoreDiamond.name,
    address: staticsDeployment.contracts.staticsDollarCoreDiamond.address,
    category: staticsDeployment.contracts.staticsDollarCoreDiamond.category,
  },
  {
    name: staticsDeployment.contracts.usdstx.name,
    address: staticsDeployment.contracts.usdstx.address,
    category: staticsDeployment.contracts.usdstx.category,
    symbol: staticsDeployment.contracts.usdstx.symbol,
  },
  {
    name: staticsDeployment.contracts.ethLev.name,
    address: staticsDeployment.contracts.ethLev.address,
    category: staticsDeployment.contracts.ethLev.category,
    symbol: staticsDeployment.contracts.ethLev.symbol,
  },
  {
    name: staticsDeployment.contracts.statics.name,
    address: staticsDeployment.contracts.statics.address,
    category: staticsDeployment.contracts.statics.category,
    symbol: staticsDeployment.contracts.statics.symbol,
  },
  {
    name: staticsDeployment.contracts.staticsDollarOracle.name,
    address: staticsDeployment.contracts.staticsDollarOracle.address,
    category: staticsDeployment.contracts.staticsDollarOracle.category,
  },
  {
    name: staticsDeployment.contracts.swapFeeHook.name,
    address: staticsDeployment.contracts.swapFeeHook.address,
    category: staticsDeployment.contracts.swapFeeHook.category,
  },
  {
    name: staticsDeployment.contracts.liquidityManager.name,
    address: staticsDeployment.contracts.liquidityManager.address,
    category: staticsDeployment.contracts.liquidityManager.category,
  },
  {
    name: staticsDeployment.contracts.positionRenderer.name,
    address: staticsDeployment.contracts.positionRenderer.address,
    category: staticsDeployment.contracts.positionRenderer.category,
  },
  {
    name: staticsDeployment.contracts.staticsFaucet.name,
    address: staticsDeployment.contracts.staticsFaucet.address,
    category: staticsDeployment.contracts.staticsFaucet.category,
  },
  {
    name: staticsDeployment.contracts.tpa1BasketToken.name,
    address: staticsDeployment.contracts.tpa1BasketToken.address,
    category: staticsDeployment.contracts.tpa1BasketToken.category,
    symbol: staticsDeployment.contracts.tpa1BasketToken.symbol,
  },
];

export const additionalVerifiedContracts: DeploymentContract[] = [
  {
    name: staticsDeployment.contracts.avatarSvg.name,
    address: staticsDeployment.contracts.avatarSvg.address,
    category: staticsDeployment.contracts.avatarSvg.category,
  },
  {
    name: staticsDeployment.contracts.timelock.name,
    address: staticsDeployment.contracts.timelock.address,
    category: staticsDeployment.contracts.timelock.category,
  },
  {
    name: staticsDeployment.contracts.deployer.name,
    address: staticsDeployment.contracts.deployer.address,
    category: staticsDeployment.contracts.deployer.category,
  },
  {
    name: staticsDeployment.contracts.mockUsdg.name,
    address: staticsDeployment.contracts.mockUsdg.address,
    category: staticsDeployment.contracts.mockUsdg.category,
  },
  {
    name: staticsDeployment.contracts.mockUsdgOracle.name,
    address: staticsDeployment.contracts.mockUsdgOracle.address,
    category: staticsDeployment.contracts.mockUsdgOracle.category,
  },
  {
    name: staticsDeployment.contracts.ethUsdFeed.name,
    address: staticsDeployment.contracts.ethUsdFeed.address,
    category: staticsDeployment.contracts.ethUsdFeed.category,
  },
  {
    name: staticsDeployment.contracts.sequencerUptimeFeed.name,
    address: staticsDeployment.contracts.sequencerUptimeFeed.address,
    category: staticsDeployment.contracts.sequencerUptimeFeed.category,
  },
  ...Object.values(staticsDeployment.reuseChainDependencies),
  {
    symbol: "TSLA",
    name: "TPA1 constituent · TSLA",
    address: tpa1Basket.constituents[0].address,
    category: "Genesis basket",
  },
  {
    symbol: "PLTR",
    name: "TPA1 constituent · PLTR",
    address: tpa1Basket.constituents[1].address,
    category: "Genesis basket",
  },
  {
    symbol: "AMD",
    name: "TPA1 constituent · AMD",
    address: tpa1Basket.constituents[2].address,
    category: "Genesis basket",
  },
];
