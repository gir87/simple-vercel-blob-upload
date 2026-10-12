import { Suspense } from 'react';
import BlobList from '@/app/_components/blob-list';
import UploadForm from '@/app/_components/upload-form';

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-lg flex flex-col gap-6 px-6 py-12">
      <UploadForm />
      <Suspense fallback={<BlobListSkeleton />}>
        <BlobList />
      </Suspense>
    </main>
  );
}

function BlobListSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Stored files
        </h2>
      </div>
      <ul className="grid grid-cols-3 gap-3 px-6 pb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex flex-col gap-1">
            <div className="aspect-square animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </li>
        ))}
      </ul>
    </div>
  );
}
