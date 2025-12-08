import {withSentryConfig} from "@sentry/nextjs";
// next.config.ts
import type { NextConfig } from "next";
// CJS 모듈이므로 타입 경고를 피하기 위해 any 캐스팅
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = (bundleAnalyzer as any)({
  enabled: process.env.ANALYZE === "true", // ANALYZE=true 일 때만 활성화
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  /* config options here */
  experimental: {
    proxyClientMaxBodySize: '50mb',
  },
  typescript: {
    // !! WARN !!
    // 타입 에러가 있어도 프로덕션 빌드 강행
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Supabase Storage 공개 URL
      {
        protocol: "https",
        hostname: "pijtsbicrnsbdaewosgt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // 예시 이미지 도메인
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
    ],
  },
};

// export default withBundleAnalyzer(nextConfig);

// sentry 임시 끄기
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "chilgok",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true
});