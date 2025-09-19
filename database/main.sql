-- PostgreSQL-compatible schema
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" TIMESTAMP NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS children (
    child_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_websites (
    block_id SERIAL PRIMARY KEY,
    child_id INT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
    website VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


