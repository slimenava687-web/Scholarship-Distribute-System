export function setButtonLoading(button, loading, loadingText = 'Đang xử lý...') {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="button-spinner" aria-hidden="true"></span>${loadingText}`;
    return;
  }

  button.disabled = false;
  button.innerHTML = button.dataset.originalText || button.innerHTML;
}

export function showLoading(element, message = 'Đang tải dữ liệu...') {
  element.innerHTML = `<div class="loading-state" role="status">${message}</div>`;
}

export function showEmpty(element, message, colspan = 1) {
  element.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
}
