function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function phoneFormat(phone) {
  if (!phone) return '';
  if (phone.indexOf('*') !== -1) return phone;

  phone = phone.replace(/[^0-9]/g, '');
  if (phone.indexOf('02') === 0) {
    if (phone.length > 6) {
      return phone.replace(/(02)(\d{1,4})(\d{4,})/, '$1-$2-$3');
    } else {
      return phone.replace(/(02)(\d{0,})/, '$1-$2');
    }
  } else {
    if (phone.indexOf('1') === 0) {
      return phone.replace(/(\d{4})(\d{1,})/, '$1-$2');
    } else {
      return phone.replace(/(\d{3})(\d{1,4})(\d{4,})/, '$1-$2-$3');
    }
  }
}

// 전화번호 input 실시간 포맷팅 바인딩
function bindPhoneFormat(elementId) {
  document.getElementById(elementId)?.addEventListener('input', function () {
    const raw = this.value.replace(/[^0-9]/g, '').substring(0, 11);
    this.value = phoneFormat(raw);
  });
}

function adjustByUnit(value, unit, mode = "CEIL") {
  switch (mode) {
    case "CEIL":
      return Math.ceil(value / unit) * unit;
    case "TRUNC":
      return Math.floor(value / unit) * unit;
    case "ROUND":
      return Math.round(value / unit) * unit;
    case "HALF_UP":
      const divided = value / unit;
      const floored = Math.floor(divided);
      const fraction = divided - floored;
      if (fraction > 0.5) {
        return (floored + 1) * unit;
      } else if (fraction < 0.5) {
        return floored * unit;
      } else {
        return (floored % 2 === 0 ? floored : floored + 1) * unit;
      }
    default:
      return value;
  }
}

window.VanillaCommon = window.VanillaCommon || {};

window.VanillaCommon.Dom = {
  one(sel, root = document) {
    return root.querySelector(sel);
  },
  all(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  },
  show(selOrEl) {
    const el = typeof selOrEl === "string" ? this.one(selOrEl) : selOrEl;
    if (el) el.style.display = "";
  },
  hide(selOrEl) {
    const el = typeof selOrEl === "string" ? this.one(selOrEl) : selOrEl;
    if (el) el.style.display = "none";
  },
  setValue(selOrEl, value) {
    const el = typeof selOrEl === "string" ? this.one(selOrEl) : selOrEl;
    if (el) el.value = value;
  },
  getValue(selOrEl) {
    const el = typeof selOrEl === "string" ? this.one(selOrEl) : selOrEl;
    return el ? el.value : "";
  },
  setText(selOrEl, text) {
    const el = typeof selOrEl === "string" ? this.one(selOrEl) : selOrEl;
    if (el) el.textContent = text;
  },
  addClassAll(selector, cls) {
    this.all(selector).forEach((el) => el.classList.add(cls));
  },
  removeClassAll(selector, cls) {
    this.all(selector).forEach((el) => el.classList.remove(cls));
  }
};

window.VanillaCommon.Ajax = {
  isAjaxResult(payload) {
    return payload && typeof payload === "object" && ("status" in payload) && ("message" in payload);
  },
  normalizeRedirectLocation(loc, payload = {}) {
    if (!loc || typeof loc !== "string") return loc;

    const isPopup = !!(payload.popup || payload.isPopup);
    if (isPopup && loc.indexOf("/loginPop") === 0 && loc.indexOf("refresh=true") === -1) {
      return loc + (loc.indexOf("?") === -1 ? "?" : "&") + "refresh=true";
    }

    return loc;
  },
  defaultRedirect(loc, payload = {}) {
    const target = this.normalizeRedirectLocation(loc, payload);
    const isPopup = !!(payload.popup || payload.isPopup);

    if (isPopup) {
      window.open(target, "loginPop", "width=1330,height=790");
      return;
    }

    if (location.pathname === "/loginPop") {
      if (location.search.indexOf("refresh=true") !== -1 && window.opener) {
        window.opener.location.reload();
      }
      window.close();
      return;
    }

    location.href = target;
  },
  createHandledNavigationError(payload) {
    const error = new Error("AJAX_REDIRECT_HANDLED");
    error.name = "AjaxRedirectHandledError";
    error.__handledNavigation = true;
    error.payload = payload;
    return error;
  },
  isHandledNavigationError(error) {
    return !!(error && error.__handledNavigation);
  },
  handleAjaxResult(payload, opts = {}) {
    const {
      onMessage = (msg) => {
        if (msg) alert(msg);
      },
      onRedirect = (loc, result) => {
        this.defaultRedirect(loc, result);
      },
      silent = false
    } = opts;

    if (!this.isAjaxResult(payload)) return payload;

    const status = payload.status;
    const message = payload.message;
    const loc = payload.location;

    if (typeof status === "number" && status !== 200) {
      throw new Error(message || "요청 실패");
    }

    if (loc && typeof loc === "string" && loc.trim() !== "" && typeof onRedirect === "function") {
      onRedirect(loc, payload);
      if (!silent && typeof message === "string" && message.trim() !== "") {
        onMessage(message);
      }
      throw this.createHandledNavigationError(payload);
    }

    if (!silent && typeof message === "string" && message.trim() !== "") {
      onMessage(message);
    }

    return payload;
  }
};

window.VanillaCommon.Http = {
  async request(method, url, body, headers = {}, opts = {}) {
    const res = await fetch(url, { method, headers, body, credentials: "same-origin" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : await res.text();

    if (ct.includes("application/json")) {
      return window.VanillaCommon.Ajax.handleAjaxResult(payload, opts);
    }

    return payload;
  },

  async postForm(url, dataObj = {}, opts = {}) {
    const body = new URLSearchParams();
    Object.keys(dataObj).forEach((k) => {
      const v = dataObj[k];
      if (Array.isArray(v)) v.forEach((item) => body.append(k, item));
      else if (v !== undefined && v !== null) body.append(k, v);
    });

    return this.request("POST", url, body.toString(), {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }, opts);
  },

  async postSerialized(url, serializedBody, opts = {}) {
    return this.request("POST", url, serializedBody, {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }, opts);
  },

  async postMultipart(url, formData, opts = {}) {
    return this.request("POST", url, formData, {}, opts);
  },

  serializeForm(formSelOrEl) {
    const form = typeof formSelOrEl === "string"
      ? window.VanillaCommon.Dom.one(formSelOrEl)
      : formSelOrEl;
    return new URLSearchParams(new FormData(form)).toString();
  }
};

window.VanillaCommon.Format = {
  parsePercent(value) {
    if (value == null) return 0;
    const num = String(value).replace(/[%\s,]/g, "");
    const parsed = Number(num);
    return Number.isFinite(parsed) ? parsed / 100 : 0;
  },
  parseNumber(value) {
    if (value == null) return 0;
    const num = String(value).replace(/[,\s]/g, "");
    const parsed = Number(num);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  formatPercent(value, digits = 3) {
    if (!Number.isFinite(value)) return "0%";
    return (value * 100).toFixed(digits) + "%";
  },
  formatMoney(value) {
    const num = Math.round(Number(value) || 0);
    return num.toLocaleString();
  }
};

window.VanillaCommon.UI = {
  toggleButton(activeBtn) {
    const group = activeBtn.dataset.btn;
    document.querySelectorAll(`[data-btn="${group}"]`).forEach((btn) => {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline");
    });
    activeBtn.classList.remove("btn-outline");
    activeBtn.classList.add("btn-primary");
  }
};
