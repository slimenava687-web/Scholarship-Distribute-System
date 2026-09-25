export function setButtonLoading(button, loading, loadingText = 'Đang xử lý...') {
  if (!button) return;

  if (loading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }
    button.disabled = true;
    button.innerHTML = `<span class="button-spinner" aria-hidden="true"></span>${loadingText}`;
    return;
  }

  button.disabled = false;
  if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

export function showLoading(element, message = 'Đang tải dữ liệu...') {
  if (!element) return;
  element.innerHTML = `<div class="loading-state" role="status">${message}</div>`;
}

export function showSkeletonCards(element, count = 3) {
  if (!element) return;
  const cardsHtml = Array.from({ length: count }).map(() => `
    <article class="skeleton-card" aria-hidden="true">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="skeleton-shimmer skeleton-pill" style="width:36%;"></div>
        <div class="skeleton-shimmer skeleton-pill" style="width:28%;"></div>
      </div>
      <div class="skeleton-shimmer skeleton-title" style="margin:16px 0 10px;"></div>
      <div class="skeleton-shimmer skeleton-row" style="width:85%;margin-bottom:6px;"></div>
      <div class="skeleton-shimmer skeleton-row" style="width:65%;margin-bottom:10px;"></div>
      <div class="skeleton-shimmer skeleton-bar"></div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <div class="skeleton-shimmer skeleton-pill" style="width:32%;"></div>
        <div class="skeleton-shimmer skeleton-pill" style="width:24%;"></div>
      </div>
    </article>
  `).join('');
  element.innerHTML = cardsHtml;
}

export function showEmpty(element, message, colspan = 1) {
  if (!element) return;
  element.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
}

/**
 * Display a modern Web3 glassmorphic confirmation modal.
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export function showConfirmModal({
  icon = '💰',
  type = 'disburse',
  title = 'Xác nhận giao dịch',
  subtitle = '',
  amount = null,
  fiatAmount = null,
  details = [],
  warning = '',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ'
} = {}) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    let amountHtml = '';
    if (amount) {
      amountHtml = `
        <div class="modal-amount-box">
          <div class="modal-amount-label">SỐ TIỀN GIẢI NGÂN</div>
          <div class="modal-amount-value">${amount}</div>
          ${fiatAmount ? `<div class="modal-amount-fiat">≈ ${fiatAmount}</div>` : ''}
        </div>
      `;
    }

    let detailsHtml = '';
    if (details && details.length > 0) {
      detailsHtml = `
        <div class="modal-details">
          ${details.map((d) => `
            <div class="modal-detail-row">
              <span class="modal-detail-label">${d.label}</span>
              <span class="modal-detail-value ${d.isMono ? 'mono' : ''}">${d.value}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    let warningHtml = '';
    if (warning) {
      const isDanger = type === 'danger';
      warningHtml = `
        <div class="modal-warning-box ${isDanger ? 'is-danger' : ''}">
          <span class="modal-warning-icon">${isDanger ? '🚨' : '⚠️'}</span>
          <span>${warning}</span>
        </div>
      `;
    }

    const isDangerConfirm = type === 'danger';

    backdrop.innerHTML = `
      <div class="modal-card">
        <button class="modal-close-btn" type="button" aria-label="Đóng">&times;</button>
        <div class="modal-header">
          <div class="modal-icon-badge type-${type}">${icon}</div>
          <div class="modal-title-group">
            <h3>${title}</h3>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
          </div>
        </div>
        ${amountHtml}
        ${detailsHtml}
        ${warningHtml}
        <div class="modal-actions">
          <button class="button modal-btn-cancel" type="button">${cancelText}</button>
          <button class="button modal-btn-confirm ${isDangerConfirm ? 'is-danger' : ''}" type="button">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
      backdrop.classList.add('is-active');
    });

    const cleanup = (result) => {
      backdrop.classList.remove('is-active');
      document.removeEventListener('keydown', handleKey);
      setTimeout(() => backdrop.remove(), 260);
      resolve(result);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
    };

    document.addEventListener('keydown', handleKey);

    backdrop.querySelector('.modal-close-btn').addEventListener('click', () => cleanup(false));
    backdrop.querySelector('.modal-btn-cancel').addEventListener('click', () => cleanup(false));
    backdrop.querySelector('.modal-btn-confirm').addEventListener('click', () => cleanup(true));

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(false);
    });
  });
}

