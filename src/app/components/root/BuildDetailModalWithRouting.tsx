'use client';

import { useRouter } from 'next/navigation';
import BuildDetailModalClient from './BuildDetailModal';
import { IBuild } from '@/app/interface/build';

export default function BuildDetailModalWithRouting({ build }: { build: IBuild }) {
  const router = useRouter();
  const onClose = () => router.back();

  return <BuildDetailModalClient build={build} onClose={onClose} />;
}
