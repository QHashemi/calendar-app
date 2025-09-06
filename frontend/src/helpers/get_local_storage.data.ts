export default  function load_local_storage_data<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (err) {
    console.error("Failed to parse persisted state:", err);
    return defaultValue;
  }
}



