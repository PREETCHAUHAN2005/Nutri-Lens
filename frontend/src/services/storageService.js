class StorageService {
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  // Cache analysis results to save API calls
  saveAnalysis(id, data) {
    try {
      const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
      cache[id] = { data, timestamp: Date.now() };
      localStorage.setItem('analysis_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  getAnalysis(id) {
    try {
      const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
      const item = cache[id];
      // Valid for 1 hour
      if (item && Date.now() - item.timestamp < 3600000) {
        return item.data;
      }
      return null;
    } catch (err) {
        console.error("Failed to retrieve analysis from cache", err);
      return null;

    }
  }
}

export default new StorageService();