'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done'; url: string; pathname: string }
  | { status: 'error'; message: string };

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setState({ status: 'uploading', progress: 0 });

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: true,
        onUploadProgress: ({ percentage }) =>
          setState({ status: 'uploading', progress: Math.round(percentage) }),
      });

      setState({ status: 'done', url: blob.url, pathname: blob.pathname });
      router.refresh();
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Upload failed.',
      });
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setState({ status: 'idle' });
    setCopied(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        File Upload
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Upload any file — get a shareable link instantly.
      </p>

      <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500 dark:hover:bg-zinc-700">
        <svg
          className="mb-3 h-8 w-8 text-zinc-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {inputRef.current?.files?.[0]?.name ?? 'Click to choose a file'}
        </span>
        <span className="mt-1 text-xs text-zinc-400">Any file type · Any size</span>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={() => setState({ status: 'idle' })}
          disabled={state.status === 'uploading'}
        />
      </label>

      {state.status !== 'done' && (
        <button
          onClick={handleSubmit}
          disabled={state.status === 'uploading'}
          className="mt-2 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {state.status === 'uploading' ? 'Uploading…' : 'Upload'}
        </button>
      )}

      {state.status === 'uploading' && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>Uploading</span>
            <span>{state.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-200 dark:bg-zinc-100"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.status === 'done' && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
            Upload complete
          </p>
          <p className="mb-3 break-all font-mono text-sm text-zinc-800 dark:text-zinc-200">
            {window.location.origin}/file/{state.pathname.split('/').map(encodeURIComponent).join('/')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => state.status === 'done' && copyUrl(`${window.location.origin}/file/${state.pathname.split('/').map(encodeURIComponent).join('/')}`)}
              className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button
              onClick={reset}
              className="flex-1 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Upload another
            </button>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">{state.message}</p>
          <button
            onClick={reset}
            className="mt-2 text-xs font-medium text-red-600 underline dark:text-red-400"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
