import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	use(request: Request, response: Response, next: NextFunction) {
		const hostname = require('os').hostname();
		const userAgent = request.get('user-agent') || '';

		const { method, originalUrl: url, ip } = request;

		response.on('close', () => {
			const { statusCode } = response;

			this.logger.log(`[${hostname}] ${method} ${url} ${statusCode} - ${ip}`);
		});

		next();
	}
}
