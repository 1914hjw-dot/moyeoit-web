import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CreateFeedbackSchema,
  CreateNoticeSchema,
  UpdateNoticeSchema,
  sanitizeFeedbackContent,
} from '../src/lib/validation/feedbackSchemas.ts';
import { isEmailInAdminWhitelist } from '../src/lib/security/adminWhitelist.ts';

test('feedback content sanitization preserves script tags, HTML, URLs and technical logs while stripping control characters', () => {
  const input = '<script>alert("xss")</script> <div>오류</div>: https://moyeoit-web.vercel.app/room/abc-123 TypeError\u0000 at line 42';
  const sanitized = sanitizeFeedbackContent(input);

  assert.equal(sanitized.includes('<script>alert("xss")</script>'), true);
  assert.equal(sanitized.includes('<div>오류</div>'), true);
  assert.equal(sanitized.includes('\u0000'), false);
  assert.equal(sanitized.includes('https://moyeoit-web.vercel.app/room/abc-123'), true);
  assert.equal(sanitized.includes('TypeError at line 42'), true);
});

test('feedback validation accepts valid categories and rejects invalid categories', () => {
  const valid = CreateFeedbackSchema.safeParse({
    category: '오류 신고',
    content: '투표가 제출되지 않습니다.',
  });
  assert.equal(valid.success, true);

  const invalid = CreateFeedbackSchema.safeParse({
    category: '해킹/악성코드',
    content: '투표가 제출되지 않습니다.',
  });
  assert.equal(invalid.success, false);
});

test('feedback validation enforces 2,000 character limit and non-empty content', () => {
  const empty = CreateFeedbackSchema.safeParse({
    category: '기타',
    content: '   ',
  });
  assert.equal(empty.success, false);

  const longContent = 'a'.repeat(2001);
  const exceeded = CreateFeedbackSchema.safeParse({
    category: '기타',
    content: longContent,
  });
  assert.equal(exceeded.success, false);

  const exact2000 = 'a'.repeat(2000);
  const validMax = CreateFeedbackSchema.safeParse({
    category: '기타',
    content: exact2000,
  });
  assert.equal(validMax.success, true);
});

test('feedback email validation accepts valid or empty email and rejects malformed email', () => {
  const withValidEmail = CreateFeedbackSchema.safeParse({
    category: '화면/사용성',
    content: '글씨 크기가 조금 작습니다.',
    reply_email: 'user@example.com',
  });
  assert.equal(withValidEmail.success, true);

  const withEmptyEmail = CreateFeedbackSchema.safeParse({
    category: '화면/사용성',
    content: '글씨 크기가 조금 작습니다.',
    reply_email: '',
  });
  assert.equal(withEmptyEmail.success, true);

  const withInvalidEmail = CreateFeedbackSchema.safeParse({
    category: '화면/사용성',
    content: '글씨 크기가 조금 작습니다.',
    reply_email: 'invalid-email-format',
  });
  assert.equal(withInvalidEmail.success, false);
});

test('notice validation enforces title length, non-empty content and booleans', () => {
  const validNotice = CreateNoticeSchema.safeParse({
    title: '모여잇 9월 업데이트 안내',
    content: '새로운 문의하기 및 공지사항 기능이 추가되었습니다.',
    is_pinned: true,
    is_published: true,
  });
  assert.equal(validNotice.success, true);
  if (validNotice.success) {
    assert.equal(validNotice.data.is_pinned, true);
    assert.equal(validNotice.data.is_published, true);
  }

  const emptyTitleNotice = CreateNoticeSchema.safeParse({
    title: '   ',
    content: '내용입니다.',
  });
  assert.equal(emptyTitleNotice.success, false);

  const tooLongTitle = CreateNoticeSchema.safeParse({
    title: 'x'.repeat(151),
    content: '내용입니다.',
  });
  assert.equal(tooLongTitle.success, false);

  const updateNotice = UpdateNoticeSchema.safeParse({
    is_pinned: false,
  });
  assert.equal(updateNotice.success, true);
});

test('admin whitelist correctly evaluates configured admin emails and strips quotes', () => {
  process.env.ADMIN_EMAILS = ' "admin@moyeoit.com" , \'owner@moyeoit.com\', tech@moyeoit.com ';

  assert.equal(isEmailInAdminWhitelist('admin@moyeoit.com'), true);
  assert.equal(isEmailInAdminWhitelist('ADMIN@moyeoit.com'), true);
  assert.equal(isEmailInAdminWhitelist(' owner@moyeoit.com '), true);
  assert.equal(isEmailInAdminWhitelist('tech@moyeoit.com'), true);
  assert.equal(isEmailInAdminWhitelist('stranger@other.com'), false);
  assert.equal(isEmailInAdminWhitelist(undefined), false);
  assert.equal(isEmailInAdminWhitelist(''), false);
});
