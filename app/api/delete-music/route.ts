import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
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

  const { data: { session } } = await supabase.auth.getSession();
  const storageClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${session!.access_token}` } } }
  );

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Music ID required' }, { status: 400 });

  // 본인 소유 레코드 확인 + file_path 가져오기
  const { data: music, error: fetchError } = await supabase
    .from('musics')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !music) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // 스토리지 파일 삭제
  if (music.file_path) {
    await storageClient.storage.from('musics').remove([music.file_path]);
  }

  // DB 레코드 삭제
  const { error: deleteError } = await supabase
    .from('musics')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
