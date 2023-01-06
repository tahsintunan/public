import { AccountInfo, PublicKey } from "@solana/web3.js";
import { publicKey } from "../utils/layout";
import { Structure, struct, u8, blob } from "buffer-layout";

export interface LendingMarket {
  version: number;
  bumpSeed: number;
  owner: PublicKey;
  quoteTokenMint: PublicKey;
  tokenProgramId: PublicKey;
  oracleProgramId: PublicKey;
  switchboardOracleProgramId: PublicKey;
}

export const LendingMarketLayout: typeof Structure = struct([
  u8("version"),
  u8("bumpSeed"),
  publicKey("owner"),
  publicKey("quoteTokenMint"),
  publicKey("tokenProgramId"),
  publicKey("oracleProgramId"),
  publicKey("switchboardOracleProgramId"),
  blob(128, "padding"),
]);

export const LENDING_MARKET_SIZE = LendingMarketLayout.span;

export const isLendingMarket = (info: AccountInfo<Buffer>) =>
  info.data.length === LendingMarketLayout.span;

export const parseLendingMarket = (
  pubkey: PublicKey,
  info: AccountInfo<Buffer>
) => {
  const buffer = Buffer.from(info.data);
  const lendingMarket = LendingMarketLayout.decode(buffer) as LendingMarket;

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: lendingMarket,
  };

  return details;
};
