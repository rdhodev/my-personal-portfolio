import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from('profile')
      .select('resume_url')
      .limit(1)
      .single();

    if (error || !profile?.resume_url) {
      return NextResponse.json({ error: 'CV belum diunggah.' }, { status: 404 });
    }

    const response = await fetch(profile.resume_url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Gagal mengunduh file CV.' }, { status: response.status });
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="CV_Ridho_Hidayat.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
