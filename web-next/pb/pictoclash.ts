/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Empty } from "./google/protobuf/empty";

export const protobufPackage = "pictoclash";

export interface User {
  id: string;
  username: string;
  bio: string;
  pronouns: string;
}

export interface TestUserReq {
}

export interface TestUserRes {
  user: User | undefined;
}

function createBaseUser(): User {
  return { id: "", username: "", bio: "", pronouns: "" };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.username !== "") {
      writer.uint32(18).string(message.username);
    }
    if (message.bio !== "") {
      writer.uint32(26).string(message.bio);
    }
    if (message.pronouns !== "") {
      writer.uint32(34).string(message.pronouns);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.username = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.bio = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.pronouns = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      username: isSet(object.username) ? String(object.username) : "",
      bio: isSet(object.bio) ? String(object.bio) : "",
      pronouns: isSet(object.pronouns) ? String(object.pronouns) : "",
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.username !== undefined && (obj.username = message.username);
    message.bio !== undefined && (obj.bio = message.bio);
    message.pronouns !== undefined && (obj.pronouns = message.pronouns);
    return obj;
  },

  create<I extends Exact<DeepPartial<User>, I>>(base?: I): User {
    return User.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<User>, I>>(object: I): User {
    const message = createBaseUser();
    message.id = object.id ?? "";
    message.username = object.username ?? "";
    message.bio = object.bio ?? "";
    message.pronouns = object.pronouns ?? "";
    return message;
  },
};

function createBaseTestUserReq(): TestUserReq {
  return {};
}

export const TestUserReq = {
  encode(_: TestUserReq, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestUserReq {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestUserReq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): TestUserReq {
    return {};
  },

  toJSON(_: TestUserReq): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<TestUserReq>, I>>(base?: I): TestUserReq {
    return TestUserReq.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestUserReq>, I>>(_: I): TestUserReq {
    const message = createBaseTestUserReq();
    return message;
  },
};

function createBaseTestUserRes(): TestUserRes {
  return { user: undefined };
}

export const TestUserRes = {
  encode(message: TestUserRes, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestUserRes {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestUserRes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TestUserRes {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: TestUserRes): unknown {
    const obj: any = {};
    message.user !== undefined && (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<TestUserRes>, I>>(base?: I): TestUserRes {
    return TestUserRes.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestUserRes>, I>>(object: I): TestUserRes {
    const message = createBaseTestUserRes();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

export interface Pictoclash {
  /** -------- Admin functions -------- */
  Noop(request: Empty): Promise<Empty>;
  TestUser(request: TestUserReq): Promise<TestUserRes>;
}

export const PictoclashServiceName = "pictoclash.Pictoclash";
export class PictoclashClientImpl implements Pictoclash {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || PictoclashServiceName;
    this.rpc = rpc;
    this.Noop = this.Noop.bind(this);
    this.TestUser = this.TestUser.bind(this);
  }
  Noop(request: Empty): Promise<Empty> {
    const data = Empty.encode(request).finish();
    const promise = this.rpc.request(this.service, "Noop", data);
    return promise.then((data) => Empty.decode(_m0.Reader.create(data)));
  }

  TestUser(request: TestUserReq): Promise<TestUserRes> {
    const data = TestUserReq.encode(request).finish();
    const promise = this.rpc.request(this.service, "TestUser", data);
    return promise.then((data) => TestUserRes.decode(_m0.Reader.create(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
