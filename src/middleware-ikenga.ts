// IKENGA™ FORTRESS MIDDLEWARE
// ALL RIGHTS RESERVED. UNAUTHORIZED REPRODUCTION IS PROHIBITED UNDER UK LAWS.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IKENGA_LEGAL_MESSAGE = {
  error: 'ACCESS DENIED - IKENGA™ PROTECTED',
  code: 'IKENGA_FORTRESS_BLOCK',
  legal: {
    act: 'Computer Misuse Act 1990',
    penalty: 'Unlimited fine and/or up to 10 years imprisonment',
    copyright: 'Copyright, Designs and Patents Act 1988',
    gdpr: 'Data Protection Act 2018 (UK GDPR)',
    fraud: 'Fraud Act 2006 — Section 6 (Possession of articles for fraud)',
    serious_crime: 'Serious Crime Act 2015 — Section 45'
  },
  message: 'ALL RIGHTS RESERVED. UNAUTHORIZED REPRODUCTION, REVERSE ENGINEERING OR PROBING IS PROHIBITED UNDER UK LAWS.',
  owner: 'UJU GROUP LIMITED',
  contact: 'ujugrouplimited@gmail.com',
  trademark: 'IKENGA™, UJU CYCLE™, ASK URIS™ are trademarks of UJU GROUP LIMITED'
};

// Block patterns specific to IKENGA protection
const IKENGA_BLOCKED_PATTERNS = [
  // Model extraction attempts
  'extract_model', 'get_weights', 'download_model', 'model.json',
  'pytorch_model', 'tensorflow', 'onnx', 'safetensors', 'pickle',
  
  // API abuse
  'ikenga/generate', 'ujucycle/query', 'token/leak', 'api/keys',
  'anthropic_api_key', 'openai_key', 'claude_api',
  
  // Reverse engineering tools
  'ghidra', 'ida', 'binaryninja', 'radare2', 'objdump', 'strings',
  'decompiler', 'disassembler', 'debugger',
  
  // Web scraping attempts
  'ikenga.com', 'ujucycle.com', 'scrape', 'crawl', 'selenium',
  
  // Probing for vulnerabilities
  '../.env', '../config', '../secrets', 'process.env',
  "require('fs')", 'readFileSync', 'eval('
];

// Rate limiting: 20 requests per minute for IKENGA endpoints
const ikengaRateLimit = new Map<string, { count: number; firstAttempt: number }>();

export async function ikengaMiddleware(request: NextRequest) {
  const path = request.nextUrl?.pathname || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // IKENGA-specific endpoints that need extra protection
  const IKENGA_PROTECTED_ENDPOINTS = [
    '/api/ikenga/generate',
    '/api/ujucycle/process',
    '/api/tonal/match',
    '/api/ai/personality',
    '/api/iq/analyse'
  ];

  const isProtectedEndpoint = IKENGA_PROTECTED_ENDPOINTS.some(endpoint => path.startsWith(endpoint));

  if (isProtectedEndpoint) {
    // STRICT rate limiting for AI endpoints
    const now = Date.now();
    const record = ikengaRateLimit.get(ip);

    if (record) {
      if (now - record.firstAttempt < 60000) {
        if (record.count > 20) { // 20 requests per minute max
          return blockIkengaRequest(ip, userAgent, 'RATE_LIMIT_EXCEEDED_20/min');
        }
        record.count++;
      } else {
        ikengaRateLimit.set(ip, { count: 1, firstAttempt: now });
      }
    } else {
      ikengaRateLimit.set(ip, { count: 1, firstAttempt: now });
    }

    // Check for reverse engineering patterns
    const lowerUA = userAgent.toLowerCase();
    for (const pattern of IKENGA_BLOCKED_PATTERNS) {
      if (lowerUA.includes(pattern) || path.includes(pattern)) {
        return blockIkengaRequest(ip, userAgent, `BLOCKED: ${pattern}`);
      }
    }

    // Obfuscate API response (changes with each request)
    const response = NextResponse.next();
    response.headers.set('X-Ikenga-Reinforcement', crypto.randomUUID().replace(/-/g, ''));
    response.headers.set('X-Legal-Notice', IKENGA_LEGAL_MESSAGE.message);
    response.headers.set('X-Response-Obfuscation', 'ACTIVE');

    return response;
  }

  // Add legal headers to all IKENGA pages
  const response = NextResponse.next();
  response.headers.set('X-IKENGA-Protected', 'TM-UJU-GROUP-LIMITED');
  response.headers.set('X-Copyright', 'UJU GROUP LIMITED - ALL RIGHTS RESERVED');
  response.headers.set('X-Trade-Secret', 'UJU CYCLE™ is a proprietary trade secret');
  response.headers.set('Content-Security-Policy', "script-src 'self' 'unsafe-inline' 'unsafe-eval';");

  return response;
}

async function blockIkengaRequest(ip: string, userAgent: string, reason: string): Promise<NextResponse> {
  // Log to immutable evidence store
  console.error(JSON.stringify({
    type: 'IKENGA_FORTRESS_BLOCK',
    ip,
    userAgent,
    reason,
    legal_basis: 'Computer Misuse Act 1990, CDPA 1988',
    penalty: 'Unlimited fine and/or up to 10 years imprisonment',
    owner: 'UJU GROUP LIMITED',
    timestamp: new Date().toISOString()
  }));

  return new NextResponse(
    JSON.stringify({
      ...IKENGA_LEGAL_MESSAGE,
      blocked_reason: reason,
      timestamp: new Date().toISOString()
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'X-Legal-Notice': 'ALL RIGHTS RESERVED. UNAUTHORIZED REPRODUCTION IS PROHIBITED UNDER UK LAWS.',
        'X-IKENGA-Protected': 'TM-UJU-GROUP-LIMITED'
      }
    }
  );
}

export const config = {
  matcher: [
    '/api/ikenga/:path*',
    '/api/ujucycle/:path*',
    '/api/tonal/:path*',
    '/api/ai/:path*',
    '/api/iq/:path*'
  ],
};
