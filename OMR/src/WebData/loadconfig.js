const config = {};

export const loadConfig = async () => {
  try {
    const response = await fetch("/config.json");
    const data = await response.json();
    Object.assign(config, data); // Store config globally
  } catch (error) {
    console.error("Error loading config:", error);
  }
};

export const getConfig = (key) => config[key];
