import fs from 'fs';
import path from 'path';

const outDir = path.resolve('src/app/data/courses');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Web3, Blockchain & Smart Contracts (15 Lessons)
const web3Lessons = [
  {
    num: 1,
    title: '01. Blockchain කියන්නේ ඇත්තටම මොකක්ද? (Decentralization & Distributed Ledgers)',
    level: 'Beginner',
    duration: 'මිනිත්තු 7 (7 min)',
    summary: 'Blockchain තාක්ෂණයේ මූලික පදනම: Centralized vs Decentralized Databases, Distributed Ledger Technology (DLT), Immutable Blocks, සහ Cryptographic Hashes (SHA-256).',
    analogy: 'සාමාන්‍ය බැංකුවක් කියන්නේ එක් මුදලාලි කෙනෙකු ළඟ ඇති තනි ලෙජර් පොතක් වගේ; Blockchain කියන්නේ ගමේ සියලුම දෙනා ළඟ එක සමාන ලෙජර් පොත් තිබී සෑම ගනුදෙනුවක්ම සැවොම එකවර සටහන් කරගන්නා වංචා කළ නොහැකි පොදු පොතක් වැනිය.',
    content: [
      'Centralized (තනි Server එකක්) vs Decentralized (ලොව පුරා Node දහස් ගණනක්).',
      'Cryptographic Hashing (SHA-256): කුඩා වෙනසක් කළද සම්පූර්ණ Hash එක වෙනස් වීම (Avalanche Effect).',
      'Genesis Block සහ Blocks එකිනෙක Previous Hash මඟින් දම්වැලක් සේ බැඳීම.',
      'Immutability: එක් වරක් ලියූ දත්ත කිසිවෙකුට මකා දැමීමට හෝ සංශෝධනය කිරීමට නොහැකි වීම.'
    ],
    keyTakeaways: [
      'Blockchain එකක ඇති ප්‍රධානතම ලක්ෂණය වන්නේ අතරමැදියන් (Intermediaries) නොමැතිව විශ්වාසය (Trustless Consensus) තහවුරු කිරීමයි.',
      'දත්ත වෙනස් කිරීමට උත්සාහ කළහොත් Hash පරතරය නිසා මුළු ජාලයම එම වෙනස ප්‍රතික්ෂේප කරයි.'
    ],
    snippet: `// Concept: Cryptographic Block Hash
import crypto from 'crypto';

function calculateHash(index, previousHash, timestamp, data) {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + JSON.stringify(data))
    .digest('hex');
}

const genesisHash = calculateHash(0, "0", "2009-01-03", { msg: "Genesis Block" });
console.log("Genesis Hash:", genesisHash);`,
    prompt: 'Blockchain එකක දත්ත කිසිවෙකුට සංශෝධනය කළ නොහැකි වීමට හේතු වන ගුණය කුමක්ද?',
    hint: 'Immutability (නොවෙනස්වන බව).',
    solution: 'Immutability (නොවෙනස්වන සුළු බව - දත්ත Hash මඟින් පෙර Block එකට බැඳී ඇති බැවිනි).'
  },
  {
    num: 2,
    title: '02. Cryptography, Public/Private Keys, Wallets & Digital Signatures',
    level: 'Beginner',
    duration: 'මිනිත්තු 7 (7 min)',
    summary: 'Asymmetric Cryptography (Elliptic Curve Cryptography - secp256k1), Public Key (Wallet Address), Private Key (රහස් යතුර), Seed Phrase (BIP-39 Mnemonic), සහ Digital Signatures.',
    analogy: 'Public Address එක කියන්නේ ඔබේ බැංකු ගිණුම් අංකය වගේ (ඕනෑම කෙනෙකුට මුදල් එවීමට දිය හැක); Private Key / Seed Phrase එක කියන්නේ ATM Card එකේ රහස් PIN අංකය සහ ලොකර් යතුර වගේ (කිසිවෙකුට නොදිය යුතුය).',
    content: [
      'Public Key vs Private Key ගණිතමය සම්බන්ධය.',
      'Non-Custodial Wallets (Metamask, Rabby, Ledger) vs Custodial (Binance, Coinbase).',
      'Seed Phrase (12/24 words): අස්ථානගත වූ Wallet එකක් නැවත ලබාගැනීමේ එකම ක්‍රමය.',
      'Transactions Sign කිරීම සහ Gas Fee ගණනය කිරීම.'
    ],
    keyTakeaways: [
      '"Not your keys, not your crypto" - ඔබ සතුව Private Key නොමැති නම් එම මුදල්වල සැබෑ අයිතිකරු ඔබ නොවේ.',
      'Seed Phrase කිසිවිටෙක Screenshot ගසා හෝ Cloud වල නොතබා කඩදාසියක ලියා සුරක්ෂිතව තබන්න.'
    ],
    snippet: `// Asymmetric Key Pair Concept
// Public Address: 0x71C...392 (Safe to share)
// Private Key: 0x4f3...a12 (NEVER SHARE!)
// Transaction Signature: Signature = Sign(TxData, PrivateKey)`,
    prompt: 'Crypto Wallet එකක් ප්‍රතිසාධනය කරගත හැකි වචන 12 හෝ 24ක රහස් වැකිය හඳුන්වන්නේ කුමන නමින්ද?',
    hint: 'Seed Phrase / Mnemonic.',
    solution: 'Seed Phrase / Secret Recovery Mnemonic Phrase.'
  },
  {
    num: 3,
    title: '03. Consensus Mechanisms: Proof of Work (PoW) vs Proof of Stake (PoS)',
    level: 'Beginner',
    duration: 'මිනිත්තු 7 (7 min)',
    summary: 'Decentralized එකඟතාව (Consensus): Bitcoin PoW (Mining, ASICs, 51% Attack resistance) vs Ethereum PoS (Validators, Staking 32 ETH, Slashing, 99.95% Energy Reduction).',
    analogy: 'PoW කියන්නේ දුෂ්කර ගණිත ගැටලුවක් මුලින්ම විසඳූ කෙනාට තෑග්ග දෙන තරඟයක් වගේ; PoS කියන්නේ තමන්ගේම මුදල් ඇපයට (Stake) තබා වංචාවක් නොකරන බවට දිවුරා තීරණ ගන්නා ක්‍රමයක් වැනිය.',
    content: [
      'Byzantine Generals Problem සහ Distributed Consensus විසඳුම.',
      'Proof of Work: Mining Difficulty, Nonce සෙවීම සහ Energy Consumption.',
      'Proof of Stake: Validators, Block Proposing, Attestations සහ Slashing දඩුවම්.',
      'The Ethereum Merge: PoW සිට PoS වෙත පරිවර්තනය වීම.'
    ],
    keyTakeaways: [
      'PoS මඟින් පරිසර හිතකාමී ලෙස සහ දැවැන්ත විදුලි පරිභෝජනයකින් තොරව Blockchain ආරක්ෂාව තහවුරු කරයි.',
      'Slashing මඟින් වංචනික Validator වරුන්ගේ Staked ETH රාජසන්තක කරයි.'
    ],
    snippet: `// Proof of Work Simple Nonce Mining Loop
function mineBlock(previousHash, data, difficulty) {
  let nonce = 0;
  const targetPrefix = '0'.repeat(difficulty);
  while (true) {
    const hash = calculateHash(nonce, previousHash, data);
    if (hash.startsWith(targetPrefix)) {
      return { nonce, hash };
    }
    nonce++;
  }
}`,
    prompt: 'Ethereum ජාලය Proof of Stake (PoS) වෙත මාරු වීමෙන් පසු විදුලි පරිභෝජනය කොපමණ ප්‍රතිශතයකින් අඩු වියද?',
    hint: '99% කට වඩා වැඩි අගයක්.',
    solution: '99.95% කින් පමණ විදුලි පරිභෝජනය අඩු විය.'
  },
  {
    num: 4,
    title: '04. Ethereum & EVM (Ethereum Virtual Machine) Architecture',
    level: 'Beginner',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Ethereum යනු ලෝක පරිගණකයයි (The World Computer): EVM Opcodes, State Transition Machine, Account-Based Model (EOA vs Contract Accounts), සහ Gas Mechanics (BaseFee + PriorityFee).',
    analogy: 'EVM කියන්නේ ලොව පුරා ඇති පරිගණක දහස් ගණනක එකවර ධාවනය වන තනි අතථ්‍ය සුපිරි පරිගණකයක් (Global Supercomputer) වැනිය.',
    content: [
      'EOA (Externally Owned Accounts - Private Key මඟින් පාලනය වන) vs Contract Accounts.',
      'EVM Stack, Memory, Storage (Expensive Persistent Data) සහ Calldata.',
      'Gas Limit vs Gas Price (Gwei) සහ EIP-1559 Dynamic Fee Model.',
      'Smart Contracts Deploy වන Bytecode සහ ABI (Application Binary Interface).'
    ],
    keyTakeaways: [
      'Storage වල දත්ත ලිවීම ඉතා මිල අධිකය (SSTORE = 20,000 Gas), එබැවින් Smart Contracts Optimize කළ යුතුය.',
      'ABI මඟින් Frontend එකට Smart Contract එකේ Methods හඳුනා ගැනීමට ඉඩ සලසයි.'
    ],
    snippet: `// Ethereum Gas Calculation (EIP-1559)
// Total Fee = Gas Units * (Base Fee + Priority Fee)
// Example: 21,000 * (15 Gwei + 2 Gwei) = 357,000 Gwei (0.000357 ETH)`,
    prompt: 'Ethereum හි සාමාන්‍ය පරිශීලකයෙකුගේ Wallet ගිණුමක් හඳුන්වන කෙටි නම කුමක්ද?',
    hint: 'EOA (Externally Owned Account).',
    solution: 'EOA (Externally Owned Account).'
  },
  {
    num: 5,
    title: '05. Solidity Fundamentals: Syntax, State Variables, Data Types & Visibility',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Solidity 0.8+: SPDX-License-Identifier, pragma solidity, uint256, address, bool, bytes, State Variables vs Local Variables, Visibility (public, private, internal, external), සහ view/pure Functions.',
    analogy: 'Smart Contract එකක් කියන්නේ කිසිදු නීතිඥයෙකුට හෝ දේශපාලනඥයෙකුට වෙනස් කළ නොහැකි, කේතයෙන්ම ලියූ ස්වයංක්‍රීය ඩිජිටල් ගිවිසුමකි.',
    content: [
      'Data Types: uint256, int256, address (msg.sender, address(this)), bool, string.',
      'Visibility Modifiers: public, external (Gas efficient for external calls), internal, private.',
      'view (දත්ත කියවීම පමණක් - Zero Gas for read) vs pure (දත්ත කියවීමක් හෝ ලිවීමක් නැත) vs State-modifying.',
      'Solidity 0.8+ හි SafeMath ස්වයංක්‍රීය Overflow/Underflow ආරක්ෂාව.'
    ],
    keyTakeaways: [
      'view සහ pure functions external calls වලදී Gas වැය නොවේ.',
      'Solidity 0.8+ සිට Integer Overflow ස්වයංක්‍රීයව revert වේ.'
    ],
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    // State variable stored permanently on-chain
    uint256 private _favoriteNumber;
    address public immutable owner;

    event NumberUpdated(uint256 newNumber, address indexed updatedBy);

    constructor() {
        owner = msg.sender;
    }

    function setNumber(uint256 newNum) external {
        _favoriteNumber = newNum;
        emit NumberUpdated(newNum, msg.sender);
    }

    function getNumber() external view returns (uint256) {
        return _favoriteNumber;
    }
}`,
    prompt: 'Blockchain හි දත්ත වෙනස් නොකර කියවීම පමණක් සිදුකරන Solidity function එකකට යොදන modifier එක කුමක්ද?',
    hint: 'view modifier එක.',
    solution: 'view modifier එක (external call වලදී Gas ගාස්තු අය නොවේ).'
  },
  {
    num: 6,
    title: '06. Mappings, Structs, Arrays & Events in Solidity',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Solidity Data Structures: Mappings (`mapping(address => uint256)` Hash Tables), Structs (Custom Entities), Dynamic & Fixed Arrays, Enums, සහ On-Chain Indexable Events (emit).',
    analogy: 'Mapping එකක් කියන්නේ දැවැන්ත නාමාවලියක් වගේ: Wallet Address එක ලබාදුන් සැනින් O(1) කාලයකින් ඔහුගේ ශේෂය (Balance) ලබාගත හැක.',
    content: [
      'Mappings: mapping(address => uint256) public balances.',
      'Nested Mappings: mapping(address => mapping(address => bool)) allowances.',
      'Structs: User Profile හෝ Order Data එක තැනකට ගොනු කිරීම.',
      'Events & indexed parameters: Off-chain Apps (The Graph/Frontend) වලට Event Logs Listen කිරීමට ඉඩදීම.'
    ],
    keyTakeaways: [
      'Mappings වල keys list එකක් iteration කළ නොහැක; ඒ සඳහා Array එකක් සමඟ ඒකාබද්ධ කළ යුතුය.',
      'Event එකක indexed parameters 3ක් දක්වා ලබාදිය හැකි අතර ඒවා Frontend එකෙන් Filter කළ හැක.'
    ],
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserRegistry {
    struct UserProfile {
        string username;
        uint256 joinedAt;
        bool isVerified;
    }

    mapping(address => UserProfile) public users;
    event UserRegistered(address indexed userAddress, string username);

    function register(string calldata _username) external {
        require(bytes(_username).length > 0, "Username empty");
        require(users[msg.sender].joinedAt == 0, "Already registered");

        users[msg.sender] = UserProfile({
            username: _username,
            joinedAt: block.timestamp,
            isVerified: true
        });

        emit UserRegistered(msg.sender, _username);
    }
}`,
    prompt: 'Smart Contract එකක Mapping එකක ඇති සියලුම Keys එකවර loop කිරීමට කෙලින්ම හැකිද?',
    hint: 'Mappings do not store keys list.',
    solution: 'නැත, Mapping එකක keys ලැයිස්තුවක් නොමැති බැවින් වෙනම Array එකක් තබාගත යුතුය.'
  },
  {
    num: 7,
    title: '07. Modifiers, Error Handling (require, revert, Custom Errors) & msg.value Payments',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Solidity Access Control & Security: Custom Function Modifiers (`onlyOwner`), `require()` vs `revert CustomError()` (Gas Savings), `msg.value` (Payable Functions), සහ ETH Transfers (`call{value: ...}("")`).',
    analogy: 'Modifier එකක් කියන්නේ ප්‍රවේශ පත්‍ර පරීක්ෂකවරයෙක් වගේ: Function එක ඇතුළට යාමට පෙර ඔබ අයිතිකරුදැයි බලා (onlyOwner) පසුව පමණක් දොර විවෘත කරයි (`_;`).',
    content: [
      'Function Modifiers and the Merge Point (`_;`).',
      'Gas Efficient Custom Errors: error Unauthorized(); if (!isOwner) revert Unauthorized();.',
      'Payable Functions: Contract එකට සැබෑ ETH මුදල් භාරගැනීම.',
      'ETH Withdrawals: (bool sent, ) = recipient.call{value: amount}(""); require(sent, "Failed");.'
    ],
    keyTakeaways: [
      'String error messages සහිත require() වෙනුවට Custom Errors (revert NotOwner()) යෙදීමෙන් Gas විශාල ලෙස ඉතිරි වේ.',
      'transfer() හෝ send() වෙනුවට සැමවිටම recipient.call{value: amount}("") භාවිතා කරන්න.'
    ],
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotOwner();
error InsufficientPayment(uint256 provided, uint256 required);

contract Crowdfund {
    address public immutable owner;
    uint256 public constant TICKET_PRICE = 0.05 ether;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function buyTicket() external payable {
        if (msg.value < TICKET_PRICE) {
            revert InsufficientPayment(msg.value, TICKET_PRICE);
        }
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}`,
    prompt: 'Solidity 0.8+ හි String require statements වෙනුවට Custom Errors භාවිතයේ ප්‍රධාන වාසිය කුමක්ද?',
    hint: 'Gas Optimization.',
    solution: 'Deployment සහ Execution වලදී Gas ගාස්තු සැලකිය යුතු ලෙස ඉතිරි වීම.'
  },
  {
    num: 8,
    title: '08. ERC-20 Token Standard: Fungible Crypto Tokens නිර්මාණය කරමු',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'ERC-20 Token සම්මතය: OpenZeppelin ERC20 Implementation, totalSupply, balanceOf, transfer, approve, allowance, transferFrom, සහ Decimals (18 Decimals).',
    analogy: 'ERC-20 Token එකක් කියන්නේ කැසිනෝ ශාලාවක භාවිත වන Poker Chips හෝ රටක භාවිත වන මුදල් නෝට්ටු වගේ: සෑම Token එකක්ම තවත් Token එකකට 100% ක් සමාන වේ (Fungible).',
    content: [
      'ERC-20 Interface (IERC20) සහ OpenZeppelin Contracts භාවිතය.',
      'Decimals (10^18) ගණනය: 1 Token = 1000000000000000000 Wei.',
      'Approve & TransferFrom Pattern: Uniswap / DEXs වලට ඔබේ Tokens හුවමාරු කිරීමට අවසර දීම.',
      '_mint() සහ _burn() Functions මඟින් Token Supply පාලනය.'
    ],
    keyTakeaways: [
      'ස්වයංක්‍රීයව ERC-20 Tokens ලිවීමට වඩා OpenZeppelin audited libraries භාවිතා කිරීම ඉහළම ආරක්ෂාව ලබා දෙයි.',
      'DEX එකක Token Swap කිරීමට පෙර පරිශීලකයා approve() Transaction එකක් අත්සන් කළ යුතුය.'
    ],
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyFeedToken is ERC20, Ownable {
    constructor() ERC20("MyFeed Utility", "MFEED") Ownable(msg.sender) {
        // Mint 1,000,000 MFEED to creator (18 decimals)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}`,
    prompt: 'ERC-20 Tokens වල සම්මත දශමස්ථාන (Decimals) ගණන සාමාන්‍යයෙන් කීයද?',
    hint: '18 Decimals (Wei unit).',
    solution: '18 Decimals (1 Ether = 10^18 Wei).'
  },
  {
    num: 9,
    title: '09. ERC-721 & ERC-1155 NFT Standards: Digital Assets & On-Chain Metadata',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Non-Fungible Tokens (NFTs): ERC-721 (Unique Token IDs, ownerOf, safeTransferFrom), IPFS TokenURI JSON Metadata, Royalty Standards (EIP-2981), සහ ERC-1155 Multi-Token Standard.',
    analogy: 'ERC-721 NFT එකක් කියන්නේ මොනාලිසා මුල් සිතුවම හෝ ඔප්පුවක් වගේ: සෑම Token එකකටම අනන්‍ය Token ID එකක් සහ හිමිකරුවෙකු ඇත (Non-Fungible).',
    content: [
      'ERC-721 vs ERC-20 වෙනස.',
      'TokenURI සහ IPFS Decentralized Storage (Pinata / Arweave) මඟින් Image/Metadata ගබඩා කිරීම.',
      'safeTransferFrom() මඟින් වැරදි Contract වලට NFT හිරවීම වැළැක්වීම.',
      'ERC-1155: Gaming items (Fungible Gold + Non-fungible Swords) තනි Contract එකකින් හැසිරවීම.'
    ],
    keyTakeaways: [
      'NFT Metadata කිසිවිටෙක Centralized AWS Server එකක නොතබා IPFS හෝ Arweave මත තබන්න.',
      'ERC-1155 මඟින් Batch Transfers මඟින් Gas 90% දක්වා ඉතිරි කරගත හැක.'
    ],
    snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("MyFeed Certificate", "MFCERT") Ownable(msg.sender) {}

    function mintCertificate(address student, string memory metadataUri) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataUri);
        return tokenId;
    }
}`,
    prompt: 'NFT එකක පින්තූරය සහ ගුණාංග විස්තර වන JSON ලිපිනය ලබාදෙන ERC-721 method එක කුමක්ද?',
    hint: 'tokenURI(tokenId).',
    solution: 'tokenURI(uint256 tokenId)'
  },
  {
    num: 10,
    title: '10. Hardhat & Foundry: Smart Contract Testing & Local Blockchain Deployment',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Professional Smart Contract Development Tools: Foundry (Rust-based, Solidity Tests, Fuzzing) vs Hardhat (TypeScript, Mocha/Chai, Ethers.js), Local Anvil/Hardhat Nodes, සහ Gas Profiling.',
    analogy: 'Foundry කියන්නේ රොකට්ටුවක් උඩුගුවනට යැවීමට පෙර සුළං උමඟක (Wind Tunnel) දමා සිදුකරන දැඩි ආරක්‍ෂක පරීක්ෂණ පද්ධතියක් වැනිය.',
    content: [
      'Foundry Setup: `forge init`, `forge build`, `forge test`.',
      'Solidity Tests: `function test_RevertWhen_NonOwnerWithdraws() public`.',
      'Fuzz Testing: `testFuzz_Deposit(uint256 amount)` මඟින් අහඹු අගයන් මිලියන ගණනකින් Bugs සෙවීම.',
      'Deployment Scripts: `forge script script/Deploy.s.sol --rpc-url sepolia --broadcast`.'
    ],
    keyTakeaways: [
      'Foundry මඟින් Solidity වලින්ම Tests ලිවිය හැකි බැවින් Context Switching නොමැතිව 10x වේගයෙන් පරීක්ෂා කළ හැක.',
      'Mainnet එකට Deploy කිරීමට පෙර 100% Code Coverage සහ Fuzz Tests සමත් විය යුතුය.'
    ],
    snippet: `// Foundry Solidity Test Example
import "forge-std/Test.sol";
import "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public storageContract;
    address user = address(0xABCD);

    function setUp() public {
        storageContract = new SimpleStorage();
    }

    function testSetNumber() public {
        vm.prank(user); // Simulate caller as 'user'
        storageContract.setNumber(42);
        assertEq(storageContract.getNumber(), 42);
    }
}`,
    prompt: 'Foundry හි විවිධ අහඹු සංඛ්‍යා (Random values) දහස් ගණනක් ඇතුල් කර Smart Contract එකේ දෝෂ සෙවීමේ ක්‍රමය හඳුන්වන්නේ කුමන නමින්ද?',
    hint: 'Fuzz Testing.',
    solution: 'Fuzz Testing (Fuzzing).'
  },
  {
    num: 11,
    title: '11. Web3 Frontend Integration: Wagmi, Viem, RainbowKit & React Hooks',
    level: 'Intermediate',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Full-Stack DApp Development: Viem (TypeScript Interface for Ethereum), Wagmi React Hooks (`useAccount`, `useReadContract`, `useWriteContract`), සහ RainbowKit / AppKit Wallet Connection Modals.',
    analogy: 'Wagmi කියන්නේ සම්ප්‍රදායික Web App එක සහ Blockchain ලෝකය එකිනෙක අමුණන විශ්වීය පාලම (Universal Adapter) වැනිය.',
    content: [
      'Viem vs Ethers.js: Lightweight, Tree-shakeable, Pure TypeScript.',
      'Wagmi Configuration: createConfig with chains (mainnet, sepolia, arbitrum).',
      'useReadContract: On-chain balances සහ state live කියවීම.',
      'useWriteContract & useWaitForTransactionReceipt: Transactions යවා Loading Indicators පෙන්වීම.'
    ],
    keyTakeaways: [
      'නවීන Production DApps සඳහා පැරණි Ethers.js v5 වෙනුවට Viem සහ Wagmi v2 භාවිතා කරන්න.',
      'Wallet Disconnect සහ Network Switch (Change Chain) අවස්ථා Frontend එකේ සුමටව Handle කරන්න.'
    ],
    snippet: `import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

export function MintButton({ contractAddress, abi }) {
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: contractAddress,
      abi: abi,
      functionName: 'mint',
      args: ['0xUser...'],
      value: parseEther('0.01'),
    });
  };

  if (!isConnected) return <p>Please connect wallet</p>;
  return (
    <button onClick={handleMint} disabled={isPending}>
      {isPending ? 'Minting On-Chain...' : 'Mint NFT (0.01 ETH)'}
    </button>
  );
}`,
    prompt: 'නවීන React DApp එකක Wallet එකක් සම්බන්ධ වී ඇත්දැයි දැනගැනීමට Wagmi හි භාවිතා කරන Hook එක කුමක්ද?',
    hint: 'useAccount() hook එක.',
    solution: 'useAccount() hook එක (const { isConnected, address } = useAccount();).'
  },
  {
    num: 12,
    title: '12. Smart Contract Security & Common Hacks (Reentrancy, Front-running & Oracles)',
    level: 'Pro',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'බිලියන ගණනක Crypto සොරකම් වැළැක්වීම: Reentrancy Attack (The DAO Hack) සහ ReentrancyGuard, Checks-Effects-Interactions Pattern, Flash Loan Price Manipulation, සහ Chainlink Decentralized Oracles.',
    analogy: 'Reentrancy කියන්නේ බැංකු ලිපිකරු මුදල් අඩු කිරීමට පෙර (Balance Update) පාරිභෝගිකයා වේගයෙන් නැවත නැවත මුදල් ඉල්ලා මුළු බැංකුවම හිස් කරන හොරකමක් වැනිය.',
    content: [
      'The Famous DAO Hack & Reentrancy Vulnerability.',
      'Checks-Effects-Interactions Pattern: ප්‍රථමයෙන් State එක Update කර පසුව පමණක් බාහිර Call කිරීම.',
      'OpenZeppelin ReentrancyGuard: nonReentrant modifier භාවිතය.',
      'Chainlink Price Feeds: DEX Spot Prices විශ්වාස නොකර On-chain Real-world Data ලබාගැනීම.'
    ],
    keyTakeaways: [
      'බාහිර Contract වලට ETH හෝ Token යැවීමට පෙර සැමවිටම Internal Balance එක 0 කරන්න (Checks-Effects-Interactions).',
      'DeFi Price Calculations සඳහා Uniswap Pool Spot Reserves කෙලින්ම භාවිතා නොකරන්න (Flash Loan Attack Risk).'
    ],
    snippet: `// SECURE: Checks-Effects-Interactions Pattern
mapping(address => uint256) public balances;

function withdraw() external nonReentrant {
    // 1. CHECKS
    uint256 amount = balances[msg.sender];
    require(amount > 0, "No balance");

    // 2. EFFECTS (Update state FIRST)
    balances[msg.sender] = 0;

    // 3. INTERACTIONS (External call LAST)
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}`,
    prompt: 'Reentrancy ප්‍රහාරයකින් ආරක්ෂා වීමට අනුගමනය කළ යුතු ප්‍රධානතම කේත සැකසුම් රටාව (Pattern) කුමක්ද?',
    hint: 'Checks-Effects-Interactions Pattern.',
    solution: 'Checks-Effects-Interactions Pattern (සහ ReentrancyGuard modifier).'
  },
  {
    num: 13,
    title: '13. Layer 2 Scaling Solutions: Rollups (Optimistic vs ZK-Rollups) & Arbitrum / Base',
    level: 'Pro',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Ethereum Scalability: Blockchain Trilemma, Layer 2 (L2) Rollups, Optimistic Rollups (Arbitrum, Optimism, Base - Fraud Proofs & 7-day challenge period) vs Zero-Knowledge (ZK) Rollups (zkSync, Starknet, Polygon zkEVM - Validity Proofs / ZK-SNARKs).',
    analogy: 'L2 Rollup එකක් කියන්නේ අධිවේගී මාර්ගයක වාහන 100ක් තනි තනිව ගමන් කර තදබදය හදනවා වෙනුවට සියල්ලන්ම අධිවේගී දුම්රියකට (Batch) පටවා ගමනාන්තයට ගෙන යාම වැනිය.',
    content: [
      'The Blockchain Trilemma: Decentralization, Security, Scalability.',
      'L1 Data Availability & EIP-4844 Proto-Danksharding (Blobs) මඟින් ගාස්තු 95% කින් අඩු වීම.',
      'Optimistic Rollups: Fraud Proofs සහ Canonical Bridge.',
      'ZK-Rollups: Cryptographic ZK-SNARK / STARK Validity Proofs මඟින් ක්ෂණික Finality.'
    ],
    keyTakeaways: [
      'Layer 2 මඟින් Ethereum Mainnet එකේ ඉහළ ආරක්ෂාව එලෙසම තබාගනිමින් ගනුදෙනු ගාස්තුව ශත ගණනක් දක්වා අඩු කරයි.',
      'EIP-4844 Blobs හඳුන්වා දීමෙන් පසු L2 ගනුදෙනු ගාස්තු $0.01 ට වඩා අඩු විය.'
    ],
    snippet: `// Layer 2 Gas comparison
// Ethereum L1 Swap: ~$5.00 - $30.00
// Arbitrum / Base L2 Swap: ~$0.01 - $0.05 (100x Cheaper)`,
    prompt: 'ZK-Rollups වලදී ගනුදෙනු වල නිවැරදිභාවය තහවුරු කිරීමට යොදාගන්නා ගණිතමය සාක්ෂිය හඳුන්වන්නේ කුමන නමින්ද?',
    hint: 'Validity Proofs (ZK-SNARKs).',
    solution: 'Validity Proofs (Zero-Knowledge Proofs / ZK-SNARKs).'
  },
  {
    num: 14,
    title: '14. Account Abstraction (ERC-4337): Smart Wallets, Social Recovery & Gasless Txns',
    level: 'Pro',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Next Generation Web3 UX: ERC-4337 Account Abstraction, Smart Contract Wallets (Passkey Login, Biometrics), Bundlers, Paymasters (Gasless Transactions / Sponsored Gas in ERC-20), සහ Social Recovery (No Seed Phrases).',
    analogy: 'Account Abstraction කියන්නේ පැරණි යතුරු කට්ටලයක් අතැතිව යාම වෙනුවට ඔබේ ඇස් සලකුණෙන් (FaceID) විවෘත වන සුපිරි ස්මාර්ට් ආරක්ෂිත දොරක් සාදාගැනීම වැනිය.',
    content: [
      'EOA වල අඩුපාඩු: Seed Phrase අමතක වීම, Gas ගෙවීමට ETH අනිවාර්ය වීම.',
      'ERC-4337 Architecture: UserOperation, Bundler, EntryPoint Contract, Paymaster.',
      'Paymasters: පරිශීලකයා වෙනුවට App එක මඟින් Gas ගාස්තු ගෙවීම (Sponsored Transactions).',
      'Passkey / WebAuthn Signers: FaceID හෝ Fingerprint මඟින් On-chain Transactions අත්සන් කිරීම.'
    ],
    keyTakeaways: [
      'Account Abstraction මඟින් මීළඟ බිලියනයක් පරිශීලකයින්ට Web2 වැනි සුමට අත්දැකීමකින් Web3 වෙත පැමිණීමට මඟ පාදයි.',
      'Paymaster මඟින් පරිශීලකයාට ETH නොමැතිව USDC වලින් Gas ගෙවීමට ඉඩ සලසයි.'
    ],
    snippet: `// ERC-4337 UserOperation Concept
interface UserOperation {
    address sender;
    uint256 nonce;
    bytes callData;
    uint256 callGasLimit;
    bytes paymasterAndData; // Sponsored Gas logic
    bytes signature; // Passkey / Multi-sig signature
}`,
    prompt: 'ERC-4337 හි පරිශීලකයා වෙනුවට Gas ගාස්තුව ගෙවන (Gasless UX) සංරචකය හඳුන්වන්නේ කුමක්ද?',
    hint: 'Paymaster.',
    solution: 'Paymaster (Paymaster Contract).'
  },
  {
    num: 15,
    title: '15. Web3 Security Auditing, Deployment & Launch Roadmap (Masterclass Capstone)',
    level: 'Pro',
    duration: 'මිනිත්තු 8 (8 min)',
    summary: 'Production Launch Checklist: Slither & Mythril Static Analysis, Echidna Invariant Fuzzing, Professional Audit Firms (OpenZeppelin, Trail of Bits), Multi-Sig Wallets (Safe.global), Timelocks, සහ Continuous Monitoring.',
    analogy: 'Security Audit එකක් කියන්නේ ගුවන් යානයක් පියාසර කිරීමට පෙර ඉංජිනේරුවන් සියලුම පද්ධති ද්විත්ව පරීක්ෂාවකට (Double Check) ලක් කර ආරක්ෂිත බව සහතික කිරීම වැනිය.',
    content: [
      'Static Analysis Tools: Slither මඟින් Vulnerabilities ස්වයංක්‍රීයව හඳුනාගැනීම.',
      'Protocol Governance: Safe Multi-Sig (3-of-5 Signers) සහ Timelock Controllers.',
      'Bug Bounty Programs: Immunefi මඟින් Whitehat Hackers ලා ලවා Protocol එක පරීක්ෂා කිරීම.',
      'Master Certification: සම්පූර්ණ Web3 Developer Roadmap එක සහ DApp Portfolio එක.'
    ],
    keyTakeaways: [
      'කිසිදු Smart Contract එකක් Multi-Sig සහ Timelock නොමැතිව තනි Private Key එකක් මත පාලනය නොකරන්න.',
      'සුබපැතුම්! ඔබ දැන් EVM, Solidity, DApps සහ Security පිළිබඳ සම්පූර්ණ දැනුමක් සතු Certified Web3 Engineer කෙනෙකි.'
    ],
    snippet: `// Slither Static Analysis Terminal Command
// $ slither . --print human-summary
// $ slither . --detect reentrancy-eth,uninitialized-state`,
    prompt: 'Web3 ව්‍යාපෘතියක Admin පාලන යතුරු තනි පුද්ගලයෙකු අත නොතබා කණ්ඩායමේ බහුතරයක අත්සන් අවශ්‍ය වන Wallet එක හඳුන්වන්නේ කුමක්ද?',
    hint: 'Multi-Sig Wallet (Safe).',
    solution: 'Multi-Signature (Multi-Sig) Wallet (e.g. Safe / Gnosis Safe).'
  }
];

// Write Web3 Course
const web3CourseContent = `import { CourseTrackData } from '../../courses.data';

export const WEB3_BLOCKCHAIN_COURSE: CourseTrackData = {
  id: 'web3-blockchain-security',
  title: 'Web3, Blockchain & Smart Contracts: Zero to Hero (15 Lessons)',
  titleSinhala: 'Web3, Blockchain සහ Solidity Smart Contracts: මුල සිට Pro දක්වා (පාඩම් 15)',
  tag: 'Web3',
  category: 'web3',
  targetAudience: 'developers',
  targetAudienceLabel: 'Blockchain Developers & Engineers',
  level: 'Beginner to Pro (ආරම්භකයේ සිට උසස් මට්ටම දක්වා)',
  icon: 'currency_bitcoin',
  gradient: 'bg-gradient-to-tr from-amber-500 via-orange-600 to-purple-700',
  badgeName: 'Web3 Architect',
  totalDuration: 'පැය 4.0 (පාඩම් 15)',
  description: 'The definitive 15-lesson Ethereum, Solidity, EVM, DeFi security, L2 Rollups, and Full-Stack DApp engineering masterclass.',
  descriptionSinhala: 'Blockchain මූලධර්ම, EVM Architecture, Solidity 0.8+, ERC-20/721 Token Standards, Foundry Testing, Wagmi/Viem Full-Stack DApps, Reentrancy Security සහ Account Abstraction (ERC-4337) දක්වා පාඩම් 15ක සම්පූර්ණ මාලාව.',
  lessons: ${JSON.stringify(web3Lessons.map((l) => ({
    id: `w3-${l.num}`,
    title: l.title,
    level: l.level,
    duration: l.duration,
    summary: l.summary,
    analogy: l.analogy,
    content: l.content,
    keyTakeaways: l.keyTakeaways,
    codeSnippet: l.snippet,
    exercise: {
      prompt: l.prompt,
      hint: l.hint,
      solution: l.solution
    }
  })), null, 2)}
};
`;

fs.writeFileSync(path.join(outDir, 'web3-blockchain.ts'), web3CourseContent);
console.log('Created web3-blockchain.ts (15 lessons)');
