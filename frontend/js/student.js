import { api, getEthExchangeRate, getSelectedCurrency } from './api.js';
import { authState, escapeHtml, notify } from './auth.js';
import { setButtonLoading, showEmpty, showLoading } from './ui.js';

const $ = (id) => document.getElementById(id);
const date = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
const status = (value) => `<span class="status-pill status-${value}">${value}</span>`;

export async function loadScholarships() {
  showLoading($('scholarshipList'));
  const scholarships = await api.scholarships();
  const rate = await getEthExchangeRate();
  const currency = getSelectedCurrency();
  const formatFiat = (eth) => (eth * rate[currency.toLowerCase()]).toLocaleString(currency === 'USD' ? 'en-US' : 'vi-VN', { maximumFractionDigits: currency === 'USD' ? 2 : 0 });
  $('scholarshipList').innerHTML = scholarships.length ? scholarships.map((item) => { const total = Number(item.totalBudget) || 0; const remaining = Number(item.remainingBudget) || 0; const percent = total ? Math.max(0, Math.min(100, remaining / total * 100)) : 0; return `<article class="scholarship-card"><div class="card-top"><span class="scholarship-id">${escapeHtml(item.scholarshipId)}</span><span class="deadline-badge">Hạn ${date(item.deadline)}</span></div><h4>${escapeHtml(item.title)}</h4><div class="budget-row"><span>Ngân sách còn lại</span><strong>${remaining.toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH</strong></div><small class="budget-conversion">≈ ${formatFiat(remaining)} ${currency}</small><div class="progress-track"><span style="width:${percent}%"></span></div><div class="budget-foot"><span>${percent.toFixed(0)}% khả dụng</span><span>Tổng ${total.toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH</span></div></article>`; }).join('') : '<div class="loading-state">Chưa có học bổng đang mở.</div>';
  $('applicationScholarshipId').innerHTML = '<option value="">Chọn học bổng đang mở</option>' + scholarships.map((item) => `<option value="${escapeHtml(item.scholarshipId)}">${escapeHtml(item.title)}</option>`).join('');
}
export async function loadMyApplications() { const records = await api.myApplications(authState.walletAddress); $('studentName').value = authState.user.name || ''; if (!records.length) { showEmpty($('myApplicationsTable'), 'Bạn chưa gửi hồ sơ nào.', 4); return; } $('myApplicationsTable').innerHTML = records.map((item) => `<tr><td class="mono">${escapeHtml(item.applicationId.slice(0, 12))}</td><td>${escapeHtml(item.scholarshipId)}</td><td>${date(item.createdAt)}</td><td>${status(item.status)}</td></tr>`).join(''); }
export function initStudent() { $('applicationForm').addEventListener('submit', async (event) => { event.preventDefault(); const button = event.target.querySelector('button[type="submit"]'); setButtonLoading(button, true, 'Đang gửi...'); try { await api.createApplication({ scholarshipId: $('applicationScholarshipId').value, studentAddress: authState.walletAddress, studentName: $('studentName').value.trim() }, authState.walletAddress); event.target.reset(); notify('Đã gửi hồ sơ thành công.'); await loadMyApplications(); } catch (error) { notify(error.message, 'danger'); } finally { setButtonLoading(button, false); } }); }
