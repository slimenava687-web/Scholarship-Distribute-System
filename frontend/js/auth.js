import { api } from './api.js';

const SESSION_KEY = 'scholarship_session';
export const authState = { provider: null, signer: null, walletAddress: null, user: null };
const $ = (id) => document.getElementById(id);

function setAuthMode(mode) {
  const loginView = $('loginView');
  const connectButton = $('connectWalletBtn');
  const loginButton = $('loginBtn');
  const connectedWallet = $('connectedWallet');
  const title = loginView.querySelector('h1');
  const intro = loginView.querySelector('.auth-intro');
  const help = loginView.querySelector('.auth-help');

  document.querySelectorAll('.brand-mark').forEach((mark) => { mark.textContent = 'S+'; });
  connectButton.innerHTML = '<span class="wallet-icon" aria-hidden="true">M</span>Kết nối với MetaMask';

  loginView.dataset.authMode = mode;
  loginView.querySelector('#flowConnect').classList.toggle('is-active', mode === 'connect');
  loginView.querySelector('#flowLogin').classList.toggle('is-active', mode === 'login');
  connectButton.classList.toggle('is-hidden', mode !== 'connect');
  loginButton.classList.toggle('is-hidden', mode !== 'login');
  connectedWallet.classList.toggle('is-hidden', mode !== 'login');
  loginButton.innerHTML = '<span class="wallet-icon" aria-hidden="true">✦</span>Ký thông điệp để đăng nhập';

  if (mode === 'login') {
    title.innerHTML = 'Xác nhận ví<br><em>để tiếp tục.</em>';
    intro.textContent = 'Ví đã được nhận diện.';
    help.textContent = 'Xác nhận chữ ký trong ví để đăng nhập an toàn.';
  } else {
    title.innerHTML = 'Kết nối ví<br><em>để bắt đầu.</em>';
    intro.textContent = 'Kết nối ví MetaMask để truy cập hệ thống Scholarship Ledger.';
    help.textContent = 'Ví chưa được kết nối.';
  }
}

export function notify(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.getElementById('toastRegion').appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  window.setTimeout(() => { toast.classList.remove('is-visible'); window.setTimeout(() => toast.remove(), 250); }, 4200);
}
export function shortenAddress(address) { return `${address.slice(0, 6)}...${address.slice(-4)}`; }
export function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character])); }

function showDashboard() {
  $('loginView').classList.add('is-hidden');
  $('appView').classList.remove('is-hidden');
  $('appView').classList.add('view-enter');
  $('roleBadge').textContent = authState.user.role;
  $('navWallet').textContent = shortenAddress(authState.walletAddress);
  $('heroWallet').textContent = shortenAddress(authState.walletAddress);
  const admin = authState.user.role === 'admin';
  $('studentPanel').classList.toggle('is-hidden', admin);
  $('adminPanel').classList.toggle('is-hidden', !admin);
  $('dashboardEyebrow').textContent = admin ? 'ADMIN CONSOLE' : 'STUDENT PORTAL';
  $('dashboardTitle').textContent = admin ? 'Điều hành cơ hội học tập.' : 'Mở khóa cơ hội tiếp theo.';
  $('dashboardSubtitle').textContent = admin ? 'Quản lý nguồn quỹ và đưa ra quyết định minh bạch.' : 'Mọi hồ sơ của bạn, rõ ràng từ lúc nộp đến khi được xét duyệt.';
  document.dispatchEvent(new CustomEvent('auth:ready'));
}

async function connectWallet() {
  if (!window.ethereum) return notify('Vui lòng cài đặt MetaMask.', 'warning');
  try {
    authState.provider = new ethers.BrowserProvider(window.ethereum);
    await authState.provider.send('eth_requestAccounts', []);
    authState.signer = await authState.provider.getSigner();
    authState.walletAddress = await authState.signer.getAddress();
    $('connectedWallet').textContent = `Ví đã kết nối: ${shortenAddress(authState.walletAddress)}`;
    setAuthMode('login');
    notify('Ví đã kết nối. Hãy ký thông điệp để đăng nhập.');
  } catch (error) { notify(error.message || 'Không thể kết nối MetaMask.', 'danger'); }
}
async function login() {
  if (!authState.walletAddress) return notify('Hãy kết nối ví trước.', 'warning');
  const button = $('loginBtn');
  try {
    button.disabled = true;
    button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span>Đang chờ chữ ký...';
    const message = ['Scholarship Ledger login', `Wallet: ${authState.walletAddress}`, `Issued At: ${new Date().toISOString()}`].join('\n');
    const signature = await authState.signer.signMessage(message);
    const response = await api.login({ walletAddress: authState.walletAddress, message, signature });
    authState.user = response.user;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ walletAddress: authState.walletAddress, user: authState.user }));
    showDashboard();
  }
  catch (error) { notify(error.message || 'Đăng nhập thất bại.', 'danger'); }
  finally { button.disabled = false; setAuthMode('login'); }
}
export function logout(showNotice = true) {
  localStorage.removeItem(SESSION_KEY); authState.provider = null; authState.signer = null; authState.walletAddress = null; authState.user = null; $('appView').classList.add('is-hidden'); $('loginView').classList.remove('is-hidden'); $('loginView').classList.add('view-enter'); setAuthMode('connect'); if (showNotice) notify('Đã đăng xuất khỏi hệ thống.');
}
export async function restoreSession() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if (!session?.walletAddress || !session?.user) return;
  if (!window.ethereum) { localStorage.removeItem(SESSION_KEY); return; }
  try {
    authState.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await authState.provider.send('eth_accounts', []);
    if (!accounts.some((account) => account.toLowerCase() === session.walletAddress.toLowerCase())) { localStorage.removeItem(SESSION_KEY); return; }
    authState.signer = await authState.provider.getSigner();
    authState.walletAddress = await authState.signer.getAddress();
    $('connectedWallet').textContent = `Ví đã kết nối: ${shortenAddress(authState.walletAddress)}`;
    setAuthMode('login');
  } catch { localStorage.removeItem(SESSION_KEY); }
}
export function initAuth() { setAuthMode('connect'); $('connectWalletBtn').addEventListener('click', connectWallet); $('loginBtn').addEventListener('click', login); $('logoutBtn').addEventListener('click', () => logout(true)); if (window.ethereum) window.ethereum.on('accountsChanged', () => logout(false)); const core = $('networkCore'); if (core) { core.addEventListener('click', () => { core.classList.remove('network-pulse'); requestAnimationFrame(() => core.classList.add('network-pulse')); }); core.addEventListener('pointermove', (event) => { const rect = core.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5; core.style.setProperty('--core-x', `${x * 8}px`); core.style.setProperty('--core-y', `${y * 8}px`); }); core.addEventListener('pointerleave', () => { core.style.setProperty('--core-x', '0px'); core.style.setProperty('--core-y', '0px'); }); } }
export async function refreshBalance() { const balance = document.getElementById('walletBalance'); const networkText = document.getElementById('balanceNetwork'); if (!authState.provider) { balance.textContent = '-- ETH'; networkText.textContent = 'Kết nối lại MetaMask để xem số dư'; return; } try { const value = await authState.provider.getBalance(authState.walletAddress); const network = await authState.provider.getNetwork(); balance.textContent = `${Number(ethers.formatEther(value)).toLocaleString('en-US', { maximumFractionDigits: 5 })} ETH`; networkText.textContent = network.name === 'unknown' ? `Chain ID ${network.chainId}` : network.name; } catch { balance.textContent = '-- ETH'; networkText.textContent = 'Không thể đọc số dư ví'; } }
