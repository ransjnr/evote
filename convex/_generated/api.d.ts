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
import type * as migrations from "../migrations.js";
import type * as nominations from "../nominations.js";
import type * as nominees from "../nominees.js";
import type * as payments from "../payments.js";
import type * as session from "../session.js";
import type * as systemSettings from "../systemSettings.js";
import type * as tickets from "../tickets.js";
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
  migrations: typeof migrations;
  nominations: typeof nominations;
  nominees: typeof nominees;
  payments: typeof payments;
  session: typeof session;
  systemSettings: typeof systemSettings;
  tickets: typeof tickets;
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
