import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  // 1. 세션 쿠키로 서버 클라이언트 생성 (DB 조작용)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // access_token 추출 → 스토리지 업로드용 클라이언트
  const { data: { session } } = await supabase.auth.getSession();
  const storageClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${session!.access_token}` } } }
  );

  const { prompt, duration = 60, outputFormat = 'mp3' } = await request.json();
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  const safeFormat: 'wav' | 'mp3' = outputFormat === 'wav' ? 'wav' : 'mp3';
  const safeDuration: number = [60, 120, 180].includes(Number(duration)) ? Number(duration) : 60;

  // 2. musics 테이블에 레코드 생성 (status: generating)
  const { data: music, error: insertError } = await supabase
    .from('musics')
    .insert({ user_id: user.id, prompt: prompt.trim(), status: 'generating' })
    .select()
    .single();

  if (insertError || !music) {
    return NextResponse.json({ error: 'Failed to create record', detail: insertError?.message }, { status: 500 });
  }

  try {
    // 3. Replicate MusicGen 호출
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const output = await replicate.run(
      'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
      {
        input: {
          prompt: prompt.trim(),
          model_version: 'stereo-large',
          output_format: safeFormat,
          normalization_strategy: 'peak',
          duration: safeDuration,
        },
      }
    );

    // 4. Replicate 출력 URL 추출
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const replicateUrl: string = typeof (output as any)?.url === 'function'
      ? String((output as any).url())
      : String(output);

    if (!replicateUrl.startsWith('http')) {
      throw new Error(`Unexpected Replicate output: ${replicateUrl}`);
    }

    // 5. 오디오 파일 다운로드
    const audioRes = await fetch(replicateUrl);
    if (!audioRes.ok) throw new Error(`Failed to fetch audio: ${audioRes.status}`);
    const audioBuffer = await audioRes.arrayBuffer();

    // 6. Supabase Storage 업로드 ({user_id}/{music_id}.{ext})
    const filePath = `${user.id}/${music.id}.${safeFormat}`;
    const contentType = safeFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    const { error: uploadError } = await storageClient.storage
      .from('musics')
      .upload(filePath, audioBuffer, { contentType, upsert: true });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // 7. Signed URL 발급 (24시간)
    const { data: signedData, error: signedError } = await storageClient.storage
      .from('musics')
      .createSignedUrl(filePath, 60 * 60 * 24);

    if (signedError || !signedData) throw new Error(`Signed URL failed: ${signedError?.message}`);

    // 8. musics 테이블 completed 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('musics')
      .update({
        status: 'completed',
        file_path: filePath,
        file_url: signedData.signedUrl,
        duration: safeDuration,
      })
      .eq('id', music.id)
      .select()
      .single();

    if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

    return NextResponse.json({ music: updated });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await supabase
      .from('musics')
      .update({ status: 'failed', error_message: errMsg })
      .eq('id', music.id);

    return NextResponse.json({ error: 'Music generation failed', detail: errMsg }, { status: 500 });
  }
}
