export const SCHOLARSHIP_CONTRACT_ADDRESS = '0xE4D70EC77306f23837b6b16888df98a10b4353ad';

export const SCHOLARSHIP_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "applicationId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum ScholarshipManager.Status",
				"name": "status",
				"type": "uint8"
			}
		],
		"name": "ApplicationStatusUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "applicationId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "scholarshipId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			}
		],
		"name": "ApplicationSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_scholarshipId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_studentName",
				"type": "string"
			}
		],
		"name": "applyForScholarship",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_durationInDays",
				"type": "uint256"
			}
		],
		"name": "createScholarship",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_applicationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "disburseScholarship",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_applicationId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_isApproved",
				"type": "bool"
			}
		],
		"name": "reviewApplication",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "scholarshipId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalBudget",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "ScholarshipCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "applicationId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "ScholarshipDisbursed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "applications",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "applicationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "scholarshipId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "enum ScholarshipManager.Status",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasApplied",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "scholarships",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "totalBudget",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "remainingBudget",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export function getContract(signerOrProvider) {
  if (!signerOrProvider) {
    throw new Error('Signer hoặc Provider là bắt buộc để tương tác với Smart Contract.');
  }
  const ethersLib = window.ethers || (typeof ethers !== 'undefined' ? ethers : null);
  return new ethersLib.Contract(SCHOLARSHIP_CONTRACT_ADDRESS, SCHOLARSHIP_ABI, signerOrProvider);
}

function _toWeiString(amountInEth) {
  const num = Number(amountInEth);
  return num.toFixed(18).replace(/\.?0+$/, '');
}

export async function createScholarshipOnChain(signer, title, durationInDays, budgetInEth) {
  // --- Pre-flight validation (prevents wasting gas on predictable reverts) ---
  if (!title || !title.trim()) {
    throw new Error('Tiêu đề học bổng không được để trống.');
  }
  const budget = Number(budgetInEth);
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error('Ngân sách phải lớn hơn 0 ETH.');
  }
  const duration = Number(durationInDays);
  if (!Number.isFinite(duration) || duration < 1) {
    throw new Error('Thời hạn học bổng phải ít nhất 1 ngày (deadline phải trong tương lai).');
  }

  const contract = getContract(signer);
  const ethersLib = window.ethers || (typeof ethers !== 'undefined' ? ethers : null);
  const value = ethersLib.parseEther(_toWeiString(budget));

  let tx;
  try {
    // Estimate gas first to catch revert reasons before broadcasting
    await contract.createScholarship.estimateGas(title.trim(), BigInt(duration), { value });
    tx = await contract.createScholarship(title.trim(), BigInt(duration), { value });
  } catch (err) {
    throw new Error(_parseRevertReason(err));
  }

  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error('Giao dịch bị revert trên blockchain. Vui lòng kiểm tra lại ngân sách và thời hạn.');
  }

  let onChainId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'ScholarshipCreated') {
        onChainId = Number(parsed.args.scholarshipId);
        break;
      }
    } catch {}
  }
  return { txHash: receipt.hash || tx.hash, onChainId };
}

/**
 * Parse a human-readable revert reason from an ethers/MetaMask error.
 * @param {Error} err
 * @returns {string}
 */
function _parseRevertReason(err) {
  // MetaMask user rejection
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
    return 'Bạn đã hủy giao dịch trên MetaMask.';
  }

  const rawMsg = err.reason || err.shortMessage || err.info?.error?.message || err.data?.message || err.message || '';

  if (rawMsg.includes('You have already applied')) {
    return 'Bạn đã nộp hồ sơ cho học bổng này trên blockchain rồi.';
  }
  if (rawMsg.includes('Scholarship is not active') || rawMsg.includes('not active')) {
    return 'Học bổng này hiện đã đóng hoặc không hoạt động.';
  }
  if (rawMsg.includes('deadline')) {
    return 'Học bổng này đã hết hạn nhận hồ sơ.';
  }
  if (rawMsg.includes('budget') || rawMsg.includes('Insufficient') || rawMsg.includes('insufficient')) {
    return 'Ngân sách học bổng trong Smart Contract không đủ để thực hiện thao tác.';
  }
  if (rawMsg.includes('Application already reviewed')) {
    return 'Hồ sơ này đã được xét duyệt trên blockchain trước đó rồi.';
  }
  if (rawMsg.includes('OwnableUnauthorizedAccount') || rawMsg.includes('caller is not the owner')) {
    return 'Chỉ ví Admin (chủ sở hữu Smart Contract) mới có quyền thực hiện thao tác này.';
  }
  if (err.reason) return `Smart contract từ chối: ${err.reason}`;
  if (err.shortMessage) return `Smart contract từ chối: ${err.shortMessage}`;

  return rawMsg || 'Giao dịch thất bại. Vui lòng thử lại.';
}

export async function applyForScholarshipOnChain(signer, scholarshipId, studentName) {
  // Pre-flight validation
  if (!studentName || !studentName.trim()) {
    throw new Error('Họ và tên không được để trống.');
  }
  if (scholarshipId === null || scholarshipId === undefined) {
    throw new Error('Vui lòng chọn học bổng.');
  }

  const contract = getContract(signer);

  let tx;
  try {
    // Estimate gas first — catches revert before broadcasting
    await contract.applyForScholarship.estimateGas(BigInt(scholarshipId), studentName.trim());
    tx = await contract.applyForScholarship(BigInt(scholarshipId), studentName.trim());
  } catch (err) {
    throw new Error(_parseRevertReason(err));
  }

  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error('Giao dịch nộp hồ sơ bị revert. Bạn có thể đã nộp học bổng này rồi.');
  }

  let onChainId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'ApplicationSubmitted') {
        onChainId = Number(parsed.args.applicationId);
        break;
      }
    } catch {}
  }

  if (!onChainId) {
    try {
      const userAddr = await signer.getAddress();
      const existingApp = await fetchStudentOnChainApplication(signer, scholarshipId, userAddr);
      if (existingApp) {
        onChainId = existingApp.onChainId;
      }
    } catch {}
  }

  return { txHash: receipt.hash || tx.hash, onChainId };
}

export async function reviewApplicationOnChain(signer, applicationId, isApproved) {
  const contract = getContract(signer);
  let tx;
  try {
    await contract.reviewApplication.estimateGas(BigInt(applicationId), Boolean(isApproved));
    tx = await contract.reviewApplication(BigInt(applicationId), Boolean(isApproved));
  } catch (err) {
    throw new Error(_parseRevertReason(err));
  }
  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error('Giao dịch duyệt hồ sơ bị revert trên blockchain.');
  }
  return { txHash: receipt.hash || tx.hash };
}

export async function disburseScholarshipOnChain(signer, applicationId, amountInEth) {
  const amount = Number(amountInEth);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Số ETH giải ngân phải lớn hơn 0.');
  }
  const contract = getContract(signer);
  // disburseScholarship is nonpayable — contract pays from its own balance
  const ethersLib = window.ethers || (typeof ethers !== 'undefined' ? ethers : null);
  const amountWei = ethersLib.parseEther(_toWeiString(amount));
  let tx;
  try {
    await contract.disburseScholarship.estimateGas(BigInt(applicationId), amountWei);
    tx = await contract.disburseScholarship(BigInt(applicationId), amountWei);
  } catch (err) {
    throw new Error(_parseRevertReason(err));
  }
  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error('Giao dịch giải ngân bị revert. Kiểm tra ngân sách trong contract còn đủ không.');
  }
  return { txHash: receipt.hash || tx.hash };
}

export async function getOnChainApplicationStatus(providerOrSigner, applicationId) {
  try {
    const contract = getContract(providerOrSigner);
    const app = await contract.applications(BigInt(applicationId));
    // app[4]: 0=Pending, 1=Approved, 2=Rejected, 3=Disbursed
    return Number(app[4]);
  } catch {
    return null;
  }
}

/**
 * Scan all active/created scholarships directly from the Smart Contract.
 * Iterates through scholarship IDs starting from 1 up to maxScan.
 * @param {ethers.Signer|ethers.Provider} providerOrSigner
 * @returns {Promise<Array>}
 */
export async function fetchAllOnChainScholarships(providerOrSigner) {
  if (!providerOrSigner) {
    throw new Error('Cần kết nối ví hoặc provider để đọc dữ liệu từ Smart Contract.');
  }

  const contract = getContract(providerOrSigner);
  const ethersLib = window.ethers || (typeof ethers !== 'undefined' ? ethers : null);
  const list = [];
  const maxScan = 100; // quét tối đa 100 ID

  for (let i = 1; i <= maxScan; i++) {
    try {
      const data = await contract.scholarships(BigInt(i));
      const id = Number(data[0]);
      const title = data[1];
      const totalBudgetWei = data[2];
      const remainingBudgetWei = data[3];
      const deadlineSec = Number(data[4]);
      const isActive = data[5];

      // Khi chạm đến ID chưa được tạo trong mapping (title rỗng và totalBudget = 0)
      if (!title && Number(totalBudgetWei) === 0) {
        break;
      }

      list.push({
        onChainId: id || i,
        title: title || `Học bổng On-Chain #${id || i}`,
        totalBudget: Number(ethersLib.formatEther(totalBudgetWei)),
        remainingBudget: Number(ethersLib.formatEther(remainingBudgetWei)),
        deadline: deadlineSec ? new Date(deadlineSec * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive
      });
    } catch (err) {
      // Revert có nghĩa là mảng đã hết
      break;
    }
  }

  // Kiểm tra thêm ID = 0 phòng trường hợp hợp đồng đánh số từ 0
  try {
    const data0 = await contract.scholarships(BigInt(0));
    if (data0 && data0[1] && Number(data0[2]) > 0) {
      list.unshift({
        onChainId: 0,
        title: data0[1],
        totalBudget: Number(ethersLib.formatEther(data0[2])),
        remainingBudget: Number(ethersLib.formatEther(data0[3])),
        deadline: Number(data0[4]) ? new Date(Number(data0[4]) * 1000).toISOString() : new Date().toISOString(),
        isActive: data0[5]
      });
    }
  } catch {}

  return list;
}

/**
 * Check if a student has already applied for a scholarship on the Smart Contract.
 * @param {ethers.Signer|ethers.Provider} providerOrSigner
 * @param {number|string} onChainId
 * @param {string} studentAddress
 * @returns {Promise<boolean>}
 */
export async function checkIfAppliedOnChain(providerOrSigner, onChainId, studentAddress) {
  if (!providerOrSigner || onChainId === null || onChainId === undefined || !studentAddress) {
    return false;
  }
  try {
    const contract = getContract(providerOrSigner);
    return await contract.hasApplied(BigInt(onChainId), studentAddress);
  } catch {
    return false;
  }
}

/**
 * Fetch a student's on-chain application details for a specific scholarship.
 * @param {ethers.Signer|ethers.Provider} providerOrSigner
 * @param {number|string} onChainId
 * @param {string} studentAddress
 * @returns {Promise<Object|null>}
 */
export async function fetchStudentOnChainApplication(providerOrSigner, onChainId, studentAddress) {
  if (!providerOrSigner || onChainId === null || onChainId === undefined || !studentAddress) {
    return null;
  }
  try {
    const contract = getContract(providerOrSigner);
    for (let i = 1; i <= 100; i++) {
      try {
        const app = await contract.applications(BigInt(i));
        const appId = Number(app[0]);
        const schId = Number(app[1]);
        const addr = app[2];
        if (appId === 0 && schId === 0) break;
        if (schId === Number(onChainId) && addr.toLowerCase() === studentAddress.toLowerCase()) {
          return {
            onChainId: appId,
            scholarshipOnChainId: schId,
            studentAddress: addr,
            studentName: app[3],
            status: Number(app[4])
          };
        }
      } catch {
        break;
      }
    }
  } catch {}
  return null;
}

/**
 * Fetch all on-chain applications from the Smart Contract.
 * @param {ethers.Signer|ethers.Provider} providerOrSigner
 * @returns {Promise<Array>}
 */
export async function fetchAllOnChainApplications(providerOrSigner) {
  if (!providerOrSigner) return [];
  const list = [];
  try {
    const contract = getContract(providerOrSigner);
    for (let i = 1; i <= 100; i++) {
      try {
        const app = await contract.applications(BigInt(i));
        const appId = Number(app[0]);
        const schId = Number(app[1]);
        const addr = app[2];
        if (appId === 0 && schId === 0) break;
        list.push({
          onChainId: appId,
          scholarshipOnChainId: schId,
          studentAddress: addr,
          studentName: app[3],
          status: Number(app[4])
        });
      } catch {
        break;
      }
    }
  } catch {}
  return list;
}


