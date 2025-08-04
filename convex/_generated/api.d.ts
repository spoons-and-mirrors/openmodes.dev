/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as cleanup from "../cleanup.js";
import type * as http from "../http.js";
import type * as modes from "../modes.js";
import type * as mutation from "../mutation.js";
import type * as query from "../query.js";
import type * as revisions from "../revisions.js";
import type * as stats from "../stats.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as versions from "../versions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cleanup: typeof cleanup;
  http: typeof http;
  modes: typeof modes;
  mutation: typeof mutation;
  query: typeof query;
  revisions: typeof revisions;
  stats: typeof stats;
  types: typeof types;
  users: typeof users;
  versions: typeof versions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
