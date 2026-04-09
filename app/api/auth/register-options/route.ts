import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextRequest, NextResponse } from 'next/server';
import { authenticatorDB, userDB } from '@/lib/db';
import { storeRegisterChallenge } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  const { username } = (await request.json()) as { username?: string };
  const normalized = username?.trim();
  if (!normalized) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }
  if (userDB.getByUsername(normalized)) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const options = await generateRegistrationOptions({
    rpID: process.env.RP_ID ?? 'localhost',
    rpName: process.env.RP_NAME ?? 'Todo App',
    userName: normalized,
    attestationType: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  await storeRegisterChallenge(normalized, options.challenge);
  return NextResponse.json(options);
}
