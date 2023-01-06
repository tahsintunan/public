import BN from "bn.js";
import { uint64 } from "../utils/layout";
import { Structure, struct, u8 } from "buffer-layout";

export const LastUpdateLayout: typeof Structure = struct(
  [uint64("slot"), u8("stale")],
  "lastUpdate"
);

export interface LastUpdate {
  slot: BN;
  stale: boolean;
}
