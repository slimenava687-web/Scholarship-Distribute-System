import { api, getEthExchangeRate, getSelectedCurrency } from './api.js';
import { authState, escapeHtml, notify, showOnboardingModal } from './auth.js';
import { setButtonLoading, showEmpty, showLoading, showSkeletonCards } from './ui.js';
import {
  applyForScholarshipOnChain,
  getOnChainApplicationStatus,
  checkIfAppliedOnChain,
  fetchStudentOnChainApplication
} from './contract.js';

const $ = (id) => document.getElementById(id);
const date = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
const status = (item) => {
  if (item.status === 'approved' && item.isDisbursed) {
    return '<span class="status-pill status-approved">Đã nhận ETH ✓</span>';
  }
  if (item.status === 'approved') {
    return '<span class="status-pill status-approved" style="background:#d1fae5;color:#065f46">Đã duyệt (Chờ nhận ETH)</span>';
  }
  if (item.status === 'rejected') {
    return '<span class="status-pill status-rejected">Đã từ chối ✗</span>';
  }
  return '<span class="status-pill status-pending">Chờ duyệt ⏳</span>';
};

let myAppliedScholarshipIds = new Set();

function updateScholarshipDropdownOptions() {
  const select = $('applicationScholarshipId');
  if (!select) return;
  Array.from(select.options).forEach((opt) => {
    if (opt.value && myAppliedScholarshipIds.has(opt.value)) {
      opt.disabled = true;
      if (!opt.textContent.includes('Đã nộp đơn')) {
        opt.textContent = `${opt.textContent.replace(' (Hết ngân sách)', '')} (Bạn đã nộp đơn ✓)`;
      }
    }
  });
}

export async function loadScholarships() {
  showSkeletonCards($('scholarshipList'), 3);
  const scholarships = await api.scholarships();
  const rate = await getEthExchangeRate();
  const currency = getSelectedCurrency();
  const formatFiat = (eth) => (eth * rate[currency.toLowerCase()]).toLocaleString(currency === 'USD' ? 'en-US' : 'vi-VN', { maximumFractionDigits: currency === 'USD' ? 2 : 0 });
  $('scholarshipList').innerHTML = scholarships.length ? scholarships.map((item) => {
    const total = Number(item.totalBudget) || 0;
    const remaining = Number(item.remainingBudget) || 0;
    const reward = Number(item.rewardAmount) || 1;
    const percent = total ? Math.max(0, Math.min(100, remaining / total * 100)) : 0;
    const isOutOfBudget = remaining < reward;
    const onChainBadge = item.onChainId ? `<small class="mono" style="color:var(--cyan);font-weight:600">On-Chain #${item.onChainId}</small>` : '';
    const txLink = item.txHash ? `<a href="https://sepolia.etherscan.io/tx/${item.txHash}" target="_blank" rel="noopener" class="tx-link" title="Xem giao dịch on-chain">🔗 Tx</a>` : '';
    return `<article class="scholarship-card ${isOutOfBudget ? 'is-depleted' : ''}"><div class="card-top"><span class="scholarship-id">${escapeHtml(item.scholarshipId)} ${onChainBadge}</span><span class="deadline-badge">${isOutOfBudget ? 'Hết ngân sách' : `Hạn ${date(item.deadline)}`}</span></div><h4>${escapeHtml(item.title)}</h4><div class="budget-row"><span>Mỗi suất học bổng</span><strong>${reward.toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH</strong></div><div class="budget-row"><span>Ngân sách còn lại</span><strong>${remaining.toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH</strong></div><small class="budget-conversion">≈ ${formatFiat(remaining)} ${currency}</small><div class="progress-track"><span style="width:${percent}%"></span></div><div class="budget-foot"><span>${percent.toFixed(0)}% khả dụng ${txLink}</span><span>Tổng ${total.toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH</span></div></article>`;
  }).join('') : '<div class="loading-state">Chưa có học bổng đang mở.</div>';
  $('applicationScholarshipId').innerHTML = '<option value="">Chọn học bổng đang mở</option>' + scholarships.map((item) => {
    const reward = Number(item.rewardAmount) || 1;
    const remaining = Number(item.remainingBudget) || 0;
    const isOutOfBudget = remaining < reward;
    const isApplied = myAppliedScholarshipIds.has(item.scholarshipId);
    const isDisabled = isOutOfBudget || isApplied;
    let labelSuffix = '';
    if (isApplied) labelSuffix = ' (Bạn đã nộp đơn ✓)';
    else if (isOutOfBudget) labelSuffix = ' (Hết ngân sách)';
    const onChainAttr = item.onChainId ? `data-onchain-id="${item.onChainId}"` : '';
    return `<option value="${escapeHtml(item.scholarshipId)}" ${onChainAttr} ${isDisabled ? 'disabled' : ''}>${escapeHtml(item.title)} - ${reward} ETH${labelSuffix}</option>`;
  }).join('');
}

export async function loadMyApplications() {
  const records = await api.myApplications(authState.walletAddress);
  myAppliedScholarshipIds = new Set(records.map((r) => r.scholarshipId));
  updateScholarshipDropdownOptions();

  // Auto-sync on-chain status if blockchain contract is ahead of DB
  if (authState.signer || authState.provider) {
    const providerOrSigner = authState.signer || authState.provider;
    await Promise.all(records.map(async (item) => {
      if (item.onChainId && !item.isDisbursed) {
        const onChainStatus = await getOnChainApplicationStatus(providerOrSigner, item.onChainId);
        if (onChainStatus === 3) {
          item.isDisbursed = true;
          item.status = 'approved';
        } else if (onChainStatus === 1 && item.status === 'pending') {
          item.status = 'approved';
        }
      }
    }));
  }

  // Update verified identity in student application card
  const studentNameInput = $('studentName');
  if (studentNameInput) studentNameInput.value = authState.user?.name || '';
  const displayStudentName = $('displayStudentName');
  if (displayStudentName) displayStudentName.textContent = authState.user?.name || 'Chưa thiết lập tên';
  const displayStudentId = $('displayStudentId');
  if (displayStudentId) displayStudentId.textContent = authState.user?.studentId ? `MSSV: ${authState.user.studentId}` : 'Chưa có MSSV';

  if (!records.length) {
    showEmpty($('myApplicationsTable'), 'Bạn chưa gửi hồ sơ nào.', 4);
    return;
  }
  $('myApplicationsTable').innerHTML = records.map((item) => {
    const activeTx = item.disburseTxHash || item.txHash;
    const txLink = activeTx ? `<a href="https://sepolia.etherscan.io/tx/${activeTx}" target="_blank" rel="noopener" class="tx-link" title="Xem giao dịch on-chain trên Sepolia Etherscan">🔗 Tx</a>` : '';
    return `<tr>
      <td class="mono">${escapeHtml(item.applicationId.slice(0, 12))}${item.onChainId ? ` (#${item.onChainId})` : ''}</td>
      <td>${escapeHtml(item.scholarshipId)}</td>
      <td>${date(item.createdAt)}</td>
      <td>${status(item)}${txLink}</td>
    </tr>`;
  }).join('');
}

export function initStudent() {
  const editProfileBtn = $('editProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      showOnboardingModal(true);
    });
  }

  $('applicationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');

    // --- Early validation before MetaMask popup ---
    const scholarshipId = $('applicationScholarshipId').value;
    const selectedOption = $('applicationScholarshipId').selectedOptions[0];
    const onChainId = selectedOption?.dataset.onchainId ? Number(selectedOption.dataset.onchainId) : null;
    const studentName = ($('studentName').value || authState.user?.name || '').trim();

    if (!scholarshipId) {
      notify('Vui lòng chọn học bổng.', 'danger'); return;
    }
    if (myAppliedScholarshipIds.has(scholarshipId)) {
      notify('Bạn đã nộp hồ sơ cho học bổng này rồi (không thể nộp lại).', 'warning');
      return;
    }
    if (!studentName) {
      notify('Vui lòng hoàn tất hồ sơ sinh viên (Họ tên & MSSV) trước khi gửi đơn.', 'warning');
      showOnboardingModal(false);
      return;
    }

    setButtonLoading(button, true, 'Đang gửi hồ sơ...');
    try {
      let appOnChainId = null;
      let txHash = '';

      if (onChainId && authState.signer) {
        // Kiểm tra xem ví sinh viên đã nộp on-chain cho học bổng này trước đó chưa
        const alreadyApplied = await checkIfAppliedOnChain(authState.signer, onChainId, authState.walletAddress);

        if (alreadyApplied) {
          notify('Hồ sơ của bạn đã được ghi nhận trên blockchain trước đó. Đang lưu lại vào CSDL...', 'info');
          const existingApp = await fetchStudentOnChainApplication(authState.signer, onChainId, authState.walletAddress);
          if (existingApp) {
            appOnChainId = existingApp.onChainId;
          }
        } else {
          notify('Vui lòng xác nhận giao dịch nộp hồ sơ trên MetaMask...', 'info');
          const onChainResult = await applyForScholarshipOnChain(authState.signer, onChainId, studentName);
          appOnChainId = onChainResult.onChainId;
          txHash = onChainResult.txHash;
        }
      }

      setButtonLoading(button, true, 'Đang lưu vào hệ thống...');
      await api.createApplication({
        scholarshipId,
        scholarshipOnChainId: onChainId,
        studentAddress: authState.walletAddress,
        studentName,
        studentId: authState.user?.studentId || '',
        onChainId: appOnChainId,
        txHash
      }, authState.walletAddress);

      // Reset scholarship selection only, keep student verified identity
      $('applicationScholarshipId').value = '';
      notify(`Đã nộp hồ sơ thành công${appOnChainId ? ` on-chain (#${appOnChainId})` : ''}!`);
      await loadMyApplications();
    } catch (error) {
      notify(error.message || 'Lỗi khi gửi hồ sơ.', 'danger');
    } finally {
      setButtonLoading(button, false);
    }
  });
}

