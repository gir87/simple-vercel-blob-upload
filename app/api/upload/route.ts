import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: false,
      }),
      onUploadCompleted: async ({ blob }) => {
        // Only fires in production (Vercel must reach this URL).
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload token exchange failed:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 400 },
    );
  }
}
