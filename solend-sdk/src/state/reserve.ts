import { AccountInfo, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { uint64, uint128, publicKey } from "../utils/layout";
import { LastUpdate, LastUpdateLayout } from "./lastUpdate";
import { struct, u8, blob, Structure } from "buffer-layout";

export interface Reserve {
  version: number;
  lastUpdate: LastUpdate;
  lendingMarket: PublicKey;
  liquidity: ReserveLiquidity;
  collateral: ReserveCollateral;
  config: ReserveConfig;
}

export interface ReserveLiquidity {
  mintPubkey: PublicKey;
  mintDecimals: number;
  supplyPubkey: PublicKey;
  // @FIXME: oracle option
  oracleOption: number;
  pythOraclePubkey: PublicKey;
  switchboardOraclePubkey: PublicKey;
  availableAmount: BN;
  borrowedAmountWads: BN;
  cumulativeBorrowRateWads: BN;
  accumulatedProtocolFeesWads: string;
  marketPrice: BN;
}

export interface ReserveCollateral {
  mintPubkey: PublicKey;
  mintTotalSupply: BN;
  supplyPubkey: PublicKey;
}

export interface ReserveConfig {
  optimalUtilizationRate: number;
  loanToValueRatio: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  minBorrowRate: number;
  optimalBorrowRate: number;
  maxBorrowRate: number;
  fees: {
    borrowFeeWad: BN;
    flashLoanFeeWad: BN;
    hostFeePercentage: number;
  };
  depositLimit: BN;
  borrowLimit: BN;
  feeReceiver?: PublicKey;
  protocolLiquidationFee: number;
  protocolTakeRate: number;
  accumulatedProtocolFeesWads: string;
}

export const ReserveConfigLayout = struct(
  [
    u8("optimalUtilizationRate"),
    u8("loanToValueRatio"),
    u8("liquidationBonus"),
    u8("liquidationThreshold"),
    u8("minBorrowRate"),
    u8("optimalBorrowRate"),
    u8("maxBorrowRate"),
    struct(
      [
        uint64("borrowFeeWad"),
        uint64("flashLoanFeeWad"),
        u8("hostFeePercentage"),
      ],
      "fees"
    ),
    uint64("depositLimit"),
    uint64("borrowLimit"),
    publicKey("feeReceiver"),
    u8("protocolLiquidationFee"),
    u8("protocolTakeRate"),
    uint128("accumulatedProtocolFeesWads"),
  ],
  "config"
);

export const ReserveLayout: typeof Structure = struct([
  u8("version"),

  LastUpdateLayout,

  publicKey("lendingMarket"),

  struct(
    [
      publicKey("mintPubkey"),
      u8("mintDecimals"),
      publicKey("supplyPubkey"),
      // @FIXME: oracle option
      // TODO: replace u32 option with generic equivalent
      // u32('oracleOption'),
      publicKey("pythOracle"),
      publicKey("switchboardOracle"),
      uint64("availableAmount"),
      uint128("borrowedAmountWads"),
      uint128("cumulativeBorrowRateWads"),
      uint128("marketPrice"),
    ],
    "liquidity"
  ),

  struct(
    [
      publicKey("mintPubkey"),
      uint64("mintTotalSupply"),
      publicKey("supplyPubkey"),
    ],
    "collateral"
  ),
  ReserveConfigLayout,
  blob(230, "padding"),
]);

export const RESERVE_SIZE = ReserveLayout.span;

export const isReserve = (info: AccountInfo<Buffer>) =>
  info.data.length === RESERVE_SIZE;

export const parseReserve = (pubkey: PublicKey, info: AccountInfo<Buffer>) => {
  const { data } = info;
  const buffer = Buffer.from(data);
  const reserve = ReserveLayout.decode(buffer);

  if (reserve.lastUpdate.slot.isZero()) {
    return null;
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  };

  return details;
};

export function reserveToString(reserve: Reserve) {
  return JSON.stringify(
    reserve,
    (key, value) => {
      // Skip padding
      if (key === "padding") {
        return null;
      }
      switch (value.constructor.name) {
        case "PublicKey":
          return value.toBase58();
        case "BN":
          return value.toString();
        default:
          return value;
      }
    },
    2
  );
}
