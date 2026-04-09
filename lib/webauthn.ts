import { cookies } from 'next/headers';

type ChallengePayload = {
  username: string;
  challenge: string;
  createdAt: number;
};

const REGISTER_COOKIE = 'todo-register-challenge';
const LOGIN_COOKIE = 'todo-login-challenge';
const MAX_AGE_SECONDS = 60 * 10;

function encodePayload(payload: ChallengePayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodePayload(raw: string | undefined): ChallengePayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as ChallengePayload;
  } catch {
    return null;
  }
}

async function setChallengeCookie(name: string, payload: ChallengePayload) {
  const cookieStore = await cookies();
  cookieStore.set(name, encodePayload(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

async function consumeChallengeCookie(name: string, username: string) {
  const cookieStore = await cookies();
  const payload = decodePayload(cookieStore.get(name)?.value);
  cookieStore.delete(name);
  if (!payload) return null;
  if (payload.username !== username) return null;
  if (Date.now() - payload.createdAt > MAX_AGE_SECONDS * 1000) return null;
  return payload;
}

export async function storeRegisterChallenge(username: string, challenge: string) {
  await setChallengeCookie(REGISTER_COOKIE, { username, challenge, createdAt: Date.now() });
}

export async function consumeRegisterChallenge(username: string) {
  return consumeChallengeCookie(REGISTER_COOKIE, username);
}

export async function storeLoginChallenge(username: string, challenge: string) {
  await setChallengeCookie(LOGIN_COOKIE, { username, challenge, createdAt: Date.now() });
}

export async function consumeLoginChallenge(username: string) {
  return consumeChallengeCookie(LOGIN_COOKIE, username);
}
