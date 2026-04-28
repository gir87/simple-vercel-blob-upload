import BlobList from '@/app/_components/blob-list';
import UploadForm from '@/app/_components/upload-form';

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-lg flex flex-col gap-6 px-6 py-12">
      <UploadForm />
      <BlobList />
    </main>
  );
}
