'use strict';

class HttpError extends Error {
	constructor({message, code}) {
		super(message);
        this.name = "HttpError";
		this.code = code;
	}
}

class DbError extends Error {
	constructor({message, code}) {
		super(message);
        this.name = "DbError";
		this.code = code;
	}
}

class CustomError extends Error {
	constructor({message, code}) {
		super(message);
        this.name = "CustomError";
		this.code = code;
	}
}

class TokenError extends Error {
	constructor({message, code}) {
		super(message);
        this.name = "TokenError";
		this.code = code;
	}
}


module.exports = {
	HttpError,
	DbError,
	CustomError,
	TokenError
}
