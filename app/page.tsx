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
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-6 py-3">
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-6 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </li>
        ))}
      </ul>
    </div>
  );
}
