import { CourseTrackData } from '../../courses.data';

export const CYBERSECURITY_COURSE: CourseTrackData = {
  id: 'cybersecurity',
  title: 'Cybersecurity & Ethical Hacking Basics',
  titleSinhala: 'සයිබර් ආරක්ෂාව සහ Ethical Hacking මූලික කරුණු',
  tag: 'Tech',
  category: 'tech',
  targetAudience: 'everyone',
  targetAudienceLabel: 'අන්තර්ජාලය භාවිතා කරන සැමට',
  level: 'Beginner to Intermediate',
  icon: 'security',
  gradient: 'bg-gradient-to-tr from-green-500 via-emerald-600 to-teal-700',
  badgeName: 'Cyber Defender',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Protect yourself online, understand how hackers work, and learn the basics of Ethical Hacking.',
  descriptionSinhala: 'අන්තර්ජාලයේදී සිදුවිය හැකි අනතුරු (Hack වීම්), ඔබගේ ෆේස්බුක්/බැංකු ගිණුම් ආරක්ෂා කරගන්නා ආකාරය සහ Ethical Hacking හැඳින්වීම.',
  lessons: [
  {
    "id": "cs-1",
    "title": "01. Cybersecurity යනු කුමක්ද? (ආරක්ෂාවේ වැදගත්කම)",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "සයිබර් ආරක්ෂාව යනු කුමක්ද සහ එය අප සැමට වැදගත් වන්නේ ඇයිද යන්න.",
    "analogy": "Cybersecurity කියන්නේ ඔබේ නිවසට අගුළු (Locks), සීසීටීවී (CCTV) සහ මුරකරුවන් දාලා හොරුන්ගෙන් බේරගන්නවා වගේ වැඩක් - හැබැයි මේක කරන්නේ ඩිජිටල් ලෝකයේ.",
    "content": [
      "Cybersecurity (සයිබර් ආරක්ෂාව) යනු කුමක්ද?",
      "Hackers ලා වර්ග (White Hat, Black Hat, Grey Hat)",
      "සයිබර් ප්‍රහාරයක් නිසා සිදුවිය හැකි හානිය",
      "CIA Triad (Confidentiality, Integrity, Availability)"
    ],
    "keyTakeaways": [
      "White Hat හැකර්වරුන් (Ethical Hackers) යනු ආයතන වල ආරක්ෂාව වැඩි කිරීමට උදව් කරන හොඳ පුද්ගලයින්ය.",
      "Black Hat හැකර්වරුන් මුදල් හෝ දත්ත සොරකම් කිරීමට නීතිවිරෝධීව පරිගණක වලට ඇතුළු වේ."
    ],
    "exercise": {
      "prompt": "නීත්‍යානුකූලව සහ අවසර සහිතව පරිගණක පද්ධති වල දුර්වලතා සොයන හැකර්වරුන් හඳුන්වන නම කුමක්ද?",
      "hint": "White ...",
      "solution": "White Hat Hackers (හෝ Ethical Hackers)"
    }
  },
  {
    "id": "cs-2",
    "title": "02. සාමාන්‍ය සයිබර් ප්‍රහාර වර්ග (Phishing සහ Malware)",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "අන්තර්ජාලයේදී ඔබට මුහුණදීමට සිදුවිය හැකි ප්‍රධාන තර්ජන හඳුනාගැනීම.",
    "analogy": "Phishing කියන්නේ හරියට මාළු අල්ලන්න බිලී කොක්කේ ඇමක් ගහලා දානවා වගේ. ලොතරැයියක් ඇදුනා කියලා බොරු ලින්ක් එකක් එවන්නේ ඒකටයි.",
    "content": [
      "Phishing (ව්‍යාජ ලින්ක් සහ ඊමේල්)",
      "Malware (වෛරස්, ට්‍රෝජන්, රුන්සම්වෙයා)",
      "Ransomware (පරිගණකය ලොක් කර මුදල් ඉල්ලීම)",
      "Social Engineering (මනෝවිද්‍යාත්මකව රැවටීම)"
    ],
    "keyTakeaways": [
      "බැංකුවකින් හෝ ආයතනයකින් කිසිවිටෙකත් ඔබේ මුරපදය (Password) ඊමේල් හෝ SMS මඟින් ඉල්ලන්නේ නැත.",
      "නොදන්නා අය එවන ලින්ක් (Links) ක්ලික් කිරීමෙන් ඔබේ ෆේස්බුක් හෝ බැංකු ගිණුම හැක් විය හැක."
    ],
    "exercise": {
      "prompt": "ඔබගේ පරිගණකයේ ඇති ෆයිල් සියල්ලම ලොක් (Lock) කර, ඒවා නැවත ලබාදීමට මුදල් ඉල්ලා සිටින වෛරස් වර්ගය කුමක්ද?",
      "hint": "Ransom...",
      "solution": "Ransomware"
    }
  },
  {
    "id": "cs-3",
    "title": "03. මුරපද (Passwords) සහ ගිණුම් ආරක්ෂා කරගැනීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "ඔබගේ ෆේස්බුක්, ඊමේල් සහ බැංකු ගිණුම් වල ආරක්ෂාව තහවුරු කරන ආකාරය.",
    "analogy": "ශක්තිමත් මුරපදයක් (Password) කියන්නේ හරියට ඉතාම සංකීර්ණ යතුරක් වගේ, හොරෙකුට ලේසියෙන් හදන්න බැහැ. 2FA කියන්නේ ඒ යතුරට අමතරව ඇඟිලි සලකුණත් ඉල්ලනවා වගේ.",
    "content": [
      "ශක්තිමත් මුරපදයක් සාදාගන්නා ආකාරය",
      "Two-Factor Authentication (2FA) යනු කුමක්ද?",
      "Password Managers භාවිතය",
      "පොදු Wi-Fi (Public Wi-Fi) වල ඇති අනතුරු"
    ],
    "keyTakeaways": [
      "සෑම ගිණුමකටම එකම මුරපදය (Password) භාවිතා කිරීම ඉතා භයානකය.",
      "ඔබගේ ගිණුම් වලට 2FA (Two-Step Verification) අනිවාර්යයෙන්ම සක්‍රිය (Enable) කරන්න."
    ],
    "exercise": {
      "prompt": "මුරපදයකට අමතරව ඔබගේ ජංගම දුරකථනයට එන කේතයක් (OTP) ද ඇතුළත් කිරීමට සිදුවන ආරක්ෂක ක්‍රමය කුමක්ද?",
      "hint": "2F...",
      "solution": "Two-Factor Authentication (2FA)"
    }
  },
  {
    "id": "cs-4",
    "title": "04. Ethical Hacking (Penetration Testing) හැඳින්වීම",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "ආයතනයක පරිගණක පද්ධතිවල ඇති දුර්වලතා ඒවාට පහර දීමට පෙර සොයාගන්නා ආකාරය.",
    "analogy": "Penetration Testing කියන්නේ බැංකුවකින්ම සල්ලි දීලා හොරෙක්ව ගේනවා බැංකුව කඩන්න පුළුවන්ද කියලා බලන්න, එතකොට බැංකුවට පුළුවන් ඒ දුර්වලතා හදාගන්න.",
    "content": [
      "Penetration Testing යනු කුමක්ද?",
      "Hacking ක්‍රියාවලියේ පියවර (Reconnaissance, Scanning, Gaining Access)",
      "Kali Linux මෙහෙයුම් පද්ධතිය හැඳින්වීම",
      "අවසර නොමැතිව හැක් කිරීමේ නීතිමය තත්වය"
    ],
    "keyTakeaways": [
      "කිසිදු පරිගණකයක් හෝ වෙබ් අඩවියක් ලිඛිත අවසරයකින් තොරව හැක් කිරීමට උත්සාහ කිරීම බරපතල අපරාධයකි.",
      "Kali Linux යනු Ethical Hackers ලා විසින් බහුලව භාවිතා කරන මෙහෙයුම් පද්ධතියයි (OS)."
    ],
    "exercise": {
      "prompt": "Ethical Hackers ලා බහුලවම භාවිතා කරන, හැකින් ටූල්ස් (Hacking Tools) ගණනාවක් අඩංගු Linux මෙහෙයුම් පද්ධතියේ නම කුමක්ද?",
      "hint": "K... Linux",
      "solution": "Kali Linux"
    }
  },
  {
    "id": "cs-5",
    "title": "05. ජංගම දුරකථන සහ අන්තර්ජාල ආරක්ෂාව (Mobile Security)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "ඔබගේ ස්මාර්ට් ජංගම දුරකථනය වෛරස් වලින් සහ ඔත්තු බලන ඇප්ස් වලින් ආරක්ෂා කරගැනීම.",
    "analogy": "Mobile Security කියන්නේ ඔබේ ෆෝන් එක කියන පුද්ගලික දිනපොත (Diary) අනුන්ට කියවන්න බැරිවෙන්න ඉබි යතුරු දාලා තියනවා වගේ.",
    "content": [
      "App Permissions (ඇප් වලට ලබාදෙන අවසර) කළමනාකරණය",
      "අනාරක්ෂිත Apps ස්ථාපනය කිරීමේ අවදානම (APK files)",
      "VPN (Virtual Private Network) යනු කුමක්ද?",
      "දුරකථනය නැතිවූ විට දත්ත මකා දැමීම (Remote Wipe)"
    ],
    "keyTakeaways": [
      "Google Play Store හෝ Apple App Store එකෙන් පිටතින් (Unknown sources) Apps ස්ථාපනය කිරීමෙන් වළකින්න.",
      "පොදු Wi-Fi (උදා: හෝටල් වල, කෝච්චියේ) භාවිතා කරන විට VPN එකක් භාවිතා කිරීම ආරක්ෂිතය."
    ],
    "exercise": {
      "prompt": "අන්තර්ජාලයට සම්බන්ධ වන විට ඔබගේ දත්ත සංකේතනය කර (Encrypt) ආරක්ෂාව සපයන මෘදුකාංග වර්ගය හඳුන්වන කෙටි නම කුමක්ද?",
      "hint": "V...",
      "solution": "VPN (Virtual Private Network)"
    }
  }
]
};
