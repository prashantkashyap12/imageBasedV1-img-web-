const os = require("os");

exports.getAllServerIPs = (req, res) => {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];

  Object.values(interfaces).forEach((iface) => {
    iface.forEach((entry) => {
      if (!entry.internal && entry.family === "IPv4") {
        ipAddresses.push(entry.address);
      }
    });
  });
  return res.json({ success: true, ipAddresses });
};
