import { api } from './api.js';

const SESSION_KEY = 'scholarship_session';
export const authState = { provider: null, signer: null, walletAddress: null, user: null };
const $ = (id) => document.getElementById(id);

export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[character]));
}

const TOAST_ICONS = {
  success: `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  info: `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warning: `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  danger: `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
};

const TOAST_TITLES = {
  success: 'Thành công',
  info: 'Thông báo',
  warning: 'Lưu ý',
  danger: 'Đã xảy ra lỗi'
};

export function notify(message, type = 'success', duration = 4000) {
  const normalizedType = type === 'error' ? 'danger' : type;
  const region = document.getElementById('toastRegion');
  if (!region) return;

  const iconSvg = TOAST_ICONS[normalizedType] || TOAST_ICONS.info;
  const title = TOAST_TITLES[normalizedType] || 'Thông báo';

  const toast = document.createElement('div');
  toast.className = `toast toast-${normalizedType}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-glow" aria-hidden="true"></div>
    <div class="toast-icon-wrap" aria-hidden="true">${iconSvg}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close-btn" type="button" aria-label="Đóng thông báo">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div class="toast-progress">
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
    </div>
  `;

  region.appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  let timerId = null;

  const dismiss = () => {
    if (timerId) clearTimeout(timerId);
    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 240);
  };

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', dismiss);

  timerId = window.setTimeout(dismiss, duration);
}

let defaultAuthTitle = null;
let defaultAuthIntro = null;

export function setAuthState(state, options = {}) {
  const stateConnect = $('stateConnect');
  const stateConnecting = $('stateConnecting');
  const stateSign = $('stateSign');
  const stateError = $('stateError');
  const authTitle = $('authTitle');
  const authIntro = $('authIntro');
  const statusDot = $('authStatusDot');
  const statusText = $('authStatusText');

  if (defaultAuthTitle === null && authTitle) {
    defaultAuthTitle = authTitle.innerHTML;
  }
  if (defaultAuthIntro === null && authIntro) {
    defaultAuthIntro = authIntro.innerHTML;
  }

  if (!stateConnect) return;

  // Reset visibility safely
  stateConnect?.classList.add('is-hidden');
  stateConnecting?.classList.add('is-hidden');
  stateSign?.classList.add('is-hidden');
  stateError?.classList.add('is-hidden');
  if (statusDot) statusDot.className = 'status-indicator-dot';

  if (state === 'idle') {
    stateConnect?.classList.remove('is-hidden');
    if (authTitle && defaultAuthTitle) authTitle.innerHTML = defaultAuthTitle;
    if (authIntro && defaultAuthIntro) authIntro.innerHTML = defaultAuthIntro;
    if (statusText) statusText.textContent = 'Chưa kết nối';
  } else if (state === 'connecting') {
    stateConnecting?.classList.remove('is-hidden');
    if (authTitle && defaultAuthTitle) authTitle.innerHTML = authTitle.dataset.connectingTitle || defaultAuthTitle;
    if (authIntro && defaultAuthIntro) authIntro.innerHTML = authIntro.dataset.connectingIntro || defaultAuthIntro;
    if (statusDot) statusDot.classList.add('connecting');
    if (statusText) statusText.textContent = 'Đang kết nối...';
  } else if (state === 'signing') {
    stateSign?.classList.remove('is-hidden');
    const address = options.address || authState.walletAddress || '';
    if ($('authConnectedAddress')) $('authConnectedAddress').textContent = shortenAddress(address);
    if (authTitle && defaultAuthTitle) {
      authTitle.innerHTML = authTitle.dataset.signingTitle || defaultAuthTitle;
    }
    if (authIntro && defaultAuthIntro) {
      authIntro.innerHTML = authIntro.dataset.signingIntro || defaultAuthIntro;
    }
    if (statusDot) statusDot.classList.add('connected');
    if (statusText) statusText.textContent = shortenAddress(address);
  } else if (state === 'error') {
    stateError?.classList.remove('is-hidden');
    if (authTitle && defaultAuthTitle) authTitle.innerHTML = authTitle.dataset.errorTitle || defaultAuthTitle;
    if (authIntro && defaultAuthIntro) authIntro.innerHTML = authIntro.dataset.errorIntro || defaultAuthIntro;
    if ($('authErrorTitle')) $('authErrorTitle').textContent = options.title || 'Không thể kết nối ví';
    if ($('authErrorMessage')) $('authErrorMessage').textContent = options.message || 'Kiểm tra tiện ích MetaMask và thử lại.';

    const actionsContainer = $('authErrorActions');
    if (actionsContainer) {
      if (options.isInstall) {
        actionsContainer.innerHTML = `
          <a href="https://metamask.io/download/" target="_blank" rel="noopener" class="button button-primary button-block">Cài đặt MetaMask</a>
          <button id="authRetryBtn" class="switch-wallet-btn" style="margin-top:14px" type="button">Đã cài đặt xong</button>
        `;
      } else {
        actionsContainer.innerHTML = `
          <button id="authRetryBtn" class="button button-primary button-block" type="button">Thử lại</button>
        `;
      }
      const retryBtn = $('authRetryBtn');
      if (retryBtn) retryBtn.addEventListener('click', () => setAuthState('idle'));
    }

    if (statusDot) statusDot.classList.add('error');
    if (statusText) statusText.textContent = '✕ Lỗi kết nối';
  }
}

export function showOnboardingModal(isEditMode = false) {
  const backdrop = $('onboardingBackdrop');
  if (!backdrop) return;

  const walletAddr = $('onboardingWalletAddress');
  if (walletAddr) walletAddr.textContent = shortenAddress(authState.walletAddress);

  const title = $('onboardingTitle');
  const subtitle = $('onboardingSubtitle');
  const cancelBtn = $('onboardingCancelBtn');
  const closeBtn = $('onboardingCloseBtn');
  const submitBtn = $('onboardingSubmitBtn');
  const nameInput = $('onboardingFullName');
  const studentIdInput = $('onboardingStudentId');

  if (isEditMode) {
    if (title) title.textContent = 'Cập nhật hồ sơ sinh viên';
    if (subtitle) subtitle.textContent = 'Thay đổi họ tên hoặc mã số sinh viên gắn với ví.';
    if (submitBtn) submitBtn.textContent = 'Lưu thay đổi ✓';
    if (cancelBtn) cancelBtn.classList.remove('is-hidden');
    if (closeBtn) closeBtn.classList.remove('is-hidden');
    if (nameInput) nameInput.value = authState.user?.name || '';
    if (studentIdInput) studentIdInput.value = authState.user?.studentId || '';
  } else {
    if (title) title.textContent = 'Hoàn tất hồ sơ sinh viên 🎓';
    if (subtitle) subtitle.textContent = 'Xác nhận danh tính liên kết với địa chỉ ví của bạn một lần duy nhất.';
    if (submitBtn) submitBtn.textContent = 'Lưu hồ sơ & Bắt đầu 🚀';
    if (cancelBtn) cancelBtn.classList.add('is-hidden');
    if (closeBtn) closeBtn.classList.add('is-hidden');
    if (nameInput) nameInput.value = authState.user?.name || '';
    if (studentIdInput) studentIdInput.value = authState.user?.studentId || '';
  }

  backdrop.classList.remove('is-hidden');
  requestAnimationFrame(() => {
    backdrop.classList.add('is-active');
    nameInput?.focus();
  });
}

export function hideOnboardingModal() {
  const backdrop = $('onboardingBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('is-active');
  window.setTimeout(() => {
    backdrop.classList.add('is-hidden');
  }, 220);
}

export function showDashboard() {
  $('loginView').classList.add('is-hidden');
  $('appView').classList.remove('is-hidden');
  $('appView').classList.add('view-enter');
  const admin = authState.user?.role === 'admin';
  const roleBadge = $('roleBadge');
  if (roleBadge) {
    if (admin) {
      roleBadge.className = 'role-badge role-badge-admin';
      roleBadge.setAttribute('title', 'Tài khoản Quản trị viên Smart Contract');
      roleBadge.innerHTML = `
        <span class="role-badge-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        <span class="role-badge-text">QUẢN TRỊ VIÊN</span>
      `;
    } else {
      roleBadge.className = 'role-badge role-badge-student';
      roleBadge.setAttribute('title', 'Tài khoản Sinh viên đăng ký học bổng');
      roleBadge.innerHTML = `
        <span class="role-badge-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </span>
        <span class="role-badge-text">SINH VIÊN</span>
      `;
    }
  }

  const navWallet = $('navWallet');
  if (navWallet) {
    navWallet.className = 'nav-wallet-pill mono';
    navWallet.setAttribute('title', 'Bấm để sao chép địa chỉ ví');
    navWallet.innerHTML = `
      <span class="nav-wallet-dot" aria-hidden="true"></span>
      <span class="nav-wallet-address">${shortenAddress(authState.walletAddress)}</span>
    `;
    navWallet.onclick = () => {
      if (authState.walletAddress) {
        navigator.clipboard?.writeText(authState.walletAddress).then(() => {
          notify('Đã sao chép địa chỉ ví: ' + shortenAddress(authState.walletAddress), 'info', 2500);
        }).catch(() => {});
      }
    };
  }

  const heroWallet = $('heroWallet');
  if (heroWallet) {
    if (authState.user?.name && authState.user?.role === 'student') {
      heroWallet.textContent = `${authState.user.name} • ${shortenAddress(authState.walletAddress)}`;
    } else {
      heroWallet.textContent = shortenAddress(authState.walletAddress);
    }
  }

  $('studentPanel').classList.toggle('is-hidden', admin);
  $('adminPanel').classList.toggle('is-hidden', !admin);
  $('dashboardEyebrow').textContent = admin ? 'BẢNG ĐIỀU KHIỂN QUẢN TRỊ' : 'CỔNG THÔNG TIN SINH VIÊN';
  $('dashboardTitle').textContent = admin ? 'Quản lý Chương trình Học bổng' : 'Chương trình Học bổng Sinh viên';
  $('dashboardSubtitle').textContent = admin ? 'Quản trị danh mục học bổng, xét duyệt hồ sơ và thực hiện giải ngân.' : 'Tra cứu học bổng đang mở và theo dõi kết quả xét duyệt hồ sơ.';
  document.dispatchEvent(new CustomEvent('auth:ready'));
}

async function connectWallet() {
  if (!window.ethereum) {
    setAuthState('error', {
      title: 'Chưa cài đặt MetaMask',
      message: 'Bạn cần cài đặt tiện ích mở rộng MetaMask trên trình duyệt để sử dụng hệ thống.',
      isInstall: true
    });
    return;
  }

  const ethersLib = window.ethers || ethers;
  setAuthState('connecting');

  try {
    authState.provider = new ethersLib.BrowserProvider(window.ethereum);
    await authState.provider.send('eth_requestAccounts', []);
    authState.signer = await authState.provider.getSigner();
    authState.walletAddress = await authState.signer.getAddress();
    setAuthState('signing', { address: authState.walletAddress });
    notify('Đã kết nối ví. Vui lòng ký xác thực.');
  } catch (error) {
    const userRejected = error.code === 4001 || error.code === 'ACTION_REJECTED' || error.message?.toLowerCase().includes('user rejected');
    setAuthState('error', {
      title: userRejected ? 'Yêu cầu bị từ chối' : 'Không thể kết nối',
      message: userRejected ? 'Bạn đã từ chối yêu cầu kết nối trong MetaMask.' : (error.message || 'Không thể kết nối ví.'),
      isInstall: false
    });
  }
}

async function login() {
  if (!authState.walletAddress || !authState.signer) {
    setAuthState('idle');
    return;
  }

  const signButton = $('loginBtn');
  const originalHtml = signButton.innerHTML;

  try {
    signButton.disabled = true;
    const textSpan = signButton.querySelector('.wallet-card-text span');
    if (textSpan) textSpan.textContent = 'Chờ ký trong MetaMask...';

    const message = [
      'Scholarship Ledger login',
      `Wallet: ${authState.walletAddress}`,
      `Issued At: ${new Date().toISOString()}`
    ].join('\n');

    const signature = await authState.signer.signMessage(message);

    if (textSpan) textSpan.textContent = 'Đang xác thực...';
    const response = await api.login({
      walletAddress: authState.walletAddress,
      message,
      signature
    });

    authState.user = response.user;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      walletAddress: authState.walletAddress,
      user: authState.user
    }));

    showDashboard();
    if (authState.user?.role === 'student' && (!authState.user.name || !authState.user.name.trim())) {
      showOnboardingModal(false);
    }
  } catch (error) {
    const userRejected = error.code === 4001 || error.code === 'ACTION_REJECTED' || error.message?.toLowerCase().includes('user rejected');
    notify(userRejected ? 'Bạn đã từ chối ký thông điệp xác thực.' : (error.message || 'Đăng nhập thất bại.'), 'danger');
    setAuthState('signing', { address: authState.walletAddress });
  } finally {
    signButton.disabled = false;
    signButton.innerHTML = originalHtml;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  authState.provider = null;
  authState.signer = null;
  authState.walletAddress = null;
  authState.user = null;
  $('appView').classList.add('is-hidden');
  $('loginView').classList.remove('is-hidden');
  $('loginView').classList.add('view-enter');
  setAuthState('idle');
}

export async function restoreSession() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if (!session?.walletAddress || !session?.user) return;
  if (!window.ethereum) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  const ethersLib = window.ethers || ethers;
  try {
    authState.provider = new ethersLib.BrowserProvider(window.ethereum);
    const accounts = await authState.provider.send('eth_accounts', []);
    if (!accounts.some((account) => account.toLowerCase() === session.walletAddress.toLowerCase())) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    authState.signer = await authState.provider.getSigner();
    authState.walletAddress = await authState.signer.getAddress();
    authState.user = session.user;
    showDashboard();
    if (authState.user?.role === 'student' && (!authState.user.name || !authState.user.name.trim())) {
      showOnboardingModal(false);
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

function initCosmicBackground() {
  const container = $('cosmicStardust');
  if (container && container.children.length === 0) {
    const starCount = 30;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'stardust-particle';
      const size = (Math.random() * 2 + 1.2).toFixed(1);
      const left = (Math.random() * 96 + 2).toFixed(1);
      const top = (Math.random() * 96 + 2).toFixed(1);
      const dur = (Math.random() * 3 + 2.5).toFixed(1);
      const delay = (Math.random() * 4).toFixed(1);
      const opacity = (Math.random() * 0.45 + 0.35).toFixed(2);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.animationDuration = `${dur}s`;
      star.style.animationDelay = `${delay}s`;
      star.style.opacity = opacity;
      fragment.appendChild(star);
    }
    container.appendChild(fragment);
  }

}

export function initAuth() {
  initCosmicBackground();

  const connectBtn = $('connectWalletBtn');
  if (connectBtn) {
    connectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      connectWallet();
    });
  }

  const loginBtn = $('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      login();
    });
  }

  const switchBtn = $('switchWalletBtn');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      authState.signer = null;
      authState.walletAddress = null;
      setAuthState('idle');
    });
  }

  const copyAuthBtn = $('copyAuthAddressBtn');
  if (copyAuthBtn) {
    copyAuthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const addr = authState.walletAddress;
      if (addr) {
        navigator.clipboard?.writeText(addr).then(() => {
          notify('Đã sao chép địa chỉ ví: ' + shortenAddress(addr), 'info', 2200);
        }).catch(() => {});
      }
    });
  }

  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => logout());

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => logout());
  }

  const onboardingForm = $('onboardingForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('onboardingFullName').value.trim();
      const studentId = $('onboardingStudentId').value.trim();
      if (!name) {
        notify('Vui lòng nhập họ và tên sinh viên.', 'warning');
        return;
      }
      if (!studentId) {
        notify('Vui lòng nhập mã số sinh viên (MSSV).', 'warning');
        return;
      }

      const submitBtn = $('onboardingSubmitBtn');
      const prevText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang lưu...';

      try {
        const res = await api.updateProfile({ name, studentId }, authState.walletAddress);
        authState.user = res.user;
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          walletAddress: authState.walletAddress,
          user: authState.user
        }));
        hideOnboardingModal();
        notify('Hồ sơ sinh viên đã được lưu thành công!', 'success');

        // Immediately update verified card elements in DOM
        const studentNameInput = $('studentName');
        if (studentNameInput) studentNameInput.value = authState.user.name || '';
        const displayStudentName = $('displayStudentName');
        if (displayStudentName) displayStudentName.textContent = authState.user.name || 'Chưa thiết lập tên';
        const displayStudentId = $('displayStudentId');
        if (displayStudentId) displayStudentId.textContent = authState.user.studentId ? `MSSV: ${authState.user.studentId}` : 'Chưa có MSSV';

        showDashboard();
      } catch (err) {
        notify(err.message || 'Không thể lưu hồ sơ sinh viên.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
      }
    });
  }

  const cancelBtn = $('onboardingCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => hideOnboardingModal());
  }

  const closeBtn = $('onboardingCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => hideOnboardingModal());
  }

  setAuthState('idle');
}

export async function refreshBalance() {
  const balance = document.getElementById('walletBalance');
  const networkText = document.getElementById('balanceNetwork');
  if (!authState.provider) {
    balance.textContent = '-- ETH';
    networkText.textContent = 'Kết nối lại MetaMask để xem số dư';
    return;
  }
  try {
    const value = await authState.provider.getBalance(authState.walletAddress);
    const network = await authState.provider.getNetwork();
    balance.textContent = `${Number(ethers.formatEther(value)).toLocaleString('en-US', { maximumFractionDigits: 5 })} ETH`;
    networkText.textContent = network.name === 'unknown' ? `Chain ID ${network.chainId}` : network.name;
  } catch {
    balance.textContent = '-- ETH';
    networkText.textContent = 'Không thể đọc số dư ví';
  }
}
