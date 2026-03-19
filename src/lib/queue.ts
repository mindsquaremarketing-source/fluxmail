import { Queue, Worker } from "bullmq";

const connection = {
  host: new URL(process.env.REDIS_URL ?? "redis://localhost:6379").hostname,
  port: Number(new URL(process.env.REDIS_URL ?? "redis://localhost:6379").port) || 6379,
};

export const emailQueue = new Queue("email", { connection });

export function createWorker<T>(
  name: string,
  processor: (job: { data: T }) => Promise<void>,
) {
  return new Worker<T>(name, processor, { connection });
}
