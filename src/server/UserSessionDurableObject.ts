import { DurableObject } from "cloudflare:workers";

export class UserSessionDurableObject extends DurableObject {
  async incrementVisitCount(): Promise<number> {
    const currentCount = (await this.ctx.storage.get<number>("visitCount")) || 0;
    const updatedCount = currentCount + 1;
    await this.ctx.storage.put("visitCount", updatedCount);
    return updatedCount;
  }
}
