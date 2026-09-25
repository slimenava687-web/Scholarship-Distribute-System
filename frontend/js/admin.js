import { api, getEthExchangeRate, getSelectedCurrency } from './api.js';
import { authState, escapeHtml, notify, shortenAddress } from './auth.js';
import { setButtonLoading, showEmpty, showConfirmModal } from './ui.js';
import {
  createScholarshipOnChain,
  reviewApplicationOnChain,
  disburseScholarshipOnChain,
  getOnChainApplicationStatus,
  fetchAllOnChainScholarships,
  fetchAllOnChainApplications
} from './contract.js';

const $ = (id) => document.getElementById(id);
const status = (item) => {
  if (item.status === 'approved' && item.isDisbursed) {
    return '<span class="status-pill status-approved">Đã giải ngân ✓</span>';
  }
  if (item.status === 'approved') {
    return '<span class="status-pill status-approved" style="background:#d1fae5;color:#065f46">Đã duyệt (Chờ giải ngân)</span>';
  }
  if (item.status === 'rejected') {
    return '<span class="status-pill status-rejected">Đã từ chối ✗</span>';
  }
  return '<span class="status-pill status-pending">Chờ duyệt ⏳</span>';
};
const formatFiat = (eth, rate) => { const currency = getSelectedCurrency(); return `${(Number(eth || 0) * rate[currency.toLowerCase()]).toLocaleString(currency === 'USD' ? 'en-US' : 'vi-VN', { maximumFractionDigits: currency === 'USD' ? 2 : 0 })} ${currency}`; };

export async function loadAdminApplications() {
  const records = await api.allApplications(authState.walletAddress);

  // Auto-sync on-chain status if blockchain contract is ahead of DB
  if (authState.signer || authState.provider) {
    const providerOrSigner = authState.signer || authState.provider;
    await Promise.all(records.map(async (item) => {
      if (item.onChainId && !item.isDisbursed) {
        const onChainStatus = await getOnChainApplicationStatus(providerOrSigner, item.onChainId);
        if (onChainStatus === 3) {
          item.isDisbursed = true;
          item.status = 'approved';
          api.updateApplicationStatus(item._id, { isDisbursed: true }, authState.walletAddress).catch(() => {});
        } else if (onChainStatus === 1 && item.status === 'pending') {
          item.status = 'approved';
          api.updateApplicationStatus(item._id, 'approved', authState.walletAddress).catch(() => {});
        }
      }
    }));
  }

  const pending = records.filter((item) => item.status === 'pending').length;
  $('adminMetrics').innerHTML = `<div class="metric-card"><span class="metric-label">TỔNG HỒ SƠ</span><strong>${records.length}</strong><small>Toàn hệ thống</small></div><div class="metric-card metric-cyan"><span class="metric-label">CHỜ DUYỆT</span><strong>${pending}</strong><small>Cần xử lý</small></div><div class="metric-card metric-amber"><span class="metric-label">ĐÃ DUYỆT</span><strong>${records.filter((item) => item.status === 'approved').length}</strong><small>Hồ sơ thành công</small></div>`;
  if (!records.length) { showEmpty($('adminApplicationsTable'), 'Chưa có hồ sơ nào.', 5); return; }
  $('adminApplicationsTable').innerHTML = records.map((item) => {
    let actionButtons = '';
    const activeTx = item.disburseTxHash || item.txHash;
    const txLink = activeTx ? `<a href="https://sepolia.etherscan.io/tx/${activeTx}" target="_blank" rel="noopener" class="tx-link" title="Xem giao dịch on-chain trên Sepolia Etherscan">🔗 Tx</a>` : '';

    if (item.status === 'pending') {
      actionButtons = `
        <button class="table-action" data-action="review" data-status="approved" data-id="${item._id}" data-onchain-id="${item.onChainId ?? ''}" data-student-name="${escapeHtml(item.studentName)}" data-student-id="${escapeHtml(item.studentId || '')}" data-student-wallet="${item.studentAddress}" data-scholarship-id="${escapeHtml(item.scholarshipId)}">Duyệt</button>
        <button class="table-action reject" data-action="review" data-status="rejected" data-id="${item._id}" data-onchain-id="${item.onChainId ?? ''}" data-student-name="${escapeHtml(item.studentName)}" data-student-id="${escapeHtml(item.studentId || '')}" data-student-wallet="${item.studentAddress}" data-scholarship-id="${escapeHtml(item.scholarshipId)}">Từ chối</button>
      `;
    } else if (item.status === 'approved' && !item.isDisbursed) {
      actionButtons = `
        <button class="table-action disburse" data-action="disburse" data-id="${item._id}" data-onchain-id="${item.onChainId ?? ''}" data-amount="${item.grantAmount || 1}" data-student-name="${escapeHtml(item.studentName)}" data-student-id="${escapeHtml(item.studentId || '')}" data-student-wallet="${item.studentAddress}" data-scholarship-id="${escapeHtml(item.scholarshipId)}">Giải ngân ETH 💰</button>
      `;
    }

    return `<tr>
      <td>
        <strong>${escapeHtml(item.studentName || 'Sinh viên')}</strong>
        ${item.studentId ? `<br><small class="mono" style="color:var(--blue);font-weight:600">MSSV: ${escapeHtml(item.studentId)}</small>` : ''}
      </td>
      <td>${escapeHtml(item.scholarshipId)}${item.onChainId ? ` <small class="mono">(#${item.onChainId})</small>` : ''}</td>
      <td class="mono wallet-cell">${shortenAddress(item.studentAddress)}</td>
      <td>${status(item)}${txLink}</td>
      <td>${actionButtons}</td>
    </tr>`;
  }).join('');
}

export function initAdmin() {
  if ($('totalBudget')) $('totalBudget').closest('div').querySelector('label').textContent = 'NGÂN SÁCH TỔNG';
  [
    $('totalBudget'),
    $('rewardAmount')
  ].forEach((input) => {
    if (!input) return;
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
  if (!preview && budgetInput) {
    preview = document.createElement('small');
    preview.id = 'budgetConversion';
    preview.className = 'budget-conversion';
    budgetInput.closest('.budget-input-wrap').insertAdjacentElement('afterend', preview);
  }
  if (budgetInput) {
    budgetInput.addEventListener('input', async (event) => {
      const value = Number(event.target.value);
      if (!value || value < 0) { preview.textContent = ''; return; }
      preview.textContent = `≈ ${formatFiat(value, await getEthExchangeRate())}`;
    });
  }

  function renderPendingScholarshipBanner() {
    const form = $('scholarshipForm');
    if (!form) return;
    let banner = $('pendingScholarshipBanner');
    const savedDataStr = sessionStorage.getItem('pending_scholarship_creation');
    if (!savedDataStr) {
      if (banner) banner.remove();
      return;
    }

    let pendingData;
    try {
      pendingData = JSON.parse(savedDataStr);
    } catch {
      sessionStorage.removeItem('pending_scholarship_creation');
      if (banner) banner.remove();
      return;
    }

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pendingScholarshipBanner';
      banner.style.cssText = 'background:rgba(245,158,11,0.15); border:1px solid #f59e0b; border-radius:8px; padding:12px 16px; margin-bottom:16px; color:#fde68a; font-size:14px;';
      form.insertAdjacentElement('beforebegin', banner);
    }

    const idText = (pendingData.onChainId !== null && pendingData.onChainId !== undefined)
      ? `On-Chain #${pendingData.onChainId}`
      : (pendingData.txHash ? `Tx: ${pendingData.txHash.slice(0, 10)}...` : '');

    banner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <strong style="color:#fbbf24;">⚠️ Đã tạo On-Chain thành công nhưng chưa lưu vào CSDL:</strong><br>
          <span>${escapeHtml(pendingData.title)} (${escapeHtml(idText)})</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" id="retrySaveBtn" class="button button-sm button-primary" style="padding:6px 12px; font-size:13px;">Lưu lại vào CSDL</button>
          <button type="button" id="discardPendingBtn" class="button button-sm button-quiet" style="padding:6px 12px; font-size:13px;">Bỏ qua</button>
        </div>
      </div>
    `;

    $('retrySaveBtn').addEventListener('click', async () => {
      const btn = $('retrySaveBtn');
      setButtonLoading(btn, true, 'Đang lưu...');
      try {
        await api.createScholarship(pendingData, authState.walletAddress);
        sessionStorage.removeItem('pending_scholarship_creation');
        banner.remove();
        notify(`Đã lưu học bổng "${pendingData.title}" vào CSDL thành công!`);
        document.dispatchEvent(new Event('auth:ready'));
      } catch (err) {
        notify(`Không thể lưu: ${err.message}`, 'danger');
        setButtonLoading(btn, false);
      }
    });

    $('discardPendingBtn').addEventListener('click', () => {
      if (window.confirm('Bỏ qua bản ghi này? Lưu ý tiền ETH đã nạp vào Smart Contract on-chain sẽ không được hiển thị trên hệ thống.')) {
        sessionStorage.removeItem('pending_scholarship_creation');
        banner.remove();
      }
    });
  }

  renderPendingScholarshipBanner();

  // Handle Sync On-Chain Scholarships
  const syncBtn = $('syncOnChainBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      if (!authState.signer && !authState.provider) {
        notify('Vui lòng kết nối ví MetaMask trước khi đồng bộ.', 'danger');
        return;
      }

      setButtonLoading(syncBtn, true, 'Đang quét Smart Contract...');
      try {
        const onChainList = await fetchAllOnChainScholarships(authState.signer || authState.provider);
        if (!onChainList.length) {
          notify('Không tìm thấy học bổng nào trên Smart Contract.', 'info');
          return;
        }

        // Lấy danh sách học bổng hiện có trong CSDL
        const dbScholarships = await api.scholarships();
        const existingOnChainIds = new Set(
          dbScholarships
            .map((s) => s.onChainId)
            .filter((id) => id !== null && id !== undefined)
        );

        // Lọc các học bổng on-chain chưa có trong database
        const missingList = onChainList.filter((item) => !existingOnChainIds.has(item.onChainId));

        let syncedScholarshipsCount = 0;
        if (missingList.length) {
          setButtonLoading(syncBtn, true, `Đang nạp ${missingList.length} học bổng vào CSDL...`);

          for (const item of missingList) {
            const scholarshipId = `SCH-CHAIN-${item.onChainId}`;
            const rewardAmount = (item.totalBudget && item.totalBudget < 1)
              ? Number(item.totalBudget.toFixed(6))
              : 1;

            await api.createScholarship({
              scholarshipId,
              title: item.title,
              totalBudget: item.totalBudget,
              remainingBudget: item.remainingBudget,
              rewardAmount,
              deadline: item.deadline,
              onChainId: item.onChainId,
              txHash: ''
            }, authState.walletAddress);
            syncedScholarshipsCount++;
          }
        }

        // Cập nhật lại số dư còn lại (remainingBudget) của các học bổng đã có theo Smart Contract
        for (const item of onChainList) {
          const existingSch = dbScholarships.find((s) => s.onChainId === item.onChainId);
          if (existingSch && (existingSch.remainingBudget !== item.remainingBudget || existingSch.totalBudget !== item.totalBudget)) {
            await api.createScholarship({
              scholarshipId: existingSch.scholarshipId,
              title: item.title,
              totalBudget: item.totalBudget,
              remainingBudget: item.remainingBudget,
              rewardAmount: existingSch.rewardAmount,
              deadline: item.deadline,
              onChainId: item.onChainId,
              txHash: existingSch.txHash || ''
            }, authState.walletAddress).catch(() => {});
          }
        }

        // Quét và đồng bộ các hồ sơ sinh viên từ Smart Contract
        setButtonLoading(syncBtn, true, 'Đang quét hồ sơ sinh viên on-chain...');
        const onChainApps = await fetchAllOnChainApplications(authState.signer || authState.provider);
        let syncedAppsCount = 0;

        if (onChainApps.length) {
          const dbApps = await api.allApplications(authState.walletAddress).catch(() => []);
          const existingAppOnChainIds = new Set(
            dbApps.map((a) => a.onChainId).filter((id) => id !== null && id !== undefined)
          );

          for (const app of onChainApps) {
            let appStatus = 'pending';
            let isDisbursed = false;
            if (app.status === 1) appStatus = 'approved';
            else if (app.status === 2) appStatus = 'rejected';
            else if (app.status === 3) {
              appStatus = 'approved';
              isDisbursed = true;
            }

            try {
              await api.createApplication({
                scholarshipId: `SCH-CHAIN-${app.scholarshipOnChainId}`,
                scholarshipOnChainId: app.scholarshipOnChainId,
                studentAddress: app.studentAddress,
                studentName: app.studentName || 'Sinh viên',
                onChainId: app.onChainId,
                status: appStatus,
                isDisbursed,
                txHash: ''
              }, authState.walletAddress);
              if (!existingAppOnChainIds.has(app.onChainId)) {
                syncedAppsCount++;
              }
            } catch (appErr) {
              console.warn('Lỗi khi nạp hồ sơ on-chain:', app.onChainId, appErr);
            }
          }
        }

        const msgParts = [];
        if (syncedScholarshipsCount > 0) msgParts.push(`${syncedScholarshipsCount} học bổng`);
        if (syncedAppsCount > 0) msgParts.push(`${syncedAppsCount} hồ sơ sinh viên`);

        if (msgParts.length > 0) {
          notify(`Đã đồng bộ thành công ${msgParts.join(' và ')} từ Smart Contract về CSDL!`);
        } else {
          notify(`Dữ liệu học bổng (${onChainList.length}) và hồ sơ (${onChainApps.length}) trên Smart Contract đã đồng bộ đầy đủ!`, 'info');
        }
        document.dispatchEvent(new Event('auth:ready'));
      } catch (err) {
        console.error('Lỗi khi đồng bộ học bổng từ Smart Contract:', err);
        notify(err.message || 'Lỗi khi đồng bộ học bổng từ Smart Contract.', 'danger');
      } finally {
        setButtonLoading(syncBtn, false);
      }
    });
  }

  // Handle Create Scholarship Form
  $('scholarshipForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');

    // --- Early client-side validation (before MetaMask popup) ---
    const title = $('scholarshipTitle').value.trim();
    const totalBudget = Number($('totalBudget').value);
    const rewardAmount = Number($('rewardAmount')?.value || 1);
    const deadlineRaw = $('deadline').value;
    const deadlineDate = deadlineRaw ? new Date(deadlineRaw) : null;
    const now = new Date();

    if (!title) {
      notify('Vui lòng nhập tiêu đề học bổng.', 'danger'); return;
    }
    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      notify('Ngân sách phải lớn hơn 0 ETH.', 'danger'); return;
    }
    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
      notify('Phần thưởng mỗi suất phải lớn hơn 0 ETH.', 'danger'); return;
    }
    if (rewardAmount > totalBudget) {
      notify('Phần thưởng không được lớn hơn tổng ngân sách.', 'danger'); return;
    }
    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      notify('Vui lòng chọn ngày hết hạn hợp lệ.', 'danger'); return;
    }
    if (deadlineDate <= now) {
      notify('Ngày hết hạn phải ở trong tương lai.', 'danger'); return;
    }

    setButtonLoading(button, true, 'Đang gửi Smart Contract...');
    try {
      const remainingBudget = totalBudget; // Ngân sách ban đầu = 100% ngân sách tổng
      const durationInDays = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      let onChainId = null;
      let txHash = '';

      if (authState.signer) {
        notify('Vui lòng xác nhận giao dịch trên MetaMask để nạp quỹ vào Contract...', 'info');
        const onChainResult = await createScholarshipOnChain(authState.signer, title, durationInDays, totalBudget);
        onChainId = onChainResult.onChainId;
        txHash = onChainResult.txHash;
      }

      const inputId = $('scholarshipId')?.value?.trim();
      const scholarshipId = inputId || ((onChainId !== null && onChainId !== undefined) ? String(onChainId) : `SCH-${Date.now()}`);

      setButtonLoading(button, true, 'Đang lưu vào hệ thống...');
      try {
        await api.createScholarship({
          scholarshipId,
          title,
          totalBudget,
          remainingBudget,
          rewardAmount,
          deadline: deadlineDate.toISOString(),
          onChainId,
          txHash
        }, authState.walletAddress);

        event.target.reset();
        preview.textContent = '';
        sessionStorage.removeItem('pending_scholarship_creation');
        renderPendingScholarshipBanner();
        notify(`Đã tạo học bổng thành công${(onChainId !== null && onChainId !== undefined) ? ` (#${onChainId})` : ''}!`);
        document.dispatchEvent(new Event('auth:ready'));
      } catch (dbError) {
        console.error('Lỗi khi lưu vào database:', dbError);
        sessionStorage.setItem('pending_scholarship_creation', JSON.stringify({
          scholarshipId,
          title,
          totalBudget,
          remainingBudget,
          rewardAmount,
          deadline: deadlineDate.toISOString(),
          onChainId,
          txHash
        }));
        renderPendingScholarshipBanner();
        notify(
          `Giao dịch on-chain thành công${(onChainId !== null && onChainId !== undefined) ? ` (#${onChainId})` : ''}! Tuy nhiên lưu vào CSDL thất bại: ${dbError.message}. Vui lòng bấm nút "Lưu lại vào CSDL" ở khung cảnh báo phía trên (không tốn gas)!`,
          'danger'
        );
      }
    } catch (error) {
      notify(error.message || 'Lỗi khi tạo học bổng.', 'danger');
    } finally {
      setButtonLoading(button, false);
    }
  });

  // Handle Review & Disburse Actions in Table
  $('adminApplicationsTable').addEventListener('click', async (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const appId = actionBtn.dataset.id;
    const onChainId = actionBtn.dataset.onchainId ? Number(actionBtn.dataset.onchainId) : null;

    if (action === 'review') {
      const statusToSet = actionBtn.dataset.status;
      if (statusToSet === 'rejected') {
        const studentName = actionBtn.dataset.studentName || 'Sinh viên';
        const scholarshipId = actionBtn.dataset.scholarshipId || '';
        const confirmed = await showConfirmModal({
          icon: '⚠️',
          type: 'danger',
          title: 'Từ chối hồ sơ học bổng',
          subtitle: 'Xác nhận từ chối xét duyệt hồ sơ này',
          details: [
            { label: 'Sinh viên', value: studentName },
            { label: 'Chương trình', value: scholarshipId }
          ],
          warning: 'Hồ sơ sau khi bị từ chối sẽ chuyển sang trạng thái "Đã từ chối" và không thể giải ngân.',
          confirmText: 'Từ chối hồ sơ',
          cancelText: 'Quay lại'
        });
        if (!confirmed) return;
      }

      setButtonLoading(actionBtn, true, statusToSet === 'approved' ? 'Đang duyệt...' : 'Đang từ chối...');
      try {
        if (onChainId && authState.signer) {
          notify('Vui lòng xác nhận duyệt hồ sơ trên MetaMask...', 'info');
          await reviewApplicationOnChain(authState.signer, onChainId, statusToSet === 'approved');
        }

        await api.updateApplicationStatus(appId, statusToSet, authState.walletAddress);
        notify(statusToSet === 'approved' ? 'Đã duyệt hồ sơ thành công! Bấm "Giải ngân ETH" để chuyển tiền cho sinh viên.' : 'Đã từ chối hồ sơ.');
        await loadAdminApplications();
        document.dispatchEvent(new Event('auth:ready'));
      } catch (error) {
        setButtonLoading(actionBtn, false);
        notify(error.message || 'Lỗi khi cập nhật hồ sơ.', 'danger');
      }
    } else if (action === 'disburse') {
      const amount = Number(actionBtn.dataset.amount || 1);
      const studentName = actionBtn.dataset.studentName || 'Sinh viên';
      const studentWallet = actionBtn.dataset.studentWallet || '';
      const scholarshipId = actionBtn.dataset.scholarshipId || '';

      if (!onChainId) {
        notify('Hồ sơ này không có onChainId trên Smart Contract để giải ngân.', 'danger');
        return;
      }

      let fiatStr = '';
      try {
        const rate = await getEthExchangeRate();
        fiatStr = formatFiat(amount, rate);
      } catch {}

      const confirmed = await showConfirmModal({
        icon: '💰',
        type: 'disburse',
        title: 'Xác nhận giải ngân học bổng',
        subtitle: 'Chuyển trực tiếp ETH từ Smart Contract đến ví sinh viên',
        amount: `${amount} ETH`,
        fiatAmount: fiatStr,
        details: [
          { label: 'Sinh viên nhận', value: studentName },
          { label: 'Địa chỉ ví', value: shortenAddress(studentWallet), isMono: true },
          { label: 'Học bổng', value: `${scholarshipId} (#${onChainId})` },
          { label: 'Mạng lưới', value: 'Ethereum Sepolia Testnet' }
        ],
        warning: 'Giao dịch giải ngân sẽ trừ trực tiếp ngân sách trong Smart Contract và chuyển ETH đến ví sinh viên. Thao tác không thể hoàn tác.',
        confirmText: 'Xác nhận giải ngân 🚀',
        cancelText: 'Hủy bỏ'
      });

      if (!confirmed) return;

      setButtonLoading(actionBtn, true, 'Đang giải ngân...');
      try {
        notify(`Vui lòng xác nhận chuyển ${amount} ETH trên MetaMask...`, 'info');
        const { txHash } = await disburseScholarshipOnChain(authState.signer, onChainId, amount);

        await api.updateApplicationStatus(appId, {
          isDisbursed: true,
          disburseTxHash: txHash
        }, authState.walletAddress);

        notify(`Đã giải ngân ${amount} ETH thành công cho sinh viên on-chain!`);
        await loadAdminApplications();
        document.dispatchEvent(new Event('auth:ready'));
      } catch (error) {
        setButtonLoading(actionBtn, false);
        notify(error.message || 'Lỗi khi giải ngân.', 'danger');
      }
    }
  });
}

