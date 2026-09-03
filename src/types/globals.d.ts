declare module 'lucide-react';

interface KakaoShareApi {
  sendDefault(options: Record<string, unknown>): void;
}

interface KakaoSdk {
  Share?: KakaoShareApi;
}

interface Window {
  Kakao?: KakaoSdk;
  adsbygoogle?: Array<Record<string, unknown>>;
}
