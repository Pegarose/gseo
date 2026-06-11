import dns from 'dns';

/**
 * SSRF Protection Module (Option B: Pre-flight DNS Validation)
 * Blocks requests to private/internal IPs (IPv4 & IPv6), non-HTTP protocols,
 * metadata endpoints, and localhost targets. Resolves DNS to prevent DNS rebinding attacks.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '0.0.0.0',
  'metadata.google.internal',
]);

const PRIVATE_IPV4_RANGES = [
  { start: ipToNumber('127.0.0.0'), end: ipToNumber('127.255.255.255') },   // Loopback
  { start: ipToNumber('10.0.0.0'), end: ipToNumber('10.255.255.255') },     // Class A
  { start: ipToNumber('172.16.0.0'), end: ipToNumber('172.31.255.255') },   // Class B
  { start: ipToNumber('192.168.0.0'), end: ipToNumber('192.168.255.255') }, // Class C
  { start: ipToNumber('169.254.0.0'), end: ipToNumber('169.254.255.255') }, // Link-local / Cloud metadata
  { start: ipToNumber('0.0.0.0'), end: ipToNumber('0.255.255.255') },       // Current network
];

// Helper to convert IPv4 to numeric representation
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Checks if an IPv4 or IPv6 address is private/reserved
function isPrivateIP(ip: string): boolean {
  // IPv6 Checks
  if (ip.includes(':')) {
    // Loopback
    if (ip === '::1' || ip === '0000:0000:0000:0000:0000:0000:0000:0001') return true;
    // Unspecified
    if (ip === '::' || ip === '0000:0000:0000:0000:0000:0000:0000:0000') return true;
    
    const lowerIp = ip.toLowerCase();
    
    // Unique-local (fc00::/7) -> fc00 to fdff
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true;
    
    // Link-local (fe80::/10) -> fe80 to febf
    if (lowerIp.startsWith('fe8') || lowerIp.startsWith('fe9') || lowerIp.startsWith('fea') || lowerIp.startsWith('feb')) return true;
    
    // IPv4-mapped IPv6 addresses for local IPv4s
    if (lowerIp.startsWith('::ffff:')) {
      const ipv4Part = lowerIp.substring(7);
      if (ipv4Part.includes('.')) return isPrivateIP(ipv4Part); // recurse for the ipv4 part
    }

    return false;
  }

  // IPv4 Checks
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  const num = ipToNumber(ip);
  return PRIVATE_IPV4_RANGES.some(range => num >= range.start && num <= range.end);
}

export interface SSRFValidationResult {
  safe: boolean;
  reason?: string;
  resolvedIp?: string;
}

/**
 * Validates a URL to ensure it is safe for server-side fetching.
 * Performs DNS resolution to verify the actual IP address.
 */
export async function validateUrlForFetch(rawUrl: string): Promise<SSRFValidationResult> {
  // 1. Parse URL
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: 'Invalid URL format.' };
  }

  // 2. Protocol check – only http/https allowed
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Protocol "${parsed.protocol}" is not allowed. Only http and https are permitted.` };
  }

  // 3. Hostname blocklist
  let hostname = parsed.hostname.toLowerCase();
  
  // Remove brackets for IPv6 hostnames like [::1]
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    hostname = hostname.substring(1, hostname.length - 1);
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { safe: false, reason: `Hostname "${hostname}" is blocked.` };
  }

  // 4. IP-based hostname check (pre-dns)
  if (isPrivateIP(hostname)) {
    return { safe: false, reason: `IP address "${hostname}" is in a private/reserved range.` };
  }

  // 5. Block common cloud metadata paths
  if (parsed.pathname.startsWith('/latest/meta-data') || parsed.pathname.startsWith('/metadata')) {
    return { safe: false, reason: 'Cloud metadata endpoint paths are blocked.' };
  }

  // 6. DNS Resolution validation
  try {
    // lookup returns the first resolved IP. For stricter validation, we use lookupAll to check all IPs.
    const addresses = await dns.promises.lookup(hostname, { all: true });
    
    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: `DNS resolution failed for "${hostname}".` };
    }

    // Ensure NONE of the resolved IPs are in a private range
    for (const record of addresses) {
      if (isPrivateIP(record.address)) {
        return { safe: false, reason: `Hostname "${hostname}" resolves to a private IP: ${record.address}.` };
      }
    }

    return { safe: true, resolvedIp: addresses[0].address };
  } catch (err: any) {
    return { safe: false, reason: `DNS resolution error for "${hostname}": ${err.message}` };
  }
}

/**
 * Validates a redirect target URL to prevent SSRF via open redirects.
 */
export async function validateRedirectTarget(targetUrl: string): Promise<SSRFValidationResult> {
  return validateUrlForFetch(targetUrl);
}
