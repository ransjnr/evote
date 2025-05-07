// lib/convexClient.ts
import { ConvexHttpClient } from "convex/browser"; // or "convex/server" for Node
import { api } from "@/convex/_generated/api";

export const convexClient = new ConvexHttpClient(process.env.CONVEX_URL!);
