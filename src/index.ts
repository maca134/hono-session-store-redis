import type { SessionStore } from '@maca134/hono-session';
import type { createClient } from 'redis';

export type RedisStoreOptions = {
	/**
	 * The redis client to use
	 */
	client: ReturnType<typeof createClient>;

	/**
	 * The prefix for the session keys
	 */
	prefix?: string;

	/**
	 * The TTL of the session in seconds
	 */
	ttl?: number;
};

export class RedisStore<T> implements SessionStore<T> {
	readonly options: Required<RedisStoreOptions>;

	constructor(options: RedisStoreOptions) {
		if (!options.client) {
			throw new Error('No redis client provided');
		}
		this.options = {
			ttl: 86400,
			prefix: 'sess:',
			...options,
		};
	}

	async get(sid: string) {
		const result = await this.options.client.get(this.options.prefix + sid);
		return result ? JSON.parse(result) : undefined;
	}

	async set(sid: string, data: T) {
		await this.options.client.setEx(
			this.options.prefix + sid,
			this.options.ttl,
			JSON.stringify(data)
		);
	}

	async delete(sid: string) {
		await this.options.client.del(this.options.prefix + sid);
	}

	async touch(sid: string) {
		await this.options.client.expire(this.options.prefix + sid, this.options.ttl);
	}
}
