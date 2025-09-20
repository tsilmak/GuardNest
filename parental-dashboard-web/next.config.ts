import { type NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Production-only optimizations
  ...(process.env.NODE_ENV === "production" && {
    webpack: (config) => {
      config.externals = [...(config.externals || []), "next-devtools"];
      return config;
    },
  }),

  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
  },

  // Enable compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: (() => {
              const isDev = process.env.NODE_ENV !== "production";
              const scriptSrcParts = [
                "'self'",
                "'unsafe-inline'",
                ...(isDev ? ["'unsafe-eval'"] : []),
              ];
              const goApiOrigin = process.env.NEXT_PUBLIC_GO_API_URL;
              const connectSrcParts = ["'self'", goApiOrigin];

              return [
                "default-src 'self'", // Only allow resources from same origin by default
                `script-src ${scriptSrcParts.join(" ")}`,
                "style-src 'self' 'unsafe-inline'", // Allow styles from same origin and inline styles
                "img-src 'self' data: https:", // Allow images from same origin, data URIs, and HTTPS sources
                "font-src 'self'", // Only allow fonts from same origin
                "object-src 'none'", // Block plugins like Flash, Java applets - prevents clickjacking
                "media-src 'self'", // Only allow media from same origin
                `connect-src ${connectSrcParts.join(" ")}`,
                "frame-src 'none'", // Block all iframes (prevents clickjacking)
                "frame-ancestors 'none'", // Block embedding in iframes (prevents clickjacking)
                "base-uri 'self'", // Only allow base URI from same origin (prevents base tag hijacking)
                "form-action 'self'", // Only allow form submissions to same origin
                "upgrade-insecure-requests", // Automatically upgrade HTTP to HTTPS
                "block-all-mixed-content", // Block mixed content (HTTP resources on HTTPS page)
              ].join("; ");
            })(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevents clickjacking by blocking all iframe embedding
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevents MIME type sniffing attacks
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // Enables XSS protection and blocks the page if attack detected
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off", // Disables DNS prefetching to prevent privacy leaks
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Limits referrer information to prevent data leakage
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()", // Disables sensitive browser features
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp", // Enforces cross-origin isolation for better security
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin", // Prevents cross-origin window access
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin", // Prevents cross-origin resource access
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload", // Forces HTTPS for 1 year
          },
        ],
      },
    ];
  },
};

export default config;
