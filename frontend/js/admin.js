import { api, getEthExchangeRate, getSelectedCurrency } from './api.js';
import { authState, escapeHtml, notify, shortenAddress } from './auth.js';
import { setButtonLoading, showEmpty } from './ui.js';

const $ = (id) => document.getElementById(id);
const status = (value) => `<span class="status-pill status-${value}">${value}</span>`;
const formatFiat = (eth, rate) => { const currency = getSelectedCurrency(); return `${(Number(eth || 0) * rate[currency.toLowerCase()]).toLocaleString(currency === 'USD' ? 'en-US' : 'vi-VN', { maximumFractionDigits: currency === 'USD' ? 2 : 0 })} ${currency}`; };

export async function loadAdminApplications() {
  const records = await api.allApplications(authState.walletAddress);
  const pending = records.filter((item) => item.status === 'pending').length;
  $('adminMetrics').innerHTML = `<div class="metric-card"><span class="metric-label">TỔNG HỒ SƠ</span><strong>${records.length}</strong><small>Toàn hệ thống</small></div><div class="metric-card metric-cyan"><span class="metric-label">CHỜ DUYỆT</span><strong>${pending}</strong><small>Cần xử lý</small></div><div class="metric-card metric-amber"><span class="metric-label">ĐÃ DUYỆT</span><strong>${records.filter((item) => item.status === 'approved').length}</strong><small>Hồ sơ thành công</small></div>`;
  if (!records.length) { showEmpty($('adminApplicationsTable'), 'Chưa có hồ sơ nào.', 5); return; }
  $('adminApplicationsTable').innerHTML = records.map((item) => `<tr><td><strong>${escapeHtml(item.studentName)}</strong></td><td>${escapeHtml(item.scholarshipId)}</td><td class="mono wallet-cell">${shortenAddress(item.studentAddress)}</td><td>${status(item.status)}</td><td>${item.status === 'pending' ? `<button class="table-action" data-status="approved" data-id="${item._id}">Duyệt</button><button class="table-action reject" data-status="rejected" data-id="${item._id}">Từ chối</button>` : ''}</td></tr>`).join('');
}

export function initAdmin() {
  $('totalBudget').closest('div').querySelector('label').textContent = 'NGÂN SÁCH TỔNG';
  $('remainingBudget').closest('div').querySelector('label').textContent = 'NGÂN SÁCH CÒN LẠI';
  [
    $('totalBudget'),
    $('remainingBudget')
  ].forEach((input) => {
    const wrapper = document.createElement('div');
    const unit = document.createElement('span');
    wrapper.className = 'budget-input-wrap';
    unit.className = 'budget-unit';
    unit.textContent = 'ETH';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.append(input, unit);
  });
  const budgetInput = $('totalBudget');
  let preview = $('budgetConversion');
  if (!preview) { preview = document.createElement('small'); preview.id = 'budgetConversion'; preview.className = 'budget-conversion'; budgetInput.closest('.budget-input-wrap').insertAdjacentElement('afterend', preview); }
  budgetInput.addEventListener('input', async (event) => { const value = Number(event.target.value); if (!value || value < 0) { preview.textContent = ''; return; } preview.textContent = `≈ ${formatFiat(value, await getEthExchangeRate())}`; });
  $('scholarshipForm').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.target.querySelector('button[type="submit"]'); setButtonLoading(button, true, 'Đang tạo...'); try { await api.createScholarship({ scholarshipId: $('scholarshipId').value.trim(), title: $('scholarshipTitle').value.trim(), totalBudget: Number($('totalBudget').value), remainingBudget: Number($('remainingBudget').value), deadline: new Date($('deadline').value).toISOString() }, authState.walletAddress); event.target.reset(); preview.textContent = ''; notify('Đã tạo học bổng thành công.'); document.dispatchEvent(new Event('auth:ready')); } catch (error) { notify(error.message, 'danger'); } finally { setButtonLoading(button, false); } });
  $('adminApplicationsTable').addEventListener('click', async (event) => { const action = event.target.closest('[data-status]'); if (!action) return; if (action.dataset.status === 'rejected' && !window.confirm('Từ chối hồ sơ này?')) return; action.disabled = true; try { await api.updateApplicationStatus(action.dataset.id, action.dataset.status, authState.walletAddress); notify(action.dataset.status === 'approved' ? 'Đã duyệt hồ sơ.' : 'Đã từ chối hồ sơ.'); await loadAdminApplications(); } catch (error) { action.disabled = false; notify(error.message, 'danger'); } });
}
