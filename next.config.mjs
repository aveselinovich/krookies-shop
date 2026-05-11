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
  images: {
    remotePatterns,
  },
};
export default nextConfig;
