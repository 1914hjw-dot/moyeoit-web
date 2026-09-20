import 'server-only';

import { supabaseServer } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';
import { Notice } from '@/types/feedback';
import { CreateNoticeSchema, UpdateNoticeSchema } from '@/lib/validation/feedbackSchemas';

function mapNoticeRecord(data: Record<string, unknown>): Notice {
  return {
    id: String(data.id),
    title: String(data.title || ''),
    content: String(data.content || ''),
    is_pinned: Boolean(data.is_pinned),
    is_published: Boolean(data.is_published),
    published_at: typeof data.published_at === 'string' ? data.published_at : null,
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || ''),
  };
}

/**
 * Public: Retrieve all published notices sorted by pinned status and published date.
 */
export async function getPublishedNotices(): Promise<Notice[]> {
  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const { data, error } = await supabaseServer
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Published notices fetch error:', error);
    throw new AppError('공지사항을 불러오는 중 오류가 발생했습니다.', 500, 'DB_ERROR');
  }

  return (data || []).map(mapNoticeRecord);
}

/**
 * Public: Retrieve a single published notice by ID.
 * Returns null if the notice does not exist or is not published.
 */
export async function getPublishedNoticeById(id: string): Promise<Notice | null> {
  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const { data, error } = await supabaseServer
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('Notice fetch error:', error);
    throw new AppError('공지사항을 불러올 수 없습니다.', 500, 'DB_ERROR');
  }

  return data ? mapNoticeRecord(data) : null;
}

/**
 * Home banner: Retrieve the single latest pinned & published notice.
 * Returns null if no pinned notice is published.
 */
export async function getLatestPinnedNotice(): Promise<Notice | null> {
  if (!supabaseServer) {
    return null;
  }

  try {
    const { data, error } = await supabaseServer
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .eq('is_pinned', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapNoticeRecord(data);
  } catch (err) {
    console.warn('Pinned notice fetch failed gracefully:', err);
    return null;
  }
}

/**
 * Admin: Retrieve all notices (including drafts and unpublished).
 */
export async function getAdminNotices(): Promise<Notice[]> {
  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const { data, error } = await supabaseServer
    .from('notices')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin notices query error:', error);
    throw new AppError('공지사항 목록을 불러올 수 없습니다.', 500, 'DB_ERROR');
  }

  return (data || []).map(mapNoticeRecord);
}

/**
 * Admin: Create a new notice.
 * Lifecycle rule: if is_published=true, published_at is set to current time. Otherwise null.
 */
export async function createNotice(input: unknown): Promise<Notice> {
  const validated = CreateNoticeSchema.parse(input);

  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const isPublished = Boolean(validated.is_published);
  const publishedAt = isPublished ? new Date().toISOString() : null;

  const { data, error } = await supabaseServer
    .from('notices')
    .insert({
      title: validated.title,
      content: validated.content,
      is_pinned: Boolean(validated.is_pinned),
      is_published: isPublished,
      published_at: publishedAt,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Notice creation error:', error);
    throw new AppError('공지사항 생성에 실패했습니다.', 500, 'DB_ERROR');
  }

  return mapNoticeRecord(data);
}

/**
 * Admin: Update an existing notice.
 * Lifecycle rules:
 * - False -> True transition: sets published_at to current time if previously null.
 * - True -> False: keeps existing published_at.
 * - Editing already published notice: keeps existing published_at.
 * - updated_at is handled by DB trigger (single source of truth).
 */
export async function updateNotice(id: string, input: unknown): Promise<Notice> {
  const validated = UpdateNoticeSchema.parse(input);

  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  // Fetch current notice to check publication state
  const { data: existing, error: fetchError } = await supabaseServer
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new AppError('수정할 공지사항을 찾을 수 없습니다.', 404, 'NOT_FOUND');
  }

  const updates: Record<string, unknown> = {};

  if (validated.title !== undefined) updates.title = validated.title;
  if (validated.content !== undefined) updates.content = validated.content;
  if (validated.is_pinned !== undefined) updates.is_pinned = validated.is_pinned;

  if (validated.is_published !== undefined) {
    updates.is_published = validated.is_published;
    // Initial false -> true: set published_at to NOW() if not already set
    if (validated.is_published && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabaseServer
    .from('notices')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Notice update error:', error);
    throw new AppError('공지사항 수정에 실패했습니다.', 500, 'DB_ERROR');
  }

  return mapNoticeRecord(data);
}

/**
 * Admin: Delete a notice by ID.
 */
export async function deleteNotice(id: string): Promise<void> {
  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const { error } = await supabaseServer
    .from('notices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Notice deletion error:', error);
    throw new AppError('공지사항 삭제에 실패했습니다.', 500, 'DB_ERROR');
  }
}
