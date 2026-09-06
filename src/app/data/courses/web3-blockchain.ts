import { CourseTrackData } from '../../courses.data';

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
  lessons: [
  {
    "id": "w3-1",
    "title": "01. Blockchain කියන්නේ ඇත්තටම මොකක්ද? (Decentralization & Distributed Ledgers)",
    "level": "Beginner",
    "duration": "මිනිත්තු 7 (7 min)",
    "summary": "Blockchain තාක්ෂණයේ මූලික පදනම: Centralized vs Decentralized Databases, Distributed Ledger Technology (DLT), Immutable Blocks, සහ Cryptographic Hashes (SHA-256).",
    "analogy": "සාමාන්‍ය බැංකුවක් කියන්නේ එක් මුදලාලි කෙනෙකු ළඟ ඇති තනි ලෙජර් පොතක් වගේ; Blockchain කියන්නේ ගමේ සියලුම දෙනා ළඟ එක සමාන ලෙජර් පොත් තිබී සෑම ගනුදෙනුවක්ම සැවොම එකවර සටහන් කරගන්නා වංචා කළ නොහැකි පොදු පොතක් වැනිය.",
    "content": [
      "Centralized (තනි Server එකක්) vs Decentralized (ලොව පුරා Node දහස් ගණනක්).",
      "Cryptographic Hashing (SHA-256): කුඩා වෙනසක් කළද සම්පූර්ණ Hash එක වෙනස් වීම (Avalanche Effect).",
      "Genesis Block සහ Blocks එකිනෙක Previous Hash මඟින් දම්වැලක් සේ බැඳීම.",
      "Immutability: එක් වරක් ලියූ දත්ත කිසිවෙකුට මකා දැමීමට හෝ සංශෝධනය කිරීමට නොහැකි වීම."
    ],
    "keyTakeaways": [
      "Blockchain එකක ඇති ප්‍රධානතම ලක්ෂණය වන්නේ අතරමැදියන් (Intermediaries) නොමැතිව විශ්වාසය (Trustless Consensus) තහවුරු කිරීමයි.",
      "දත්ත වෙනස් කිරීමට උත්සාහ කළහොත් Hash පරතරය නිසා මුළු ජාලයම එම වෙනස ප්‍රතික්ෂේප කරයි."
    ],
    "codeSnippet": "// Concept: Cryptographic Block Hash\nimport crypto from 'crypto';\n\nfunction calculateHash(index, previousHash, timestamp, data) {\n  return crypto\n    .createHash('sha256')\n    .update(index + previousHash + timestamp + JSON.stringify(data))\n    .digest('hex');\n}\n\nconst genesisHash = calculateHash(0, \"0\", \"2009-01-03\", { msg: \"Genesis Block\" });\nconsole.log(\"Genesis Hash:\", genesisHash);",
    "exercise": {
      "prompt": "Blockchain එකක දත්ත කිසිවෙකුට සංශෝධනය කළ නොහැකි වීමට හේතු වන ගුණය කුමක්ද?",
      "hint": "Immutability (නොවෙනස්වන බව).",
      "solution": "Immutability (නොවෙනස්වන සුළු බව - දත්ත Hash මඟින් පෙර Block එකට බැඳී ඇති බැවිනි)."
    }
  },
  {
    "id": "w3-2",
    "title": "02. Cryptography, Public/Private Keys, Wallets & Digital Signatures",
    "level": "Beginner",
    "duration": "මිනිත්තු 7 (7 min)",
    "summary": "Asymmetric Cryptography (Elliptic Curve Cryptography - secp256k1), Public Key (Wallet Address), Private Key (රහස් යතුර), Seed Phrase (BIP-39 Mnemonic), සහ Digital Signatures.",
    "analogy": "Public Address එක කියන්නේ ඔබේ බැංකු ගිණුම් අංකය වගේ (ඕනෑම කෙනෙකුට මුදල් එවීමට දිය හැක); Private Key / Seed Phrase එක කියන්නේ ATM Card එකේ රහස් PIN අංකය සහ ලොකර් යතුර වගේ (කිසිවෙකුට නොදිය යුතුය).",
    "content": [
      "Public Key vs Private Key ගණිතමය සම්බන්ධය.",
      "Non-Custodial Wallets (Metamask, Rabby, Ledger) vs Custodial (Binance, Coinbase).",
      "Seed Phrase (12/24 words): අස්ථානගත වූ Wallet එකක් නැවත ලබාගැනීමේ එකම ක්‍රමය.",
      "Transactions Sign කිරීම සහ Gas Fee ගණනය කිරීම."
    ],
    "keyTakeaways": [
      "\"Not your keys, not your crypto\" - ඔබ සතුව Private Key නොමැති නම් එම මුදල්වල සැබෑ අයිතිකරු ඔබ නොවේ.",
      "Seed Phrase කිසිවිටෙක Screenshot ගසා හෝ Cloud වල නොතබා කඩදාසියක ලියා සුරක්ෂිතව තබන්න."
    ],
    "codeSnippet": "// Asymmetric Key Pair Concept\n// Public Address: 0x71C...392 (Safe to share)\n// Private Key: 0x4f3...a12 (NEVER SHARE!)\n// Transaction Signature: Signature = Sign(TxData, PrivateKey)",
    "exercise": {
      "prompt": "Crypto Wallet එකක් ප්‍රතිසාධනය කරගත හැකි වචන 12 හෝ 24ක රහස් වැකිය හඳුන්වන්නේ කුමන නමින්ද?",
      "hint": "Seed Phrase / Mnemonic.",
      "solution": "Seed Phrase / Secret Recovery Mnemonic Phrase."
    }
  },
  {
    "id": "w3-3",
    "title": "03. Consensus Mechanisms: Proof of Work (PoW) vs Proof of Stake (PoS)",
    "level": "Beginner",
    "duration": "මිනිත්තු 7 (7 min)",
    "summary": "Decentralized එකඟතාව (Consensus): Bitcoin PoW (Mining, ASICs, 51% Attack resistance) vs Ethereum PoS (Validators, Staking 32 ETH, Slashing, 99.95% Energy Reduction).",
    "analogy": "PoW කියන්නේ දුෂ්කර ගණිත ගැටලුවක් මුලින්ම විසඳූ කෙනාට තෑග්ග දෙන තරඟයක් වගේ; PoS කියන්නේ තමන්ගේම මුදල් ඇපයට (Stake) තබා වංචාවක් නොකරන බවට දිවුරා තීරණ ගන්නා ක්‍රමයක් වැනිය.",
    "content": [
      "Byzantine Generals Problem සහ Distributed Consensus විසඳුම.",
      "Proof of Work: Mining Difficulty, Nonce සෙවීම සහ Energy Consumption.",
      "Proof of Stake: Validators, Block Proposing, Attestations සහ Slashing දඩුවම්.",
      "The Ethereum Merge: PoW සිට PoS වෙත පරිවර්තනය වීම."
    ],
    "keyTakeaways": [
      "PoS මඟින් පරිසර හිතකාමී ලෙස සහ දැවැන්ත විදුලි පරිභෝජනයකින් තොරව Blockchain ආරක්ෂාව තහවුරු කරයි.",
      "Slashing මඟින් වංචනික Validator වරුන්ගේ Staked ETH රාජසන්තක කරයි."
    ],
    "codeSnippet": "// Proof of Work Simple Nonce Mining Loop\nfunction mineBlock(previousHash, data, difficulty) {\n  let nonce = 0;\n  const targetPrefix = '0'.repeat(difficulty);\n  while (true) {\n    const hash = calculateHash(nonce, previousHash, data);\n    if (hash.startsWith(targetPrefix)) {\n      return { nonce, hash };\n    }\n    nonce++;\n  }\n}",
    "exercise": {
      "prompt": "Ethereum ජාලය Proof of Stake (PoS) වෙත මාරු වීමෙන් පසු විදුලි පරිභෝජනය කොපමණ ප්‍රතිශතයකින් අඩු වියද?",
      "hint": "99% කට වඩා වැඩි අගයක්.",
      "solution": "99.95% කින් පමණ විදුලි පරිභෝජනය අඩු විය."
    }
  },
  {
    "id": "w3-4",
    "title": "04. Ethereum & EVM (Ethereum Virtual Machine) Architecture",
    "level": "Beginner",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Ethereum යනු ලෝක පරිගණකයයි (The World Computer): EVM Opcodes, State Transition Machine, Account-Based Model (EOA vs Contract Accounts), සහ Gas Mechanics (BaseFee + PriorityFee).",
    "analogy": "EVM කියන්නේ ලොව පුරා ඇති පරිගණක දහස් ගණනක එකවර ධාවනය වන තනි අතථ්‍ය සුපිරි පරිගණකයක් (Global Supercomputer) වැනිය.",
    "content": [
      "EOA (Externally Owned Accounts - Private Key මඟින් පාලනය වන) vs Contract Accounts.",
      "EVM Stack, Memory, Storage (Expensive Persistent Data) සහ Calldata.",
      "Gas Limit vs Gas Price (Gwei) සහ EIP-1559 Dynamic Fee Model.",
      "Smart Contracts Deploy වන Bytecode සහ ABI (Application Binary Interface)."
    ],
    "keyTakeaways": [
      "Storage වල දත්ත ලිවීම ඉතා මිල අධිකය (SSTORE = 20,000 Gas), එබැවින් Smart Contracts Optimize කළ යුතුය.",
      "ABI මඟින් Frontend එකට Smart Contract එකේ Methods හඳුනා ගැනීමට ඉඩ සලසයි."
    ],
    "codeSnippet": "// Ethereum Gas Calculation (EIP-1559)\n// Total Fee = Gas Units * (Base Fee + Priority Fee)\n// Example: 21,000 * (15 Gwei + 2 Gwei) = 357,000 Gwei (0.000357 ETH)",
    "exercise": {
      "prompt": "Ethereum හි සාමාන්‍ය පරිශීලකයෙකුගේ Wallet ගිණුමක් හඳුන්වන කෙටි නම කුමක්ද?",
      "hint": "EOA (Externally Owned Account).",
      "solution": "EOA (Externally Owned Account)."
    }
  },
  {
    "id": "w3-5",
    "title": "05. Solidity Fundamentals: Syntax, State Variables, Data Types & Visibility",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Solidity 0.8+: SPDX-License-Identifier, pragma solidity, uint256, address, bool, bytes, State Variables vs Local Variables, Visibility (public, private, internal, external), සහ view/pure Functions.",
    "analogy": "Smart Contract එකක් කියන්නේ කිසිදු නීතිඥයෙකුට හෝ දේශපාලනඥයෙකුට වෙනස් කළ නොහැකි, කේතයෙන්ම ලියූ ස්වයංක්‍රීය ඩිජිටල් ගිවිසුමකි.",
    "content": [
      "Data Types: uint256, int256, address (msg.sender, address(this)), bool, string.",
      "Visibility Modifiers: public, external (Gas efficient for external calls), internal, private.",
      "view (දත්ත කියවීම පමණක් - Zero Gas for read) vs pure (දත්ත කියවීමක් හෝ ලිවීමක් නැත) vs State-modifying.",
      "Solidity 0.8+ හි SafeMath ස්වයංක්‍රීය Overflow/Underflow ආරක්ෂාව."
    ],
    "keyTakeaways": [
      "view සහ pure functions external calls වලදී Gas වැය නොවේ.",
      "Solidity 0.8+ සිට Integer Overflow ස්වයංක්‍රීයව revert වේ."
    ],
    "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract SimpleStorage {\n    // State variable stored permanently on-chain\n    uint256 private _favoriteNumber;\n    address public immutable owner;\n\n    event NumberUpdated(uint256 newNumber, address indexed updatedBy);\n\n    constructor() {\n        owner = msg.sender;\n    }\n\n    function setNumber(uint256 newNum) external {\n        _favoriteNumber = newNum;\n        emit NumberUpdated(newNum, msg.sender);\n    }\n\n    function getNumber() external view returns (uint256) {\n        return _favoriteNumber;\n    }\n}",
    "exercise": {
      "prompt": "Blockchain හි දත්ත වෙනස් නොකර කියවීම පමණක් සිදුකරන Solidity function එකකට යොදන modifier එක කුමක්ද?",
      "hint": "view modifier එක.",
      "solution": "view modifier එක (external call වලදී Gas ගාස්තු අය නොවේ)."
    }
  },
  {
    "id": "w3-6",
    "title": "06. Mappings, Structs, Arrays & Events in Solidity",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Solidity Data Structures: Mappings (`mapping(address => uint256)` Hash Tables), Structs (Custom Entities), Dynamic & Fixed Arrays, Enums, සහ On-Chain Indexable Events (emit).",
    "analogy": "Mapping එකක් කියන්නේ දැවැන්ත නාමාවලියක් වගේ: Wallet Address එක ලබාදුන් සැනින් O(1) කාලයකින් ඔහුගේ ශේෂය (Balance) ලබාගත හැක.",
    "content": [
      "Mappings: mapping(address => uint256) public balances.",
      "Nested Mappings: mapping(address => mapping(address => bool)) allowances.",
      "Structs: User Profile හෝ Order Data එක තැනකට ගොනු කිරීම.",
      "Events & indexed parameters: Off-chain Apps (The Graph/Frontend) වලට Event Logs Listen කිරීමට ඉඩදීම."
    ],
    "keyTakeaways": [
      "Mappings වල keys list එකක් iteration කළ නොහැක; ඒ සඳහා Array එකක් සමඟ ඒකාබද්ධ කළ යුතුය.",
      "Event එකක indexed parameters 3ක් දක්වා ලබාදිය හැකි අතර ඒවා Frontend එකෙන් Filter කළ හැක."
    ],
    "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract UserRegistry {\n    struct UserProfile {\n        string username;\n        uint256 joinedAt;\n        bool isVerified;\n    }\n\n    mapping(address => UserProfile) public users;\n    event UserRegistered(address indexed userAddress, string username);\n\n    function register(string calldata _username) external {\n        require(bytes(_username).length > 0, \"Username empty\");\n        require(users[msg.sender].joinedAt == 0, \"Already registered\");\n\n        users[msg.sender] = UserProfile({\n            username: _username,\n            joinedAt: block.timestamp,\n            isVerified: true\n        });\n\n        emit UserRegistered(msg.sender, _username);\n    }\n}",
    "exercise": {
      "prompt": "Smart Contract එකක Mapping එකක ඇති සියලුම Keys එකවර loop කිරීමට කෙලින්ම හැකිද?",
      "hint": "Mappings do not store keys list.",
      "solution": "නැත, Mapping එකක keys ලැයිස්තුවක් නොමැති බැවින් වෙනම Array එකක් තබාගත යුතුය."
    }
  },
  {
    "id": "w3-7",
    "title": "07. Modifiers, Error Handling (require, revert, Custom Errors) & msg.value Payments",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Solidity Access Control & Security: Custom Function Modifiers (`onlyOwner`), `require()` vs `revert CustomError()` (Gas Savings), `msg.value` (Payable Functions), සහ ETH Transfers (`call{value: ...}(\"\")`).",
    "analogy": "Modifier එකක් කියන්නේ ප්‍රවේශ පත්‍ර පරීක්ෂකවරයෙක් වගේ: Function එක ඇතුළට යාමට පෙර ඔබ අයිතිකරුදැයි බලා (onlyOwner) පසුව පමණක් දොර විවෘත කරයි (`_;`).",
    "content": [
      "Function Modifiers and the Merge Point (`_;`).",
      "Gas Efficient Custom Errors: error Unauthorized(); if (!isOwner) revert Unauthorized();.",
      "Payable Functions: Contract එකට සැබෑ ETH මුදල් භාරගැනීම.",
      "ETH Withdrawals: (bool sent, ) = recipient.call{value: amount}(\"\"); require(sent, \"Failed\");."
    ],
    "keyTakeaways": [
      "String error messages සහිත require() වෙනුවට Custom Errors (revert NotOwner()) යෙදීමෙන් Gas විශාල ලෙස ඉතිරි වේ.",
      "transfer() හෝ send() වෙනුවට සැමවිටම recipient.call{value: amount}(\"\") භාවිතා කරන්න."
    ],
    "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nerror NotOwner();\nerror InsufficientPayment(uint256 provided, uint256 required);\n\ncontract Crowdfund {\n    address public immutable owner;\n    uint256 public constant TICKET_PRICE = 0.05 ether;\n\n    modifier onlyOwner() {\n        if (msg.sender != owner) revert NotOwner();\n        _;\n    }\n\n    constructor() {\n        owner = msg.sender;\n    }\n\n    function buyTicket() external payable {\n        if (msg.value < TICKET_PRICE) {\n            revert InsufficientPayment(msg.value, TICKET_PRICE);\n        }\n    }\n\n    function withdraw() external onlyOwner {\n        (bool success, ) = owner.call{value: address(this).balance}(\"\");\n        require(success, \"Withdraw failed\");\n    }\n}",
    "exercise": {
      "prompt": "Solidity 0.8+ හි String require statements වෙනුවට Custom Errors භාවිතයේ ප්‍රධාන වාසිය කුමක්ද?",
      "hint": "Gas Optimization.",
      "solution": "Deployment සහ Execution වලදී Gas ගාස්තු සැලකිය යුතු ලෙස ඉතිරි වීම."
    }
  },
  {
    "id": "w3-8",
    "title": "08. ERC-20 Token Standard: Fungible Crypto Tokens නිර්මාණය කරමු",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "ERC-20 Token සම්මතය: OpenZeppelin ERC20 Implementation, totalSupply, balanceOf, transfer, approve, allowance, transferFrom, සහ Decimals (18 Decimals).",
    "analogy": "ERC-20 Token එකක් කියන්නේ කැසිනෝ ශාලාවක භාවිත වන Poker Chips හෝ රටක භාවිත වන මුදල් නෝට්ටු වගේ: සෑම Token එකක්ම තවත් Token එකකට 100% ක් සමාන වේ (Fungible).",
    "content": [
      "ERC-20 Interface (IERC20) සහ OpenZeppelin Contracts භාවිතය.",
      "Decimals (10^18) ගණනය: 1 Token = 1000000000000000000 Wei.",
      "Approve & TransferFrom Pattern: Uniswap / DEXs වලට ඔබේ Tokens හුවමාරු කිරීමට අවසර දීම.",
      "_mint() සහ _burn() Functions මඟින් Token Supply පාලනය."
    ],
    "keyTakeaways": [
      "ස්වයංක්‍රීයව ERC-20 Tokens ලිවීමට වඩා OpenZeppelin audited libraries භාවිතා කිරීම ඉහළම ආරක්ෂාව ලබා දෙයි.",
      "DEX එකක Token Swap කිරීමට පෙර පරිශීලකයා approve() Transaction එකක් අත්සන් කළ යුතුය."
    ],
    "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\n\ncontract MyFeedToken is ERC20, Ownable {\n    constructor() ERC20(\"MyFeed Utility\", \"MFEED\") Ownable(msg.sender) {\n        // Mint 1,000,000 MFEED to creator (18 decimals)\n        _mint(msg.sender, 1_000_000 * 10 ** decimals());\n    }\n\n    function mint(address to, uint256 amount) external onlyOwner {\n        _mint(to, amount);\n    }\n}",
    "exercise": {
      "prompt": "ERC-20 Tokens වල සම්මත දශමස්ථාන (Decimals) ගණන සාමාන්‍යයෙන් කීයද?",
      "hint": "18 Decimals (Wei unit).",
      "solution": "18 Decimals (1 Ether = 10^18 Wei)."
    }
  },
  {
    "id": "w3-9",
    "title": "09. ERC-721 & ERC-1155 NFT Standards: Digital Assets & On-Chain Metadata",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Non-Fungible Tokens (NFTs): ERC-721 (Unique Token IDs, ownerOf, safeTransferFrom), IPFS TokenURI JSON Metadata, Royalty Standards (EIP-2981), සහ ERC-1155 Multi-Token Standard.",
    "analogy": "ERC-721 NFT එකක් කියන්නේ මොනාලිසා මුල් සිතුවම හෝ ඔප්පුවක් වගේ: සෑම Token එකකටම අනන්‍ය Token ID එකක් සහ හිමිකරුවෙකු ඇත (Non-Fungible).",
    "content": [
      "ERC-721 vs ERC-20 වෙනස.",
      "TokenURI සහ IPFS Decentralized Storage (Pinata / Arweave) මඟින් Image/Metadata ගබඩා කිරීම.",
      "safeTransferFrom() මඟින් වැරදි Contract වලට NFT හිරවීම වැළැක්වීම.",
      "ERC-1155: Gaming items (Fungible Gold + Non-fungible Swords) තනි Contract එකකින් හැසිරවීම."
    ],
    "keyTakeaways": [
      "NFT Metadata කිසිවිටෙක Centralized AWS Server එකක නොතබා IPFS හෝ Arweave මත තබන්න.",
      "ERC-1155 මඟින් Batch Transfers මඟින් Gas 90% දක්වා ඉතිරි කරගත හැක."
    ],
    "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol\";\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\n\ncontract CertificateNFT is ERC721URIStorage, Ownable {\n    uint256 private _nextTokenId;\n\n    constructor() ERC721(\"MyFeed Certificate\", \"MFCERT\") Ownable(msg.sender) {}\n\n    function mintCertificate(address student, string memory metadataUri) external onlyOwner returns (uint256) {\n        uint256 tokenId = _nextTokenId++;\n        _safeMint(student, tokenId);\n        _setTokenURI(tokenId, metadataUri);\n        return tokenId;\n    }\n}",
    "exercise": {
      "prompt": "NFT එකක පින්තූරය සහ ගුණාංග විස්තර වන JSON ලිපිනය ලබාදෙන ERC-721 method එක කුමක්ද?",
      "hint": "tokenURI(tokenId).",
      "solution": "tokenURI(uint256 tokenId)"
    }
  },
  {
    "id": "w3-10",
    "title": "10. Hardhat & Foundry: Smart Contract Testing & Local Blockchain Deployment",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Professional Smart Contract Development Tools: Foundry (Rust-based, Solidity Tests, Fuzzing) vs Hardhat (TypeScript, Mocha/Chai, Ethers.js), Local Anvil/Hardhat Nodes, සහ Gas Profiling.",
    "analogy": "Foundry කියන්නේ රොකට්ටුවක් උඩුගුවනට යැවීමට පෙර සුළං උමඟක (Wind Tunnel) දමා සිදුකරන දැඩි ආරක්‍ෂක පරීක්ෂණ පද්ධතියක් වැනිය.",
    "content": [
      "Foundry Setup: `forge init`, `forge build`, `forge test`.",
      "Solidity Tests: `function test_RevertWhen_NonOwnerWithdraws() public`.",
      "Fuzz Testing: `testFuzz_Deposit(uint256 amount)` මඟින් අහඹු අගයන් මිලියන ගණනකින් Bugs සෙවීම.",
      "Deployment Scripts: `forge script script/Deploy.s.sol --rpc-url sepolia --broadcast`."
    ],
    "keyTakeaways": [
      "Foundry මඟින් Solidity වලින්ම Tests ලිවිය හැකි බැවින් Context Switching නොමැතිව 10x වේගයෙන් පරීක්ෂා කළ හැක.",
      "Mainnet එකට Deploy කිරීමට පෙර 100% Code Coverage සහ Fuzz Tests සමත් විය යුතුය."
    ],
    "codeSnippet": "// Foundry Solidity Test Example\nimport \"forge-std/Test.sol\";\nimport \"../src/SimpleStorage.sol\";\n\ncontract SimpleStorageTest is Test {\n    SimpleStorage public storageContract;\n    address user = address(0xABCD);\n\n    function setUp() public {\n        storageContract = new SimpleStorage();\n    }\n\n    function testSetNumber() public {\n        vm.prank(user); // Simulate caller as 'user'\n        storageContract.setNumber(42);\n        assertEq(storageContract.getNumber(), 42);\n    }\n}",
    "exercise": {
      "prompt": "Foundry හි විවිධ අහඹු සංඛ්‍යා (Random values) දහස් ගණනක් ඇතුල් කර Smart Contract එකේ දෝෂ සෙවීමේ ක්‍රමය හඳුන්වන්නේ කුමන නමින්ද?",
      "hint": "Fuzz Testing.",
      "solution": "Fuzz Testing (Fuzzing)."
    }
  },
  {
    "id": "w3-11",
    "title": "11. Web3 Frontend Integration: Wagmi, Viem, RainbowKit & React Hooks",
    "level": "Intermediate",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Full-Stack DApp Development: Viem (TypeScript Interface for Ethereum), Wagmi React Hooks (`useAccount`, `useReadContract`, `useWriteContract`), සහ RainbowKit / AppKit Wallet Connection Modals.",
    "analogy": "Wagmi කියන්නේ සම්ප්‍රදායික Web App එක සහ Blockchain ලෝකය එකිනෙක අමුණන විශ්වීය පාලම (Universal Adapter) වැනිය.",
    "content": [
      "Viem vs Ethers.js: Lightweight, Tree-shakeable, Pure TypeScript.",
      "Wagmi Configuration: createConfig with chains (mainnet, sepolia, arbitrum).",
      "useReadContract: On-chain balances සහ state live කියවීම.",
      "useWriteContract & useWaitForTransactionReceipt: Transactions යවා Loading Indicators පෙන්වීම."
    ],
    "keyTakeaways": [
      "නවීන Production DApps සඳහා පැරණි Ethers.js v5 වෙනුවට Viem සහ Wagmi v2 භාවිතා කරන්න.",
      "Wallet Disconnect සහ Network Switch (Change Chain) අවස්ථා Frontend එකේ සුමටව Handle කරන්න."
    ],
    "codeSnippet": "import { useAccount, useReadContract, useWriteContract } from 'wagmi';\nimport { parseEther } from 'viem';\n\nexport function MintButton({ contractAddress, abi }) {\n  const { isConnected } = useAccount();\n  const { writeContract, isPending } = useWriteContract();\n\n  const handleMint = () => {\n    writeContract({\n      address: contractAddress,\n      abi: abi,\n      functionName: 'mint',\n      args: ['0xUser...'],\n      value: parseEther('0.01'),\n    });\n  };\n\n  if (!isConnected) return <p>Please connect wallet</p>;\n  return (\n    <button onClick={handleMint} disabled={isPending}>\n      {isPending ? 'Minting On-Chain...' : 'Mint NFT (0.01 ETH)'}\n    </button>\n  );\n}",
    "exercise": {
      "prompt": "නවීන React DApp එකක Wallet එකක් සම්බන්ධ වී ඇත්දැයි දැනගැනීමට Wagmi හි භාවිතා කරන Hook එක කුමක්ද?",
      "hint": "useAccount() hook එක.",
      "solution": "useAccount() hook එක (const { isConnected, address } = useAccount();)."
    }
  },
  {
    "id": "w3-12",
    "title": "12. Smart Contract Security & Common Hacks (Reentrancy, Front-running & Oracles)",
    "level": "Pro",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "බිලියන ගණනක Crypto සොරකම් වැළැක්වීම: Reentrancy Attack (The DAO Hack) සහ ReentrancyGuard, Checks-Effects-Interactions Pattern, Flash Loan Price Manipulation, සහ Chainlink Decentralized Oracles.",
    "analogy": "Reentrancy කියන්නේ බැංකු ලිපිකරු මුදල් අඩු කිරීමට පෙර (Balance Update) පාරිභෝගිකයා වේගයෙන් නැවත නැවත මුදල් ඉල්ලා මුළු බැංකුවම හිස් කරන හොරකමක් වැනිය.",
    "content": [
      "The Famous DAO Hack & Reentrancy Vulnerability.",
      "Checks-Effects-Interactions Pattern: ප්‍රථමයෙන් State එක Update කර පසුව පමණක් බාහිර Call කිරීම.",
      "OpenZeppelin ReentrancyGuard: nonReentrant modifier භාවිතය.",
      "Chainlink Price Feeds: DEX Spot Prices විශ්වාස නොකර On-chain Real-world Data ලබාගැනීම."
    ],
    "keyTakeaways": [
      "බාහිර Contract වලට ETH හෝ Token යැවීමට පෙර සැමවිටම Internal Balance එක 0 කරන්න (Checks-Effects-Interactions).",
      "DeFi Price Calculations සඳහා Uniswap Pool Spot Reserves කෙලින්ම භාවිතා නොකරන්න (Flash Loan Attack Risk)."
    ],
    "codeSnippet": "// SECURE: Checks-Effects-Interactions Pattern\nmapping(address => uint256) public balances;\n\nfunction withdraw() external nonReentrant {\n    // 1. CHECKS\n    uint256 amount = balances[msg.sender];\n    require(amount > 0, \"No balance\");\n\n    // 2. EFFECTS (Update state FIRST)\n    balances[msg.sender] = 0;\n\n    // 3. INTERACTIONS (External call LAST)\n    (bool success, ) = msg.sender.call{value: amount}(\"\");\n    require(success, \"Transfer failed\");\n}",
    "exercise": {
      "prompt": "Reentrancy ප්‍රහාරයකින් ආරක්ෂා වීමට අනුගමනය කළ යුතු ප්‍රධානතම කේත සැකසුම් රටාව (Pattern) කුමක්ද?",
      "hint": "Checks-Effects-Interactions Pattern.",
      "solution": "Checks-Effects-Interactions Pattern (සහ ReentrancyGuard modifier)."
    }
  },
  {
    "id": "w3-13",
    "title": "13. Layer 2 Scaling Solutions: Rollups (Optimistic vs ZK-Rollups) & Arbitrum / Base",
    "level": "Pro",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Ethereum Scalability: Blockchain Trilemma, Layer 2 (L2) Rollups, Optimistic Rollups (Arbitrum, Optimism, Base - Fraud Proofs & 7-day challenge period) vs Zero-Knowledge (ZK) Rollups (zkSync, Starknet, Polygon zkEVM - Validity Proofs / ZK-SNARKs).",
    "analogy": "L2 Rollup එකක් කියන්නේ අධිවේගී මාර්ගයක වාහන 100ක් තනි තනිව ගමන් කර තදබදය හදනවා වෙනුවට සියල්ලන්ම අධිවේගී දුම්රියකට (Batch) පටවා ගමනාන්තයට ගෙන යාම වැනිය.",
    "content": [
      "The Blockchain Trilemma: Decentralization, Security, Scalability.",
      "L1 Data Availability & EIP-4844 Proto-Danksharding (Blobs) මඟින් ගාස්තු 95% කින් අඩු වීම.",
      "Optimistic Rollups: Fraud Proofs සහ Canonical Bridge.",
      "ZK-Rollups: Cryptographic ZK-SNARK / STARK Validity Proofs මඟින් ක්ෂණික Finality."
    ],
    "keyTakeaways": [
      "Layer 2 මඟින් Ethereum Mainnet එකේ ඉහළ ආරක්ෂාව එලෙසම තබාගනිමින් ගනුදෙනු ගාස්තුව ශත ගණනක් දක්වා අඩු කරයි.",
      "EIP-4844 Blobs හඳුන්වා දීමෙන් පසු L2 ගනුදෙනු ගාස්තු $0.01 ට වඩා අඩු විය."
    ],
    "codeSnippet": "// Layer 2 Gas comparison\n// Ethereum L1 Swap: ~$5.00 - $30.00\n// Arbitrum / Base L2 Swap: ~$0.01 - $0.05 (100x Cheaper)",
    "exercise": {
      "prompt": "ZK-Rollups වලදී ගනුදෙනු වල නිවැරදිභාවය තහවුරු කිරීමට යොදාගන්නා ගණිතමය සාක්ෂිය හඳුන්වන්නේ කුමන නමින්ද?",
      "hint": "Validity Proofs (ZK-SNARKs).",
      "solution": "Validity Proofs (Zero-Knowledge Proofs / ZK-SNARKs)."
    }
  },
  {
    "id": "w3-14",
    "title": "14. Account Abstraction (ERC-4337): Smart Wallets, Social Recovery & Gasless Txns",
    "level": "Pro",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Next Generation Web3 UX: ERC-4337 Account Abstraction, Smart Contract Wallets (Passkey Login, Biometrics), Bundlers, Paymasters (Gasless Transactions / Sponsored Gas in ERC-20), සහ Social Recovery (No Seed Phrases).",
    "analogy": "Account Abstraction කියන්නේ පැරණි යතුරු කට්ටලයක් අතැතිව යාම වෙනුවට ඔබේ ඇස් සලකුණෙන් (FaceID) විවෘත වන සුපිරි ස්මාර්ට් ආරක්ෂිත දොරක් සාදාගැනීම වැනිය.",
    "content": [
      "EOA වල අඩුපාඩු: Seed Phrase අමතක වීම, Gas ගෙවීමට ETH අනිවාර්ය වීම.",
      "ERC-4337 Architecture: UserOperation, Bundler, EntryPoint Contract, Paymaster.",
      "Paymasters: පරිශීලකයා වෙනුවට App එක මඟින් Gas ගාස්තු ගෙවීම (Sponsored Transactions).",
      "Passkey / WebAuthn Signers: FaceID හෝ Fingerprint මඟින් On-chain Transactions අත්සන් කිරීම."
    ],
    "keyTakeaways": [
      "Account Abstraction මඟින් මීළඟ බිලියනයක් පරිශීලකයින්ට Web2 වැනි සුමට අත්දැකීමකින් Web3 වෙත පැමිණීමට මඟ පාදයි.",
      "Paymaster මඟින් පරිශීලකයාට ETH නොමැතිව USDC වලින් Gas ගෙවීමට ඉඩ සලසයි."
    ],
    "codeSnippet": "// ERC-4337 UserOperation Concept\ninterface UserOperation {\n    address sender;\n    uint256 nonce;\n    bytes callData;\n    uint256 callGasLimit;\n    bytes paymasterAndData; // Sponsored Gas logic\n    bytes signature; // Passkey / Multi-sig signature\n}",
    "exercise": {
      "prompt": "ERC-4337 හි පරිශීලකයා වෙනුවට Gas ගාස්තුව ගෙවන (Gasless UX) සංරචකය හඳුන්වන්නේ කුමක්ද?",
      "hint": "Paymaster.",
      "solution": "Paymaster (Paymaster Contract)."
    }
  },
  {
    "id": "w3-15",
    "title": "15. Web3 Security Auditing, Deployment & Launch Roadmap (Masterclass Capstone)",
    "level": "Pro",
    "duration": "මිනිත්තු 8 (8 min)",
    "summary": "Production Launch Checklist: Slither & Mythril Static Analysis, Echidna Invariant Fuzzing, Professional Audit Firms (OpenZeppelin, Trail of Bits), Multi-Sig Wallets (Safe.global), Timelocks, සහ Continuous Monitoring.",
    "analogy": "Security Audit එකක් කියන්නේ ගුවන් යානයක් පියාසර කිරීමට පෙර ඉංජිනේරුවන් සියලුම පද්ධති ද්විත්ව පරීක්ෂාවකට (Double Check) ලක් කර ආරක්ෂිත බව සහතික කිරීම වැනිය.",
    "content": [
      "Static Analysis Tools: Slither මඟින් Vulnerabilities ස්වයංක්‍රීයව හඳුනාගැනීම.",
      "Protocol Governance: Safe Multi-Sig (3-of-5 Signers) සහ Timelock Controllers.",
      "Bug Bounty Programs: Immunefi මඟින් Whitehat Hackers ලා ලවා Protocol එක පරීක්ෂා කිරීම.",
      "Master Certification: සම්පූර්ණ Web3 Developer Roadmap එක සහ DApp Portfolio එක."
    ],
    "keyTakeaways": [
      "කිසිදු Smart Contract එකක් Multi-Sig සහ Timelock නොමැතිව තනි Private Key එකක් මත පාලනය නොකරන්න.",
      "සුබපැතුම්! ඔබ දැන් EVM, Solidity, DApps සහ Security පිළිබඳ සම්පූර්ණ දැනුමක් සතු Certified Web3 Engineer කෙනෙකි."
    ],
    "codeSnippet": "// Slither Static Analysis Terminal Command\n// $ slither . --print human-summary\n// $ slither . --detect reentrancy-eth,uninitialized-state",
    "exercise": {
      "prompt": "Web3 ව්‍යාපෘතියක Admin පාලන යතුරු තනි පුද්ගලයෙකු අත නොතබා කණ්ඩායමේ බහුතරයක අත්සන් අවශ්‍ය වන Wallet එක හඳුන්වන්නේ කුමක්ද?",
      "hint": "Multi-Sig Wallet (Safe).",
      "solution": "Multi-Signature (Multi-Sig) Wallet (e.g. Safe / Gnosis Safe)."
    }
  }
]
};
