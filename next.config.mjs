const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const remotePatterns = [];
const allowedSupabaseHosts = new Set(["orgjknzfzvvgfgvdkadq.supabase.co"]);

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    allowedSupabaseHosts.add(url.hostname);
  } catch {
    // Ignore malformed env values and keep local images working
  }
}

for (const hostname of allowedSupabaseHosts) {
  remotePatterns.push({
    protocol: "https",
    hostname,
    pathname: "/storage/v1/object/public/**",
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  images: {
    remotePatterns,
  },
};
export default nextConfig;
