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
import type * as categories from "../categories.js";
import type * as departments from "../departments.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as nominees from "../nominees.js";
import type * as ticketReservations from "../ticketReservations.js";
import type * as voting from "../voting.js";

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
  categories: typeof categories;
  departments: typeof departments;
  events: typeof events;
  http: typeof http;
  migrations: typeof migrations;
  nominees: typeof nominees;
  ticketReservations: typeof ticketReservations;
  voting: typeof voting;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
