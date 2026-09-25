import { initAuth, restoreSession, authState, refreshBalance } from './auth.js';
import { initStudent, loadScholarships, loadMyApplications } from './student.js';
import { initAdmin, loadAdminApplications } from './admin.js';
import { getSelectedCurrency, setSelectedCurrency } from './api.js';
import { showLoading } from './ui.js';

async function loadDashboard() { showLoading(document.getElementById('scholarshipList')); await refreshBalance(); await loadScholarships(); if (authState.user.role === 'admin') await loadAdminApplications(); else await loadMyApplications(); }

function initCurrencySelector() {
	const heading = document.querySelector('.account-actions');
	const selector = document.createElement('label');
	selector.className = 'currency-selector is-hidden';
	selector.setAttribute('title', 'Chọn đơn vị hiển thị quy đổi từ ETH');
	selector.innerHTML = '<span>QUY ĐỔI</span><select id="conversionCurrency" aria-label="Đơn vị quy đổi"><option value="VND">VND</option><option value="USD">USD</option></select>';
	const divider = document.createElement('span');
	divider.className = 'nav-divider';
	divider.setAttribute('aria-hidden', 'true');
	heading.prepend(selector, divider);
	const select = selector.querySelector('select');
	select.value = getSelectedCurrency();
	document.addEventListener('auth:ready', () => selector.classList.remove('is-hidden'));
	select.addEventListener('change', () => { setSelectedCurrency(select.value); document.dispatchEvent(new Event('auth:ready')); });
}

document.addEventListener('auth:ready', () => loadDashboard().catch((error) => document.dispatchEvent(new CustomEvent('app:error', { detail: error }))));
document.addEventListener('app:error', (event) => { const toast = document.createElement('div'); toast.className = 'toast toast-danger is-visible'; toast.textContent = event.detail.message; document.getElementById('toastRegion').appendChild(toast); window.setTimeout(() => toast.remove(), 4200); });

document.addEventListener('DOMContentLoaded', async () => { initAuth(); initStudent(); initAdmin(); initCurrencySelector(); document.getElementById('refreshBtn').addEventListener('click', () => loadDashboard().catch((error) => document.dispatchEvent(new CustomEvent('app:error', { detail: error })))); await restoreSession(); });
