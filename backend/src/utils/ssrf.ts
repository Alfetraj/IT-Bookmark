import { resolve } from 'dns/promises';
import { URL } from 'url';
import net from 'net';
import { logger } from './logger';

const isPrivateIP = (ip: string): boolean => {
  // Handle IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      parts[0] === 169 // Link-local
    );
  }
  
  // Handle IPv6 (very simplified, ideally should check for fe80, fc00, ::1, etc.)
  if (net.isIPv6(ip)) {
    const lowerIP = ip.toLowerCase();
    return (
      lowerIP === '::1' ||
      lowerIP === '::' ||
      lowerIP.startsWith('fc') ||
      lowerIP.startsWith('fd') ||
      lowerIP.startsWith('fe80')
    );
  }

  return false;
};

export const validateUrlSSRF = async (urlStr: string): Promise<boolean> => {
  try {
    const url = new URL(urlStr);
    
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      logger.warn(`SSRF Blocked: Invalid protocol ${url.protocol} for URL ${urlStr}`);
      return false;
    }

    const hostname = url.hostname;

    // Block obvious localhosts
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return false;
    }

    // Resolve DNS
    const addresses = await resolve(hostname);
    
    for (const address of addresses) {
      if (isPrivateIP(address)) {
        logger.warn(`SSRF Blocked: Resolved to private IP ${address} for URL ${urlStr}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error(`SSRF Validation error for URL ${urlStr}:`, error);
    return false; // Fail safe
  }
};
