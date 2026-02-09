import api from '@/lib/api';

const GITHUB_REPO = 'https://github.com/ArthurEffa/THEZ-GESTION-SOUTENANCE.git';

class AnalyticsService {
  async trackEvent(eventType: 'REPO_CLICK' | 'PAGE_VIEW'): Promise<void> {
    try {
      await api.post('/analytics/track/', { event_type: eventType });
    } catch {
      // Silencieux — le tracking ne doit jamais bloquer l'UX
    }
  }

  async getStats(): Promise<{ repo_clicks: number; page_views: number }> {
    const response = await api.get('/analytics/stats/');
    return response.data;
  }

  trackRepoClick(): void {
    this.trackEvent('REPO_CLICK');
    window.open(GITHUB_REPO, '_blank', 'noopener');
  }

  trackPageView(): void {
    const key = 'thez_pv_' + new Date().toISOString().slice(0, 10);
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      this.trackEvent('PAGE_VIEW');
    }
  }
}

export const GITHUB_REPO_URL = GITHUB_REPO;
export default new AnalyticsService();
