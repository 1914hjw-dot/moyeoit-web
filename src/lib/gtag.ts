declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    try {
      window.gtag('event', eventName, params);
    } catch (e) {
      console.error('GA4 Event Error:', e);
    }
  }
};

export const trackRoomCreateStart = (selectionMode: string) => {
  trackEvent('room_create_start', { selection_mode: selectionMode });
};

export const trackRoomCreated = (selectionMode: string) => {
  trackEvent('room_created', { selection_mode: selectionMode });
};

export const trackRoomShare = (method: string) => {
  trackEvent('room_share', { method });
};

export const trackRoomJoin = (selectionMode: string, roomStatus: string) => {
  trackEvent('room_join', { selection_mode: selectionMode, room_status: roomStatus });
};

export const trackVoteSubmit = (selectionMode: string, selectedDateCount: number) => {
  trackEvent('vote_submit', { selection_mode: selectionMode, selected_date_count: selectedDateCount });
};

export const trackRoomConfirmed = (selectionMode: string) => {
  trackEvent('room_confirmed', { selection_mode: selectionMode });
};
