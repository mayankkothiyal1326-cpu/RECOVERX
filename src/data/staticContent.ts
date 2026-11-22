import type {
  ActivityEvent,
  AppNotification,
  CaseIncident,
  EvidenceCategory,
  EvidenceItem,
  FraudCategoryId,
  RecoverXState,
} from '../types';

export interface FraudCategoryMeta {
  id: FraudCategoryId;
  name: string;
  shortDesc: string;
  recommendedScenarioId: string;
  iconName:
    | 'Smartphone'
    | 'ShoppingBag'
    | 'TrendingUp'
    | 'ShieldAlert'
    | 'Users'
    | 'Fingerprint'
    | 'Briefcase'
    | 'CreditCard'
    | 'KeyRound'
    | 'AlertTriangle';
}

export const FRAUD_CATEGORIES: FraudCategoryMeta[] = [
  {
    id: 'upi_payment',
    name: 'UPI / Digital Payment Fraud',
    shortDesc: 'Unauthorized UPI transfers, fake collect requests, QR code refund traps, or payment app scams.',
    recommendedScenarioId: 'money_transferred',
    iconName: 'Smartphone',
  },
  {
    id: 'online_shopping',
    name: 'Online Shopping Fraud',
    shortDesc: 'Counterfeit storefronts, non-delivery after payment, or fraudulent marketplace listings.',
    recommendedScenarioId: 'money_transferred',
    iconName: 'ShoppingBag',
  },
  {
    id: 'investment_trading',
    name: 'Investment / Trading Fraud',
    shortDesc: 'Fake stock tips, fraudulent crypto apps, Ponzi groups, or locked withdrawal schemes.',
    recommendedScenarioId: 'money_transferred',
    iconName: 'TrendingUp',
  },
  {
    id: 'digital_arrest',
    name: 'Digital Arrest / Impersonation',
    shortDesc: 'Coercive video calls pretending to be police, customs, courier, or court officials.',
    recommendedScenarioId: 'threats_digital_arrest',
    iconName: 'ShieldAlert',
  },
  {
    id: 'social_media_hack',
    name: 'Social Media Account Hacking',
    shortDesc: 'Hijacked Instagram, WhatsApp, Facebook, X, or LinkedIn accounts messaging your contacts.',
    recommendedScenarioId: 'social_media_hacked',
    iconName: 'Users',
  },
  {
    id: 'identity_theft',
    name: 'Identity Theft',
    shortDesc: 'Misuse of Aadhaar, PAN, passport scans, SIM swaps, or unauthorized loans in your name.',
    recommendedScenarioId: 'identity_misuse',
    iconName: 'Fingerprint',
  },
  {
    id: 'job_internship',
    name: 'Job / Internship Fraud',
    shortDesc: 'Fake hiring portals, prepaid task scams, or upfront registration and equipment fees.',
    recommendedScenarioId: 'money_transferred',
    iconName: 'Briefcase',
  },
  {
    id: 'card_fraud',
    name: 'Credit / Debit Card Fraud',
    shortDesc: 'Unauthorized card charges, skimming, fake KYC calls, or international card misuse.',
    recommendedScenarioId: 'money_transferred',
    iconName: 'CreditCard',
  },
  {
    id: 'otp_account_access',
    name: 'OTP / Account Access Fraud',
    shortDesc: 'Shared OTPs, remote screen-sharing apps (AnyDesk/TeamViewer), or email/bank account takeover.',
    recommendedScenarioId: 'account_compromise',
    iconName: 'KeyRound',
  },
  {
    id: 'other_cyber_fraud',
    name: 'Other Cyber Fraud',
    shortDesc: 'Phishing links, malicious APK installations, ransomware, or other digital fraud incidents.',
    recommendedScenarioId: 'suspicious_links',
    iconName: 'AlertTriangle',
  },
];

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  'Screenshot',
  'Transaction Record',
  'Email',
  'Chat',
  'Phone Number',
  'Website / Link',
  'Document',
  'Other',
];

export interface OfficialResource {
  name: string;
  contact: string;
  href?: string;
  isExternal?: boolean;
  description: string;
}

export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    name: 'Indian Cyber Crime Portal',
    contact: 'https://cybercrime.gov.in/',
    href: 'https://cybercrime.gov.in/',
    isExternal: true,
    description:
      'Official Government of India portal to lodge cyber fraud, financial fraud, and online harassment complaints.',
  },
  {
    name: 'National Cyber Crime Helpline',
    contact: '1930',
    href: 'tel:1930',
    isExternal: false,
    description:
      '24x7 toll-free helpline for reporting cyber financial fraud immediately so authorities can flag suspicious transactions.',
  },
  {
    name: 'Emergency Assistance',
    contact: '112',
    href: 'tel:112',
    isExternal: false,
    description:
      'National emergency response number for immediate personal safety threats, coercion, or urgent police assistance.',
  },
];

export interface EmergencyScenario {
  id: string;
  title: string;
  summary: string;
  urgency: 'Urgent' | 'High Priority' | 'Precautionary';
  urgencyNote: string;
  immediateActions: { id: string; title: string; detail: string }[];
  whatToAvoid: string[];
  evidenceToPreserve: string[];
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'money_transferred',
    title: 'Money transferred or payment fraud',
    summary: 'Immediate containment for unauthorized UPI, bank transfer, card debit, or payment scam.',
    urgency: 'Urgent',
    urgencyNote: 'Act within minutes. Rapid reporting improves the chance of your bank flagging disputed funds.',
    immediateActions: [
      {
        id: 'mt-1',
        title: 'Call your bank or payment provider immediately',
        detail:
          'Use the official phone number printed on the back of your card or inside your verified banking app to report unauthorized transactions and temporarily freeze affected cards or UPI handles.',
      },
      {
        id: 'mt-2',
        title: 'Call the National Cyber Crime Helpline (1930)',
        detail:
          'Report financial cyber fraud on 1930 with your transaction amount, UTR/reference number, bank name, and date/time.',
      },
      {
        id: 'mt-3',
        title: 'File a formal complaint at cybercrime.gov.in',
        detail:
          'Submit a written complaint online on the official Indian Cyber Crime Portal and save your acknowledgement number.',
      },
      {
        id: 'mt-4',
        title: 'Revoke screen-sharing or unknown remote access apps',
        detail:
          'If you installed any remote access or unknown APK app during the call, disconnect from the internet and uninstall it immediately.',
      },
      {
        id: 'mt-5',
        title: 'Update banking PINs, UPI PINs, and net-banking passwords',
        detail:
          'Change credentials from a clean, trusted device and disable international or high-limit card spending temporarily.',
      },
    ],
    whatToAvoid: [
      'Do not call phone numbers found through unverified search ads claiming to be bank support or "fraud recovery agents."',
      'Do not scan another QR code or enter your UPI PIN to "receive a refund" — PINs are only required to send money.',
      'Do not delete SMS alerts, call logs, or payment app transaction histories before saving records.',
      'Do not pay any "processing fee" or "unlock fee" to someone promising to reverse the transaction.',
    ],
    evidenceToPreserve: [
      'Bank statement or UPI transaction receipt showing UTR / RRN number and timestamp',
      'SMS or email debit alerts from your bank',
      'Beneficiary UPI ID, account number, or merchant name',
      'Phone numbers, WhatsApp chats, and call logs of the suspected fraudster',
      'Screenshots of fraudulent websites, payment links, or fake customer care pages',
    ],
  },
  {
    id: 'account_compromise',
    title: 'Suspected account compromise',
    summary: 'Step-by-step response when OTPs were shared or unauthorized logins appeared on email/bank accounts.',
    urgency: 'Urgent',
    urgencyNote: 'Contain primary email and banking access before attackers change recovery details.',
    immediateActions: [
      {
        id: 'ac-1',
        title: 'Secure your primary email account first',
        detail:
          'Change your email password using a strong unique passphrase and sign out of all unrecognized devices.',
      },
      {
        id: 'ac-2',
        title: 'Check mail forwarding rules and recovery contacts',
        detail:
          'Inspect email settings for hidden auto-forwarding rules, filters deleting bank alerts, or unfamiliar recovery phone numbers.',
      },
      {
        id: 'ac-3',
        title: 'Enable app-based Two-Factor Authentication (2FA)',
        detail:
          'Turn on authenticator app or hardware key 2FA on email, banking, cloud storage, and password manager accounts.',
      },
      {
        id: 'ac-4',
        title: 'Alert your bank if financial credentials or OTPs were exposed',
        detail:
          'Request temporary login lock or credential reset through official banking channels and check recent statements.',
      },
      {
        id: 'ac-5',
        title: 'Audit connected third-party apps and OAuth permissions',
        detail:
          'Revoke access for unfamiliar apps in Google, Apple, or Microsoft account security dashboards.',
      },
    ],
    whatToAvoid: [
      'Do not reuse any variant of your old password on other websites.',
      'Do not enter credentials through links received in urgent "account suspended" emails or SMS messages.',
      'Do not ignore unfamiliar login alert emails assuming they were accidental.',
    ],
    evidenceToPreserve: [
      'Login activity logs showing unrecognized IP addresses, devices, and timestamps',
      'Phishing emails (save full message headers if possible) or SMS screenshots',
      'Screenshots of unauthorized setting or recovery email modifications',
      'Records of any unauthorized transactions or purchases',
    ],
  },
  {
    id: 'social_media_hacked',
    title: 'Social media account hacked',
    summary: 'Recover hijacked Instagram, WhatsApp, Facebook, X, or LinkedIn accounts and protect contacts.',
    urgency: 'High Priority',
    urgencyNote: 'Attackers often impersonate you to ask friends and family for urgent money transfers.',
    immediateActions: [
      {
        id: 'sm-1',
        title: 'Warn close contacts via another channel immediately',
        detail:
          'Tell family and colleagues through a phone call or alternate app not to send money or click links sent from your compromised profile.',
      },
      {
        id: 'sm-2',
        title: 'Initiate official platform account recovery',
        detail:
          'Use only the official in-app Help Center or verified platform domain (e.g., instagram.com/hacked, facebook.com/hacked) to report takeover.',
      },
      {
        id: 'sm-3',
        title: 'Check linked email and terminate active sessions',
        detail:
          'If you still have access, immediately terminate all other sessions, change password, and enable 2FA.',
      },
      {
        id: 'sm-4',
        title: 'Report impersonation or extortion on cybercrime.gov.in',
        detail:
          'If the attacker is scamming your contacts or threatening misuse of private photos, file an official cybercrime report.',
      },
    ],
    whatToAvoid: [
      'Do not pay ransom or hire "ethical hackers" on social media promising paid account recovery — these are secondary scams.',
      'Do not share 6-digit WhatsApp registration codes or verification links with anyone.',
      'Do not engage in prolonged arguments with the hijacker.',
    ],
    evidenceToPreserve: [
      'Profile URL, username, and screenshots of unauthorized posts or messages sent to contacts',
      'Security notification emails about email/phone/password changes on the account',
      'Screenshots of any UPI IDs or bank details the hijacker sent to your friends',
    ],
  },
  {
    id: 'identity_misuse',
    title: 'Identity misuse',
    summary: 'Response plan when Aadhaar, PAN, SIM, or personal documents have been leaked or misused.',
    urgency: 'High Priority',
    urgencyNote: 'Check credit records and telecom connections promptly to prevent unauthorized loans or SIM cloning.',
    immediateActions: [
      {
        id: 'id-1',
        title: 'Lock Aadhaar biometrics via official UIDAI portal',
        detail:
          'Use the official myAadhaar portal or mAadhaar app to lock biometric authentication when not needed.',
      },
      {
        id: 'id-2',
        title: 'Verify mobile numbers registered under your ID',
        detail:
          'Check for unauthorized mobile connections issued in your name through official telecom verification portals (such as Sanchar Saathi / TAFCOP).',
      },
      {
        id: 'id-3',
        title: 'Review your credit bureau report for unknown loans',
        detail:
          'Request your credit report from authorized bureaus (CIBIL, Experian, Equifax, CRIF) and dispute any unfamiliar credit inquiries or accounts.',
      },
      {
        id: 'id-4',
        title: 'Lodge an identity theft report through official channels',
        detail:
          'Document when and how the ID copy was exposed and submit a formal complaint on cybercrime.gov.in.',
      },
    ],
    whatToAvoid: [
      'Do not share unmasked Aadhaar/PAN scans on messaging apps or unverified job/loan forms.',
      'Do not ignore sudden loss of mobile network signal — it can indicate a SIM swap attempt.',
    ],
    evidenceToPreserve: [
      'Copies of credit report entries or loan SMS alerts you did not authorize',
      'Screenshots of websites, forms, or chats where documents were requested',
      'Telecom provider tickets or SIM replacement notifications',
    ],
  },
  {
    id: 'threats_digital_arrest',
    title: 'Threats / digital arrest scams',
    summary: 'Immediate guidance for coercive video calls pretending to be police, CBI, customs, or courts.',
    urgency: 'Urgent',
    urgencyNote: 'Indian law enforcement does NOT conduct "digital arrests" or demand money transfers over video calls.',
    immediateActions: [
      {
        id: 'da-1',
        title: 'End the call immediately and disengage',
        detail:
          'Hang up the voice or video call right away. Legitimate police or courts never order you to stay on camera or keep the call secret.',
      },
      {
        id: 'da-2',
        title: 'Do not transfer any "verification" or "bail" money',
        detail:
          'No government agency asks citizens to move savings into a "safe account" or RBI verification account.',
      },
      {
        id: 'da-3',
        title: 'Speak immediately with a trusted family member or friend',
        detail:
          'Scammers rely on isolating victims in panic. Stepping away and talking to someone breaks the psychological pressure.',
      },
      {
        id: 'da-4',
        title: 'Call 112 if facing threats, or 1930 if money was already sent',
        detail:
          'Report coercion or extortion attempts to official emergency services and lodge a cybercrime complaint at cybercrime.gov.in.',
      },
    ],
    whatToAvoid: [
      'Do not stay on video call under intimidation or show Aadhaar, bank passbooks, or PAN on camera.',
      'Do not trust PDF "arrest warrants" or police logos sent via WhatsApp or Skype.',
      'Do not keep the call secret from family as instructed by the caller.',
    ],
    evidenceToPreserve: [
      'Caller phone numbers, Skype/WhatsApp IDs, and call duration logs',
      'Screenshots of fake warrant PDFs, ID badges, or threatening chat messages',
      'Bank account numbers or UPI IDs provided by the caller (if any)',
    ],
  },
  {
    id: 'suspicious_links',
    title: 'Suspicious links or malicious applications',
    summary: 'Contain device exposure after tapping a phishing URL or installing an untrusted APK / remote tool.',
    urgency: 'Precautionary',
    urgencyNote: 'Disconnect first to stop background data exfiltration or SMS OTP forwarding.',
    immediateActions: [
      {
        id: 'sl-1',
        title: 'Disconnect the device from Wi-Fi and mobile data',
        detail:
          'Enable Airplane Mode briefly while reviewing installed apps so malicious software cannot communicate externally.',
      },
      {
        id: 'sl-2',
        title: 'Uninstall unknown apps and revoke Accessibility/Device Admin permissions',
        detail:
          'Check Settings -> Apps and Accessibility Services for unfamiliar apps (fake courier, e-Challan, bank KYC, or remote desktop apps) and remove them.',
      },
      {
        id: 'sl-3',
        title: 'Change sensitive passwords from a separate clean device',
        detail:
          'Update banking, UPI, and primary email passwords using a different, trusted device until the affected device is verified clean.',
      },
      {
        id: 'sl-4',
        title: 'Run a full OS security scan or factory reset if severely compromised',
        detail:
          'Back up only personal photos/documents (not APK files) and perform a factory reset if unknown SMS/app activity persists.',
      },
    ],
    whatToAvoid: [
      'Do not log back into net banking from the suspected device before removing malicious apps.',
      'Do not click "unsubscribe" or re-open the suspicious URL to investigate it.',
      'Do not install unverified "cleaner" apps from third-party websites.',
    ],
    evidenceToPreserve: [
      'Screenshot of the SMS, email, or WhatsApp message containing the malicious link or APK',
      'Exact URL text (copied carefully without opening) and sender ID/number',
      'App name and installation timestamp before uninstalling',
    ],
  },
];

export interface SafetyDomain {
  id: string;
  title: string;
  subtitle: string;
  items: string[];
}

export const SAFETY_DOMAINS: SafetyDomain[] = [
  {
    id: 'account_security',
    title: 'Account Security',
    subtitle: 'Lock down primary logins and recovery channels',
    items: [
      'Change compromised passwords immediately using unique 14+ character passphrases',
      'Review active login sessions and sign out unrecognized devices across Google, Apple, and banking portals',
      'Enable app-based Two-Factor Authentication (2FA) instead of relying solely on SMS',
      'Check account recovery emails, phone numbers, and mail forwarding rules for unauthorized edits',
    ],
  },
  {
    id: 'banking_payments',
    title: 'Banking & Payments',
    subtitle: 'Protect accounts, cards, and UPI access',
    items: [
      'Contact your bank or payment provider strictly through official numbers on your card or official app',
      'Review recent statements, scheduled mandates, and UPI AutoPay permissions carefully',
      'Follow your bank’s instructions to freeze compromised cards, reset UPI PINs, or lower transaction limits',
      'Disable international and tap-to-pay card usage when not actively needed',
    ],
  },
  {
    id: 'device_security',
    title: 'Device Security',
    subtitle: 'Audit phones and laptops for hidden threats',
    items: [
      'Review recently installed applications and remove unfamiliar APK or remote-control tools',
      'Audit sensitive permissions: SMS read access, Accessibility Services, Notification access, and Device Admin',
      'Install pending operating system and browser security updates immediately',
      'Use Play Protect or trusted built-in OS security scanners rather than unverified third-party boosters',
    ],
  },
  {
    id: 'social_media_security',
    title: 'Social Media Security',
    subtitle: 'Prevent hijacking and friend-impersonation scams',
    items: [
      'Secure accounts with unique passwords and two-step verification (including WhatsApp PIN)',
      'Review active login locations and linked desktop/web sessions regularly',
      'Restrict profile privacy settings so personal phone numbers and friend lists are not publicly scraped',
      'Revoke connected third-party apps and browser extensions you no longer recognize',
    ],
  },
];

export interface PersonalSafetyChecklistItem {
  id: string;
  domain: string;
  label: string;
  description: string;
}

export const PERSONAL_SAFETY_CHECKLIST: PersonalSafetyChecklistItem[] = [
  {
    id: 'chk-1',
    domain: 'Account Security',
    label: 'Primary email password updated & unique',
    description: 'Your main email controls password resets for banks and social apps.',
  },
  {
    id: 'chk-2',
    domain: 'Account Security',
    label: 'Two-factor authentication enabled on critical accounts',
    description: 'Authenticator app or passkey enabled for email, cloud, and financial logins.',
  },
  {
    id: 'chk-3',
    domain: 'Account Security',
    label: 'Active sessions and recovery contacts audited',
    description: 'Removed unknown devices and verified no unauthorized forwarding rules exist.',
  },
  {
    id: 'chk-4',
    domain: 'Banking & Payments',
    label: 'Card transaction limits and international usage configured',
    description: 'Domestic and online limits set conservatively inside your banking app.',
  },
  {
    id: 'chk-5',
    domain: 'Banking & Payments',
    label: 'UPI AutoPay mandates and linked bank accounts reviewed',
    description: 'Cancelled any unfamiliar recurring payment mandates.',
  },
  {
    id: 'chk-6',
    domain: 'Banking & Payments',
    label: 'Official bank helpline numbers saved offline',
    description: 'Stored directly from your bank card so you never rely on search ads in an emergency.',
  },
  {
    id: 'chk-7',
    domain: 'Device Security',
    label: 'Removed unknown apps and remote screen-sharing tools',
    description: 'Verified no unauthorized APK, AnyDesk, QuickSupport, or unknown utilities remain.',
  },
  {
    id: 'chk-8',
    domain: 'Device Security',
    label: 'SMS & Accessibility permissions reviewed',
    description: 'Only trusted system apps can read SMS messages or control screen accessibility.',
  },
  {
    id: 'chk-9',
    domain: 'Device Security',
    label: 'Operating system and browser fully updated',
    description: 'Latest security patches applied on phone and primary computer.',
  },
  {
    id: 'chk-10',
    domain: 'Social Media',
    label: 'WhatsApp two-step verification PIN enabled',
    description: 'Prevents unauthorized account re-registration even if an SMS code is intercepted.',
  },
  {
    id: 'chk-11',
    domain: 'Social Media',
    label: 'Social media privacy & linked apps audited',
    description: 'Locked down who can view personal details and removed stale third-party app links.',
  },
  {
    id: 'chk-12',
    domain: 'Identity Protection',
    label: 'Aadhaar biometric lock & credit report checked',
    description: 'Verified no unauthorized loans or unfamiliar SIM cards exist under your identity.',
  },
];

export interface CyberSafetyArticle {
  id: string;
  title: string;
  topic: string;
  readTime: string;
  summary: string;
  whatItIs: string;
  warningSigns: string[];
  howToProtect: string[];
  whatToDoIfAffected: string[];
}

export const CYBER_SAFETY_ARTICLES: CyberSafetyArticle[] = [
  {
    id: 'upi-scams',
    title: 'UPI Scams & QR Refund Traps',
    topic: 'Payments',
    readTime: '3 min read',
    summary: 'How scammers misuse collect requests, QR codes, and fake merchant refunds to drain UPI accounts.',
    whatItIs:
      'UPI fraud occurs when attackers trick users into approving a "Collect Request" or scanning a QR code under the pretext of receiving money, cashback, or a marketplace refund. Entering your UPI PIN always authorizes an outgoing debit—never an incoming credit.',
    warningSigns: [
      'A buyer or support agent sends a QR code asking you to scan it and enter your PIN to receive payment.',
      'Urgent collect requests labeled "Refund", "Cashback", or "Army Officer Purchase".',
      'Fake payment screenshots claiming money was sent while asking you to refund the "extra" amount.',
    ],
    howToProtect: [
      'Remember the golden rule: you never need to enter a UPI PIN or scan a QR code to receive money.',
      'Verify incoming funds directly inside your bank statement, not via forwarded screenshots or SMS text.',
      'Set daily UPI limits aligned with your routine spending.',
    ],
    whatToDoIfAffected: [
      'Call your bank immediately to flag the UTR reference number and dispute the transaction.',
      'Dial 1930 and submit a formal complaint at cybercrime.gov.in as quickly as possible.',
      'Save the UTR ID, beneficiary VPA/UPI handle, and complete chat/call history as evidence.',
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing Links & Fake KYC Portals',
    topic: 'Phishing',
    readTime: '3 min read',
    summary: 'Recognizing spoofed bank domains, electricity disconnection texts, and courier fee links.',
    whatItIs:
      'Phishing uses lookalike websites, emails, or SMS messages disguised as banks, utilities, tax authorities, or delivery firms to steal login credentials, card numbers, and OTPs.',
    warningSigns: [
      'Threats that your bank account, SIM card, or power supply will be disconnected within hours.',
      'Slightly misspelled domains (e.g., hyphenated bank names, .xyz, .top, or shortened URLs).',
      'Forms asking for card CVV, ATM PIN, or net-banking password for "KYC verification".',
    ],
    howToProtect: [
      'Always type your bank URL manually or use the official app from the Play Store / App Store.',
      'Inspect the full sender email domain and link destination before interacting.',
      'Use a password manager—it will refuse to autofill credentials on spoofed lookalike domains.',
    ],
    whatToDoIfAffected: [
      'If you entered credentials, immediately change passwords and notify your bank.',
      'If you downloaded a file or APK from the link, disconnect from the internet and uninstall it.',
      'Capture screenshots of the message and URL without re-entering data, and report the incident.',
    ],
  },
  {
    id: 'digital-arrest-scams',
    title: 'Digital Arrest & Law Enforcement Impersonation',
    topic: 'Impersonation',
    readTime: '4 min read',
    summary: 'Understanding coercive video-call scams posing as police, CBI, customs, or narcotics officials.',
    whatItIs:
      'In a "digital arrest" scam, fraudsters call claiming a parcel, SIM card, or bank account linked to your identity is involved in illegal activity. They move you to a video call featuring staged police backdrops and fake warrants, pressuring you to stay on camera and transfer funds for "RBI verification".',
    warningSigns: [
      'Automated IVR calls claiming a FedEx/DHL courier parcel was seized by customs.',
      'Callers demanding you stay isolated on Skype/WhatsApp video and not inform family members.',
      'Demands to transfer savings into a "government inspection" or "court escrow" account.',
    ],
    howToProtect: [
      'Know that Indian law enforcement agencies never conduct arrests over video calls or demand money transfers to clear charges.',
      'Hang up immediately and verify any claim independently by visiting or calling your local police station.',
      'Share this awareness with elderly family members who are frequently targeted.',
    ],
    whatToDoIfAffected: [
      'Disconnect the call right away and talk to a trusted family member.',
      'If money was transferred, call your bank and helpline 1930 immediately.',
      'Preserve caller numbers, Skype IDs, fake warrant PDFs, and report on cybercrime.gov.in or dial 112 if threatened.',
    ],
  },
  {
    id: 'fake-job-offers',
    title: 'Fake Job Offers & Prepaid Task Scams',
    topic: 'Employment',
    readTime: '3 min read',
    summary: 'Spotting fraudulent remote work offers, review-liking Telegram tasks, and interview fee traps.',
    whatItIs:
      'Job scammers reach out via WhatsApp, Telegram, or spoofed HR emails offering high pay for simple tasks (liking videos, rating hotels) or reputable corporate roles. After small initial payouts to build trust, they demand escalating "security deposits" or "merchant prepaid tasks" to unlock earnings.',
    warningSigns: [
      'Unsolicited job messages from personal WhatsApp numbers or Telegram channels promising ₹5,000+ daily.',
      'Requests to pay registration, laptop, training, or "prepaid task" fees before receiving salary.',
      'Fake dashboards showing large virtual profits that require a "tax fee" to withdraw.',
    ],
    howToProtect: [
      'Legitimate employers never ask candidates to pay money to unlock wages or complete prepaid tasks.',
      'Verify openings on the company’s official careers website and check official corporate email domains.',
      'Never share bank login details or allow others to route funds through your account (money mule risk).',
    ],
    whatToDoIfAffected: [
      'Stop sending further deposits immediately—paying "unlock fees" will not release funds.',
      'Report financial transfers to your bank and helpline 1930.',
      'Archive Telegram usernames, group links, UPI IDs, and payment receipts for your complaint.',
    ],
  },
  {
    id: 'investment-fraud',
    title: 'Investment, Trading & Crypto App Fraud',
    topic: 'Investments',
    readTime: '4 min read',
    summary: 'How fake trading groups and cloned brokerage apps manufacture fabricated returns.',
    whatItIs:
      'Scammers add targets to WhatsApp or Telegram "VIP stock tips" or crypto trading groups impersonating known analysts. Victims are guided to install fake trading apps displaying fabricated profits while real deposits go straight to mule accounts.',
    warningSigns: [
      'Guaranteed or unusually high daily/weekly returns on stocks, IPO allotments, or crypto.',
      'Instructions to install trading apps via direct APK links instead of verified app stores.',
      'Requests to transfer investment funds to rotating personal or unrelated shell company bank accounts.',
    ],
    howToProtect: [
      'Verify broker and advisor registration independently on SEBI’s official website.',
      'Only trade through well-known, officially regulated brokerage applications.',
      'Treat unsolicited "VIP institutional IPO" WhatsApp groups as high-risk red flags.',
    ],
    whatToDoIfAffected: [
      'Do not pay additional "withdrawal taxes" or "margin penalties" demanded by the app.',
      'Report all beneficiary bank accounts and UTR numbers via 1930 and cybercrime.gov.in.',
      'Uninstall any sideloaded trading apps and secure your device.',
    ],
  },
  {
    id: 'identity-theft',
    title: 'Identity Theft & Unauthorized Loans',
    topic: 'Identity',
    readTime: '3 min read',
    summary: 'Protecting Aadhaar, PAN, and personal KYC documents from misuse and synthetic fraud.',
    whatItIs:
      'Identity theft happens when someone uses your personal identifiers—such as PAN, Aadhaar copies, date of birth, or leaked KYC selfies—to open bank accounts, issue SIM cards, or take instant digital loans in your name.',
    warningSigns: [
      'Unexpected credit bureau alerts, loan collection calls, or unfamiliar EMI enquiries.',
      'OTP alerts for financial apps you never signed up for.',
      'Sudden unexplained loss of cellular network signal indicating a potential SIM swap.',
    ],
    howToProtect: [
      'Use Masked Aadhaar whenever full number disclosure is not legally required, and lock biometrics via UIDAI.',
      'Check your credit report periodically for unauthorized accounts.',
      'Avoid uploading ID scans to unverified websites or public cloud links.',
    ],
    whatToDoIfAffected: [
      'Check registered mobile numbers via official telecom portals and lock Aadhaar biometrics.',
      'File formal disputes with affected lenders and credit bureaus in writing.',
      'Submit an identity theft complaint on cybercrime.gov.in with supporting documentation.',
    ],
  },
  {
    id: 'account-hacking',
    title: 'Account Hacking & Credential Stuffing',
    topic: 'Accounts',
    readTime: '3 min read',
    summary: 'Why reused passwords lead to cascading takeovers across email, shopping, and social accounts.',
    whatItIs:
      'Attackers take username/password pairs leaked from unrelated data breaches and test them automatically across major email, banking, and social platforms (credential stuffing), or hijack sessions via stolen cookies and phishing.',
    warningSigns: [
      'Password reset emails or 2FA prompts you did not initiate.',
      'Sent messages, unfamiliar orders, or newly added recovery emails on your account.',
      'Security alerts indicating logins from unfamiliar cities or devices.',
    ],
    howToProtect: [
      'Use a distinct, strong password for every account—especially your primary email.',
      'Enable authenticator-app 2FA or passkeys everywhere supported.',
      'Keep browsers updated and avoid installing untrusted browser extensions.',
    ],
    whatToDoIfAffected: [
      'Reset passwords starting with primary email, then banking and social platforms.',
      'Revoke all active sessions and audit forwarding rules or connected apps.',
      'Document unauthorized activity and alert affected contacts or financial providers.',
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering & Urgency Manipulation',
    topic: 'Awareness',
    readTime: '3 min read',
    summary: 'Psychological tactics fraudsters use to override critical thinking through fear, authority, or greed.',
    whatItIs:
      'Social engineering manipulates human trust rather than technical software flaws. Fraudsters impersonate bank managers, relatives in medical emergencies, tech support, or government officers to force rapid compliance.',
    warningSigns: [
      'Artificial deadlines ("act in 10 minutes or your account will be permanently blocked").',
      'Pressure to keep the conversation confidential or stay on the line while performing transactions.',
      'Emotional triggers such as sudden family emergency calls from an unknown number or AI-cloned voice.',
    ],
    howToProtect: [
      'Pause and verify out-of-band: hang up and call the person or organization using a known, independent number.',
      'Establish a simple family verification habit for urgent financial requests.',
      'Treat secrecy requests from any caller as an immediate stop signal.',
    ],
    whatToDoIfAffected: [
      'Do not feel embarrassed—social engineering is professionally scripted and affects people of all backgrounds.',
      'Immediately shift to containment: secure affected accounts, notify your bank, and document the interaction.',
    ],
  },
  {
    id: 'online-shopping-fraud',
    title: 'Online Shopping & Marketplace Fraud',
    topic: 'Commerce',
    readTime: '3 min read',
    summary: 'Avoiding spoofed e-commerce storefronts, social media ad scams, and fake courier updates.',
    whatItIs:
      'Fraudulent shopping sites advertise heavily discounted electronics, apparel, or event tickets via social media ads, collect advance UPI/card payments, and either vanish or ship worthless items with no return support.',
    warningSigns: [
      'Prices 60–80% below market value on newly registered websites with no verifiable customer support.',
      'Only prepaid UPI/wallet transfers accepted, with Cash-on-Delivery disabled or fake tracking links.',
      'Sellers on classifieds asking to switch off-platform to WhatsApp for "shipping verification links".',
    ],
    howToProtect: [
      'Check website domain age, return policies, and independent reviews before paying unfamiliar merchants.',
      'Prefer credit cards or verified platform escrow over direct personal UPI transfers to strangers.',
      'Never click "redelivery fee" SMS links for parcels you did not order.',
    ],
    whatToDoIfAffected: [
      'Contact your card issuer or bank promptly to inquire about a merchant dispute or chargeback.',
      'Collect the merchant website URL, invoice, payment receipt, and seller contact info.',
      'Report fraudulent online merchants at cybercrime.gov.in and consumer grievance portals.',
    ],
  },
  {
    id: 'otp-scams',
    title: 'OTP & Remote Screen-Sharing Scams',
    topic: 'Access Control',
    readTime: '3 min read',
    summary: 'How one-time passcodes and support apps hand complete banking control to fraudsters.',
    whatItIs:
      'Scammers pose as bank, telecom, or customer care executives and ask you to read out an SMS OTP or install screen-sharing apps (such as AnyDesk or TeamViewer) to "process a refund" or "cancel a charge". Once connected, they view incoming OTPs live and authorize transfers.',
    warningSigns: [
      'Anyone asking you to read out an OTP to "reverse a debit", "redeem reward points", or "update eKYC".',
      'Customer care callers instructing you to install a remote support app from the app store.',
      'SMS OTP messages explicitly mentioning a payment amount or card addition while the caller claims it is for "verification".',
    ],
    howToProtect: [
      'Never share an OTP, CVV, or banking PIN with anyone—including callers who know your name and partial card digits.',
      'Read the full SMS body of every OTP carefully to see what action it actually authorizes.',
      'Never install remote access apps at the request of an incoming phone caller.',
    ],
    whatToDoIfAffected: [
      'Uninstall the remote access app immediately and disconnect the device from the internet.',
      'Call your bank’s official fraud desk and helpline 1930 without delay.',
      'Reset banking logins, card PINs, and UPI PINs from a separate clean device.',
    ],
  },
];

export const CYBER_SAFETY_TIPS: { title: string; body: string; category: string }[] = [
  {
    category: 'Payments',
    title: 'UPI PIN is strictly for sending money',
    body: 'You never need to scan a QR code, approve a collect request, or enter your UPI PIN to receive a refund or cashback.',
  },
  {
    category: 'Impersonation',
    title: 'No law enforcement agency conducts "digital arrests"',
    body: 'Police, CBI, customs, and courts never detain citizens on video calls or ask you to transfer funds into a "verification account".',
  },
  {
    category: 'Account Hygiene',
    title: 'Protect your primary email like a bank vault',
    body: 'Enable app-based 2FA on your main email and audit auto-forwarding rules—email compromise unlocks password resets across all accounts.',
  },
  {
    category: 'Emergency Preparedness',
    title: 'Save official bank helplines directly from your card',
    body: 'Fraudsters buy search ads with fake customer care numbers. Store your bank’s official fraud number in your contacts before you ever need it.',
  },
  {
    category: 'Device Safety',
    title: 'Never install APK files sent over WhatsApp or SMS',
    body: 'Fake e-Challan, wedding invite, and courier APK files can silently read incoming SMS OTPs in the background.',
  },
  {
    category: 'Verification',
    title: 'Verify urgent money requests on a separate phone call',
    body: 'If a friend’s WhatsApp or Instagram asks for an emergency UPI transfer, call their regular mobile number to confirm before sending money.',
  },
];

export function createDemoState(): RecoverXState {
  const demoCases: CaseIncident[] = [
    {
      id: 'RX-2026-0101',
      title: 'Unauthorized UPI Collect Request During Refund Call',
      category: 'upi_payment',
      amountInvolved: 24500,
      currency: 'INR',
      incidentDate: '2026-11-19',
      incidentTime: '15:40',
      platform: 'PhonePe / HDFC Bank',
      transactionId: 'UTR632419884512',
      suspiciousContact: '+91 98201-XXXXX / refund-desk-help@okaxis',
      description:
        'Contacted a helpline number found online regarding a delayed courier delivery. The caller sent a ₹24,500 UPI collect request claiming it was an automated refund verification. Upon noticing the debit SMS, I contacted HDFC Bank fraud support and called helpline 1930.',
      bankContacted: 'Yes',
      complaintFiled: 'Yes',
      complaintReferenceNumber: 'NCRP-2026-31849201 (DEMO)',
      followUpDate: '2026-11-26',
      status: 'Pending Follow-up',
      stages: [
        { id: 'incident_reported', completed: true, completedAt: '2026-11-19T16:05:00.000Z' },
        { id: 'immediate_safety', completed: true, completedAt: '2026-11-19T16:20:00.000Z' },
        { id: 'evidence_collected', completed: true, completedAt: '2026-11-19T17:10:00.000Z' },
        { id: 'complaint_submitted', completed: true, completedAt: '2026-11-19T18:00:00.000Z' },
        { id: 'followup_in_progress', completed: false },
        { id: 'resolved', completed: false },
      ],
      milestones: [
        {
          id: 'ms-demo-1',
          date: '2026-11-19',
          title: 'Bank Fraud Desk Ticket Raised',
          note: 'Spoke with HDFC official fraud support; UPI handle temporarily paused and dispute logged.',
        },
        {
          id: 'ms-demo-2',
          date: '2026-11-19',
          title: 'Reported via 1930 & cybercrime.gov.in',
          note: 'Submitted UTR details and debit SMS screenshot. Received sample acknowledgement reference.',
        },
      ],
      notes: [
        {
          id: 'note-demo-1',
          createdAt: '2026-11-20T09:15:00.000Z',
          content: 'Bank branch requested signed dispute declaration along with portal acknowledgement copy.',
        },
      ],
      emergencyActionsCompleted: ['mt-1', 'mt-2', 'mt-3'],
      createdAt: '2026-11-19T16:05:00.000Z',
      updatedAt: '2026-11-20T09:15:00.000Z',
      isDemo: true,
    },
    {
      id: 'RX-2026-0102',
      title: 'Suspicious Remote Task & Fake Job Portal Deposit',
      category: 'job_internship',
      amountInvolved: 8000,
      currency: 'INR',
      incidentDate: '2026-11-21',
      incidentTime: '11:15',
      platform: 'Telegram / IMPS Bank Transfer',
      transactionId: 'IMPS632511402918',
      suspiciousContact: '@hr_remote_tasks_in / +91 70452-XXXXX',
      description:
        'Received a remote internship task offer via messaging app. After completing initial trial tasks, the coordinator asked for an ₹8,000 merchant verification deposit to unlock earnings, then demanded an additional ₹15,000. Stopped communication immediately and began organizing evidence.',
      bankContacted: 'No',
      complaintFiled: 'No',
      status: 'Active',
      stages: [
        { id: 'incident_reported', completed: true, completedAt: '2026-11-21T12:00:00.000Z' },
        { id: 'immediate_safety', completed: true, completedAt: '2026-11-21T12:30:00.000Z' },
        { id: 'evidence_collected', completed: false },
        { id: 'complaint_submitted', completed: false },
        { id: 'followup_in_progress', completed: false },
        { id: 'resolved', completed: false },
      ],
      milestones: [
        {
          id: 'ms-demo-3',
          date: '2026-11-21',
          title: 'Ceased Contact & Blocked Accounts',
          note: 'Blocked Telegram handles and preserved chat exports before deleting group.',
        },
      ],
      notes: [
        {
          id: 'note-demo-2',
          createdAt: '2026-11-21T13:10:00.000Z',
          content: 'Need to upload bank PDF receipt and call 1930 today.',
        },
      ],
      emergencyActionsCompleted: ['mt-4'],
      createdAt: '2026-11-21T12:00:00.000Z',
      updatedAt: '2026-11-21T13:10:00.000Z',
      isDemo: true,
    },
    {
      id: 'RX-2026-0103',
      title: 'Instagram Account Takeover via Phishing Link',
      category: 'social_media_hack',
      currency: 'INR',
      incidentDate: '2026-11-10',
      incidentTime: '20:20',
      platform: 'Instagram',
      suspiciousContact: 'support-meta-verify-badge.example',
      description:
        'Clicked a copyright warning direct message and entered login credentials on a spoofed page. The attacker posted fraudulent crypto stories. Regained control via official platform selfie verification, revoked active sessions, enabled authenticator 2FA, and alerted all contacts.',
      bankContacted: 'No',
      complaintFiled: 'Yes',
      complaintReferenceNumber: 'NCRP-2026-30911244 (DEMO)',
      status: 'Resolved',
      stages: [
        { id: 'incident_reported', completed: true, completedAt: '2026-11-10T21:00:00.000Z' },
        { id: 'immediate_safety', completed: true, completedAt: '2026-11-10T21:20:00.000Z' },
        { id: 'evidence_collected', completed: true, completedAt: '2026-11-11T08:00:00.000Z' },
        { id: 'complaint_submitted', completed: true, completedAt: '2026-11-11T10:15:00.000Z' },
        { id: 'followup_in_progress', completed: true, completedAt: '2026-11-14T15:00:00.000Z' },
        { id: 'resolved', completed: true, completedAt: '2026-11-16T11:30:00.000Z' },
      ],
      milestones: [
        {
          id: 'ms-demo-4',
          date: '2026-11-13',
          title: 'Account Access Restored',
          note: 'Recovered Instagram access through official help center and enabled authenticator app 2FA.',
        },
      ],
      notes: [],
      emergencyActionsCompleted: ['sm-1', 'sm-2', 'sm-3', 'sm-4'],
      createdAt: '2026-11-10T21:00:00.000Z',
      updatedAt: '2026-11-16T11:30:00.000Z',
      isDemo: true,
    },
  ];

  const demoEvidence: EvidenceItem[] = [
    {
      id: 'ev-demo-1',
      name: 'HDFC Debit Alert & UPI UTR Receipt',
      category: 'Transaction Record',
      caseId: 'RX-2026-0101',
      dateAdded: '2026-11-19T16:40:00.000Z',
      notes: 'Contains full 12-digit UTR reference, exact debit time (15:40 IST), and beneficiary UPI handle.',
      transactionDetails: 'UTR632419884512 · ₹24,500 · HDFC -> refund-desk-help@okaxis',
      suspiciousContact: 'refund-desk-help@okaxis',
      isDemo: true,
    },
    {
      id: 'ev-demo-2',
      name: 'Fraudulent Helpline Call Log Record',
      category: 'Phone Number',
      caseId: 'RX-2026-0101',
      dateAdded: '2026-11-19T16:55:00.000Z',
      notes: 'Incoming call lasted 8 minutes 14 seconds prior to collect request prompt.',
      suspiciousContact: '+91 98201-XXXXX',
      isDemo: true,
    },
    {
      id: 'ev-demo-3',
      name: 'Telegram Prepaid Task Instructions Transcript',
      category: 'Chat',
      caseId: 'RX-2026-0102',
      dateAdded: '2026-11-21T12:45:00.000Z',
      notes: 'Exported text showing deposit tiers and bank account details shared by the coordinator.',
      transactionDetails: 'IMPS632511402918 · ₹8,000',
      suspiciousContact: '@hr_remote_tasks_in',
      isDemo: true,
    },
    {
      id: 'ev-demo-4',
      name: 'Spoofed Copyright Notice URL Log',
      category: 'Website / Link',
      caseId: 'RX-2026-0103',
      dateAdded: '2026-11-11T08:05:00.000Z',
      notes: 'Recorded phishing URL sent via DM for cybercrime portal submission.',
      suspiciousContact: 'https://support-meta-verify-badge.example',
      isDemo: true,
    },
  ];

  const demoActivities: ActivityEvent[] = [
    {
      id: 'act-demo-1',
      type: 'evidence_added',
      title: 'Evidence added to Evidence Vault',
      detail: 'Telegram Prepaid Task Instructions Transcript linked to RX-2026-0102',
      caseId: 'RX-2026-0102',
      timestamp: '2026-11-21T12:45:00.000Z',
      isDemo: true,
    },
    {
      id: 'act-demo-2',
      type: 'incident_created',
      title: 'Incident reported',
      detail: 'Created case RX-2026-0102 — Suspicious Remote Task & Fake Job Portal Deposit',
      caseId: 'RX-2026-0102',
      timestamp: '2026-11-21T12:00:00.000Z',
      isDemo: true,
    },
    {
      id: 'act-demo-3',
      type: 'status_updated',
      title: 'Recovery stage updated',
      detail: 'Complaint Submitted marked complete for RX-2026-0101',
      caseId: 'RX-2026-0101',
      timestamp: '2026-11-19T18:00:00.000Z',
      isDemo: true,
    },
    {
      id: 'act-demo-4',
      type: 'status_updated',
      title: 'Case marked Resolved',
      detail: 'RX-2026-0103 — Instagram Account Takeover closed after account restoration',
      caseId: 'RX-2026-0103',
      timestamp: '2026-11-16T11:30:00.000Z',
      isDemo: true,
    },
  ];

  const demoNotifications: AppNotification[] = [
    {
      id: 'notif-demo-1',
      title: 'Scheduled Follow-up Reminder (DEMO)',
      message: 'Follow-up date for RX-2026-0101 is set for 26 Nov 2026. Check your bank dispute ticket and portal acknowledgement.',
      category: 'reminder',
      timestamp: '2026-11-21T09:00:00.000Z',
      read: false,
      caseId: 'RX-2026-0101',
      isDemo: true,
    },
    {
      id: 'notif-demo-2',
      title: 'Evidence Collection Pending (DEMO)',
      message: 'RX-2026-0102 has not yet been marked as Complaint Submitted. Complete evidence collection and draft your complaint.',
      category: 'case',
      timestamp: '2026-11-21T12:15:00.000Z',
      read: false,
      caseId: 'RX-2026-0102',
      isDemo: true,
    },
    {
      id: 'notif-demo-3',
      title: 'Personal Safety Checklist',
      message: 'Review your 12-point Personal Safety Checklist in the Safety Center to harden email, UPI, and device security.',
      category: 'checklist',
      timestamp: '2026-11-20T14:00:00.000Z',
      read: true,
      isDemo: true,
    },
  ];

  return {
    cases: demoCases,
    evidence: demoEvidence,
    emergencyChecklist: {
      money_transferred: ['mt-1', 'mt-2'],
    },
    safetyChecklist: ['chk-1', 'chk-2', 'chk-6'],
    activities: demoActivities,
    notifications: demoNotifications,
    settings: {
      displayName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      theme: 'dark',
      notifications: {
        caseUpdates: true,
        followUpReminders: true,
        checklistReminders: true,
        safetyTips: true,
      },
    },
    demoModeActive: true,
  };
}

export function createEmptyState(existingSettings?: RecoverXState['settings']): RecoverXState {
  return {
    cases: [],
    evidence: [],
    emergencyChecklist: {},
    safetyChecklist: [],
    activities: [],
    notifications: [],
    settings: existingSettings ?? {
      displayName: 'RecoverX User',
      email: '',
      theme: 'dark',
      notifications: {
        caseUpdates: true,
        followUpReminders: true,
        checklistReminders: true,
        safetyTips: true,
      },
    },
    demoModeActive: false,
  };
}
