// Proof of concept for your entry.ts
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

// ... Inside your handleApiRequest
const rawIdentifier = "global-demo-session";
const encodedBuffer = Buffer.from(rawIdentifier);
const hashedIdentifier = createHash("sha256").update(encodedBuffer).digest("hex");
