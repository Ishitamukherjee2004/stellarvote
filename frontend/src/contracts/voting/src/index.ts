import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}
export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDSUVGMRJIOUGEQTSHDUQDZZRX3RRRATIRMLN6WWX7QQK3LDDNYDSSJK",
  }
} as const


export interface Poll {
  id: u64;
  is_active: boolean;
  options: Array<string>;
  question: string;
}

export type DataKey = {tag: "PollCount", values: void} | {tag: "Poll", values: readonly [u64]} | {tag: "VoteCount", values: readonly [u64, u32]} | {tag: "UserVoted", values: readonly [u64, string]};

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cast a vote for a given poll and option
   */
  vote: ({voter, poll_id, option_index}: {voter: string, poll_id: u64, option_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get poll details
   */
  get_poll: ({poll_id}: {poll_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Poll>>

  /**
   * Construct and simulate a create_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new poll. Returns the poll_id.
   */
  create_poll: ({question, options}: {question: string, options: Array<string>}, methodOptions?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total vote counts for a poll. Returns a Vec of counts matching the options order.
   */
  get_results: ({poll_id}: {poll_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u32>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABFBvbGwAAAAEAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAHb3B0aW9ucwAAAAPqAAAAEAAAAAAAAAAIcXVlc3Rpb24AAAAQ",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAACVBvbGxDb3VudAAAAAAAAAEAAAAAAAAABFBvbGwAAAABAAAABgAAAAEAAAAAAAAACVZvdGVDb3VudAAAAAAAAAIAAAAGAAAABAAAAAEAAAAAAAAACVVzZXJWb3RlZAAAAAAAAAIAAAAGAAAAEw==",
        "AAAAAAAAACdDYXN0IGEgdm90ZSBmb3IgYSBnaXZlbiBwb2xsIGFuZCBvcHRpb24AAAAABHZvdGUAAAADAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAAAAAAB3BvbGxfaWQAAAAABgAAAAAAAAAMb3B0aW9uX2luZGV4AAAABAAAAAA=",
        "AAAAAAAAABBHZXQgcG9sbCBkZXRhaWxzAAAACGdldF9wb2xsAAAAAQAAAAAAAAAHcG9sbF9pZAAAAAAGAAAAAQAAB9AAAAAEUG9sbA==",
        "AAAAAAAAACdDcmVhdGUgYSBuZXcgcG9sbC4gUmV0dXJucyB0aGUgcG9sbF9pZC4AAAAAC2NyZWF0ZV9wb2xsAAAAAAIAAAAAAAAACHF1ZXN0aW9uAAAAEAAAAAAAAAAHb3B0aW9ucwAAAAPqAAAAEAAAAAEAAAAG",
        "AAAAAAAAAFVHZXQgdG90YWwgdm90ZSBjb3VudHMgZm9yIGEgcG9sbC4gUmV0dXJucyBhIFZlYyBvZiBjb3VudHMgbWF0Y2hpbmcgdGhlIG9wdGlvbnMgb3JkZXIuAAAAAAAAC2dldF9yZXN1bHRzAAAAAAEAAAAAAAAAB3BvbGxfaWQAAAAABgAAAAEAAAPqAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<null>,
        get_poll: this.txFromJSON<Poll>,
        create_poll: this.txFromJSON<u64>,
        get_results: this.txFromJSON<Array<u32>>
  }
}