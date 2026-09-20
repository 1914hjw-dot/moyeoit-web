import 'server-only';

import { supabaseServer } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';
import { Feedback, FeedbackCategory, FeedbackStatus } from '@/types/feedback';
import { CreateFeedbackSchema, FeedbackStatusSchema } from '@/lib/validation/feedbackSchemas';

function mapFeedbackRecord(data: Record<string, unknown>): Feedback {
  return {
    id: String(data.id),
    category: data.category as FeedbackCategory,
    content: String(data.content || ''),
    reply_email: typeof data.reply_email === 'string' ? data.reply_email : null,
    page_path: typeof data.page_path === 'string' ? data.page_path : null,
    user_agent: typeof data.user_agent === 'string' ? data.user_agent : null,
    status: (data.status as FeedbackStatus) || 'NEW',
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || ''),
  };
}

export async function submitFeedback(
  input: unknown,
  userAgent?: string
): Promise<Feedback> {
  const validated = CreateFeedbackSchema.parse(input);

  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const { data, error } = await supabaseServer
    .from('feedbacks')
    .insert({
      category: validated.category,
      content: validated.content,
      reply_email: validated.reply_email || null,
      page_path: validated.page_path || null,
      user_agent: userAgent ? userAgent.slice(0, 500) : null,
      status: 'NEW',
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Feedback insertion error:', error);
    throw new AppError('문의 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.', 500, 'DB_ERROR');
  }

  return mapFeedbackRecord(data);
}

export interface GetAdminFeedbacksFilter {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getAdminFeedbacks(
  filter?: GetAdminFeedbacksFilter
): Promise<{ feedbacks: Feedback[]; totalCount: number }> {
  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  const page = Math.max(1, filter?.page || 1);
  const limit = Math.min(100, Math.max(1, filter?.limit || 30));
  const offset = (page - 1) * limit;

  let query = supabaseServer
    .from('feedbacks')
    .select('*', { count: 'exact' });

  if (filter?.status && filter.status !== 'ALL') {
    query = query.eq('status', filter.status);
  }

  if (filter?.category && filter.category !== 'ALL') {
    query = query.eq('category', filter.category);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Feedback query error:', error);
    throw new AppError('문의 목록을 불러오는 중 오류가 발생했습니다.', 500, 'DB_ERROR');
  }

  return {
    feedbacks: (data || []).map(mapFeedbackRecord),
    totalCount: count || 0,
  };
}

export async function updateFeedbackStatus(
  id: string,
  statusInput: unknown
): Promise<Feedback> {
  const status = FeedbackStatusSchema.parse(statusInput);

  if (!supabaseServer) {
    throw new AppError('데이터베이스 서비스를 이용할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
  }

  // updated_at is handled by the database trigger (single source of truth)
  const { data, error } = await supabaseServer
    .from('feedbacks')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Feedback status update error:', error);
    throw new AppError('문의 상태 변경에 실패했습니다.', 500, 'DB_ERROR');
  }

  return mapFeedbackRecord(data);
}
