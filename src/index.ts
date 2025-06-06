import type { SessionStore } from '@maca134/hono-session';

type RedisClient = {
	// The redis client to use
	get: (key: string) => Promise<string | null>;
	setEx: (key: string, ttl: number, value: string) => Promise<any>;
	del: (key: string) => Promise<any>;
	expire: (key: string, ttl: number) => Promise<any>;
};

export type RedisStoreOptions = {
	/**
	 * The redis client to use
	 */
	client: RedisClient;

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
			ttl: options.ttl || 86400,
			prefix: options.prefix || 'sess:',
			client: options.client,
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
