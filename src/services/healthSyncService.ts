export interface HealthSample {
  type: 'period' | 'symptom' | 'prediction';
  value: string;
  startDate: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

class HealthSyncService {
  private isIOS(): boolean {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // Account for iOS 13+ 
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  }

  /**
   * Request permissions and sync data
   */
  async requestSync(): Promise<{ success: boolean; platform: string; samples?: HealthSample[] }> {
    console.log("[HEALTH] Requesting Sync Permissions...");
    
    // Simulate iOS permission request delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (this.isIOS()) {
      // In a real Capacitor/Native environment, you would call:
      // const res = await nativeBridge.requestHealthKitPermissions(['MenstrualFlow', 'Symptoms']);
      
      // FOR DEMO: Simulate successful HealthKit sync
      const mockSamples: HealthSample[] = [
        { type: 'period', value: 'medium', startDate: '2026-04-10', endDate: '2026-04-15' },
        { type: 'symptom', value: 'cramps', startDate: '2026-04-11' }
      ];

      return { success: true, platform: 'ios', samples: mockSamples };
    }

    // Default to Web/Google Fit style mock
    return { success: true, platform: 'web', samples: [] };
  }

  async uploadSyncData(platform: string, samples: HealthSample[]) {
    const token = localStorage.getItem('lumina_token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/sync-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platform, samples })
      });
      return await response.json();
    } catch (err) {
      console.error("[HEALTH] Upload failed:", err);
      throw err;
    }
  }
}

export const healthSyncService = new HealthSyncService();
