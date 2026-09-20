import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  FeedbackCategory,
  FeedbackStatus,
} from '@/lib/validation/feedbackSchemas';

export { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES };
export type { FeedbackCategory, FeedbackStatus };

export interface Feedback {
  id: string;
  category: FeedbackCategory;
  content: string;
  reply_email?: string | null;
  page_path?: string | null;
  user_agent?: string | null;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackInput {
  category: FeedbackCategory;
  content: string;
  reply_email?: string;
  page_path?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  is_pinned?: boolean;
  is_published?: boolean;
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_published?: boolean;
}
