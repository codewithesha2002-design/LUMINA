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
    // Since authentication is removed, we bypass the API and sync specifically to localStorage
    const savedUser = localStorage.getItem('lumina_user');
    if (!savedUser) return { success: false, error: 'No user identified' };

    try {
      const user = JSON.parse(savedUser);
      
      // Update health sync metadata locally
      user.healthSync = {
        enabled: true,
        lastSync: new Date().toISOString(),
        platform: platform || 'web'
      };

      localStorage.setItem('lumina_user', JSON.stringify(user));
      
      // In a real local-first app, you'd also save the 'samples' to a local DB like IndexedDB
      console.log(`[HEALTH] Local Sync complete. Received ${samples?.length || 0} items.`);
      
      return { success: true, user };
    } catch (err) {
      console.error("[HEALTH] Local sync failed:", err);
      throw err;
    }
  }
}

export const healthSyncService = new HealthSyncService();
