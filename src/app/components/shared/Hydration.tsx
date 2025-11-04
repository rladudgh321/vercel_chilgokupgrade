"use client";

import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

interface HydrationProps {
  children: React.ReactNode;
  state: ReturnType<typeof dehydrate>;
}

const Hydration = ({ children, state }: HydrationProps) => {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
};

export default Hydration;
