async function generateStableSystemFingerprint() {
  const cpuCores = navigator.hardwareConcurrency || 'Not Available';
  const ram = navigator.deviceMemory || 'Not Available';

  const rawString = `${cpuCores}|${ram}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export { generateStableSystemFingerprint };