// IKENGA™ FORTRESS — CLIENT-SIDE PROTECTION
// ALL RIGHTS RESERVED. UNAUTHORIZED REPRODUCTION IS PROHIBITED UNDER UK LAWS
// UJU GROUP LIMITED — ujugrouplimited@gmail.com

(function IkengaFortress() {
  const IKENGA_LEGAL = "IKENGA™ — ALL RIGHTS RESERVED. UNAUTHORIZED REPRODUCTION, REVERSE ENGINEERING OR PROBING IS PROHIBITED UNDER UK LAWS. UJU CYCLE™ is a proprietary trade secret. UJU GROUP LIMITED.";

  // 1. PREVENT MODEL EXTRACTION ATTEMPTS
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin, transfer) {
    if (message && typeof message === 'object') {
      if (message.type === 'EXTRACT_MODEL' || message.action === 'SAVE_WEIGHTS') {
        console.error(`[IKENGA FORTRESS] ${IKENGA_LEGAL}`);
        throw new Error('Model extraction prohibited. This is a trade secret protected under UK law.');
      }
    }
    return originalPostMessage.call(this, message, targetOrigin, transfer);
  };

  // 2. OBFUSCATE IKENGA API CALLS
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string') {
      // Block direct API inspection
      if ((url.includes('/api/ikenga/') || url.includes('/api/ujucycle/')) && url.includes('?debug=true')) {
        console.error(`[IKENGA FORTRESS] Debug probing blocked. ${IKENGA_LEGAL}`);
        return Promise.reject(new Error('API probing blocked. Protected trade secret.'));
      }

      // Obfuscate request/response for IKENGA endpoints
      if (url.includes('/api/ikenga/generate') || url.includes('/api/ujucycle/process')) {
        const options = args[1] || {};
        const originalBody = options.body;

        if (originalBody && typeof originalBody === 'string') {
          try {
            const parsed = JSON.parse(originalBody);
            // Add invisible fingerprint to each request
            const fingerprinted = {
              ...parsed,
              _fp: btoa(JSON.stringify({
                ts: Date.now(),
                r: crypto.randomUUID(),
                legal: "ALL RIGHTS RESERVED"
              }))
            };
            options.body = JSON.stringify(fingerprinted);
            args[1] = options;
          } catch(e) {}
        }
      }
    }
    return originalFetch.apply(this, args);
  };

  // 3. PREVENT UJU CYCLE™ LOGIC INSPECTION
  const originalToString = Function.prototype.toString;
  Function.prototype.toString = function() {
    if (this.name === 'UJUCycle' || this.name === 'IkengaEngine' ||
        (this.toString && this.toString().includes('UJU CYCLE')) || this.toString().includes('proprietary')) {
      return 'function () { [protected trade secret - UJU GROUP LIMITED] }';
    }
    return originalToString.call(this);
  };

  // 4. DETECT AND BLOCK DEVTOOLS (IKENGA-specific)
  let devToolsOpen = false;
  setInterval(() => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 150) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.log(`%c${IKENGA_LEGAL}`, 'color: #D4AF37; font-size: 14px; font-weight: bold;');
        console.log('%cUJU CYCLE™ is a proprietary trade secret. Reverse engineering is a criminal offence under the Computer Misuse Act 1990.', 'color: #ff6b6b;');
      }
    } else {
      devToolsOpen = false;
    }
  }, 2000);

  // 5. PREVENT SELECTION/COPYING OF IKENGA CONTENT
  document.addEventListener('copy', (e) => {
    if (e.target.closest('.ikenga-generated') || e.target.closest('.uju-cycle-output')) {
      e.preventDefault();
      alert(`⚠️ ${IKENGA_LEGAL}\n\nThis content is protected. Unauthorised copying is prohibited.`);
      return false;
    }
  });

  // 6. WATERMARK ALL GENERATED CONTENT
  const watermarkOutputs = () => {
    const outputs = document.querySelectorAll('.ikenga-generated, .uju-cycle-output, .ai-response');
    outputs.forEach(output => {
      if (!output.hasAttribute('data-watermarked')) {
        const watermark = document.createElement('div');
        watermark.style.fontSize = '6px';
        watermark.style.color = 'rgba(212,175,55,0.2)';
        watermark.style.textAlign = 'center';
        watermark.style.marginTop = '4px';
        watermark.innerHTML = '© UJU GROUP LIMITED — IKENGA™ — ALL RIGHTS RESERVED';
        output.appendChild(watermark);
        output.setAttribute('data-watermarked', 'true');
      }
    });
  };

  // Run watermarking every 2 seconds
  setInterval(watermarkOutputs, 2000);

  // 7. LOG ALL SUSPICIOUS ACTIVITY
  window.addEventListener('error', (e) => {
    if (e.message.includes('debugger') || e.message.includes('inspector')) {
      navigator.sendBeacon('/api/ikenga/fortress-log', JSON.stringify({
        type: 'DEVTOOLS_DETECTED',
        message: e.message,
        timestamp: Date.now(),
        legal: 'Computer Misuse Act 1990'
      }));
    }
  });

  console.log(`[IKENGA FORTRESS] Active. ${IKENGA_LEGAL}`);
})();
