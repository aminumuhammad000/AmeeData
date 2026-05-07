// scripts/update-env.js
import fs from "fs";
import { internalIpV4 } from "internal-ip";

const updateEnv = async () => {
  const ip = await internalIpV4();
  const apiUrl = `http://${ip}:5000`; // your backend port

  let envContent = `EXPO_PUBLIC_API_URL=${apiUrl}\n`;

  fs.writeFileSync(".env", envContent);

  console.log(`✅ Updated .env with local IP: ${apiUrl}`);
};

updateEnv();
