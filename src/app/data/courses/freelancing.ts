import { CourseTrackData } from '../../courses.data';

export const FREELANCING_COURSE: CourseTrackData = {
  id: 'freelancing-fiverr-upwork',
  title: 'Freelancing on Fiverr & Upwork',
  titleSinhala: 'Fiverr සහ Upwork හරහා නිවසේ සිට මුදල් ඉපැයීම (Freelancing)',
  tag: 'Business',
  category: 'business',
  targetAudience: 'everyone',
  targetAudienceLabel: 'නිවසේ සිට අමතර ආදායමක් සෙවීමට කැමති සැමට',
  level: 'Beginner to Advanced',
  icon: 'work',
  gradient: 'bg-gradient-to-tr from-green-500 via-green-600 to-emerald-700',
  badgeName: 'Top Rated Freelancer',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Learn how to create an attractive Fiverr profile, bid on Upwork, and earn dollars from home.',
  descriptionSinhala: 'Fiverr සහ Upwork වෙබ් අඩවි වල නිවැරදිව ගිණුමක් සාදා, පළමු Order එක ලබාගෙන ඩොලර් වලින් මුදල් උපයන ආකාරය සහ Payoneer හරහා මුදල් ලබාගන්නා ආකාරය.',
  lessons: [
  {
    "id": "fr-1",
    "title": "01. Freelancing (නිදහස් සේවය) යනු කුමක්ද?",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "අන්තර්ජාලය හරහා නිවසේ සිටම මුදල් ඉපැයිය හැකි Freelancing යනු කුමක්දැයි හඳුනාගැනීම.",
    "analogy": "Freelancer කෙනෙක් කියන්නේ හරියට කුලී රථ රියදුරෙක් (Taxi Driver) වගේ. එයාට ලොක්කෙක් නෑ, කැමති වෙලාවට වැඩ කරන්න පුළුවන්, කරන වැඩේ ප්‍රමාණයට සල්ලි හම්බවෙනවා.",
    "content": [
      "Freelancing යනු කුමක්ද?",
      "සාමාන්‍ය රැකියාවක් සහ Freelancing අතර වෙනස",
      "ඔබට කළ හැකි රැකියා වර්ග (Data Entry, Design, Coding, Writing)",
      "Freelancing ආරම්භ කිරීමට අවශ්‍ය දේවල් (ලැප්ටොප්, අන්තර්ජාලය, බැංකු ගිණුම)"
    ],
    "keyTakeaways": [
      "Freelancing මඟින් ඔබට ලොව පුරා සිටින සේවාදායකයින්ට (Clients) ඔබගේ නිවසේ සිටම සේවා සැපයිය හැක.",
      "ඉංග්‍රීසි භාෂා දැනුම (අවම වශයෙන් චැට් කිරීමට හැකිවීම) මෙහිදී ඉතා වැදගත් වේ."
    ],
    "exercise": {
      "prompt": "නිත්‍ය සේවා යෝජකයෙකු (Boss) යටතේ වැඩ නොකර, අන්තර්ජාලය හරහා තනිවම සේවා සපයන පුද්ගලයා හඳුන්වන්නේ කුමක් ලෙසද?",
      "hint": "Free...",
      "solution": "Freelancer"
    }
  },
  {
    "id": "fr-2",
    "title": "02. Fiverr වෙබ් අඩවිය හඳුන්වාදීම සහ Gig එකක් සෑදීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 25",
    "summary": "Fiverr වෙබ් අඩවියේ ගිණුමක් සාදා ඔබගේ පළමු සේවාව (Gig) විකිණීමට දමන ආකාරය.",
    "analogy": "Fiverr කියන්නේ හරියට සුපර් මාකට් එකක් වගේ. ඔබගේ සේවාව (Gig) ඒ මාකට් එකේ තියෙන බඩු රාක්කයක්. ගනුදෙනුකරුවන් ඇවිත් ඒ රාක්කෙන් බඩු (සේවාව) මිලදී ගන්නවා.",
    "content": [
      "Fiverr ක්‍රියාකරන ආකාරය",
      "Professional Seller Profile එකක් සෑදීම",
      "Gig යනු කුමක්ද? (Gig Title, Tags, Description)",
      "Gig Image සහ Pricing (මිල ගණන්) සකස් කිරීම"
    ],
    "keyTakeaways": [
      "පළමු Gig එක සෑදීමේදී ඉතාම තරඟකාරීත්වය අඩු (Low Competition) සේවාවක් තෝරාගැනීම සාර්ථකත්වයට හේතු වේ.",
      "ආකර්ෂණීය පින්තූරයක් (Gig Image) සහ පැහැදිලි විස්තරයක් දැමීම අනිවාර්ය වේ."
    ],
    "exercise": {
      "prompt": "Fiverr වෙබ් අඩවියේදී ඔබ සපයන සේවාව (Service) හඳුන්වන නම කුමක්ද?",
      "hint": "G...",
      "solution": "Gig"
    }
  },
  {
    "id": "fr-3",
    "title": "03. Upwork වෙබ් අඩවිය සහ Proposal යැවීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "Upwork වෙබ් අඩවියේ රැකියා සඳහා අයදුම් කිරීම (Bidding) සහ Proposal එකක් ලියන ආකාරය.",
    "analogy": "Upwork කියන්නේ හරියට ටෙන්ඩර් (Tender) දානවා වගේ වැඩක්. සේවාදායකයා තමන්ට ඕන වැඩේ ගැන දානවා, ඔබ ගිහිල්ලා ඒක මට මේ ගානට කරලා දෙන්න පුළුවන් කියලා අයදුම් (Bid) කරනවා.",
    "content": [
      "Upwork සහ Fiverr අතර වෙනස",
      "Upwork Profile එකක් 100% ක් සම්පූර්ණ කිරීම",
      "රැකියා සෙවීම සහ Connects භාවිතය",
      "සාර්ථක Proposal එකක් (Cover Letter) ලියන ආකාරය"
    ],
    "keyTakeaways": [
      "Upwork හි පළමු රැකියාව ලබාගැනීමට ඉතා හොඳින් ලියන ලද Proposal එකක් අවශ්‍ය වේ.",
      "Copy-Paste කළ Proposals යැවීමෙන් කිසිවිටෙකත් රැකියා නොලැබේ."
    ],
    "exercise": {
      "prompt": "Upwork හි රැකියාවකට අයදුම් කිරීමේදී ඔබ ලියන කෙටි ලිපිය හඳුන්වන නම කුමක්ද?",
      "hint": "Prop... (Cover Letter)",
      "solution": "Proposal (හෝ Cover Letter)"
    }
  },
  {
    "id": "fr-4",
    "title": "04. සේවාදායකයින් (Clients) සමඟ කතා කිරීම සහ ඇණවුම් ලබාගැනීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "විදේශික සේවාදායකයින් සමඟ වෘත්තීයව (Professional) චැට් කරන ආකාරය.",
    "analogy": "Client එක්ක කතා කරනවා කියන්නේ හරියට කඩේකට ආපු පාරිභෝගිකයෙකුට භාණ්ඩයක් විකුණන්න ඒකේ තියෙන හොඳ ගැන පැහැදිලි කරනවා වගේ වැඩක්.",
    "content": [
      "පළමු පණිවිඩයට (Message) පිළිතුරු දෙන ආකාරය",
      "විශ්වාසය දිනාගැනීම සහ Portfolio (පෙර කළ වැඩ) පෙන්වීම",
      "වැඩේට හරියටම යන මුදල සහ කාලය (Time & Budget) සාකච්ඡා කිරීම",
      "Customer Support සහ සුහදව කටයුතු කිරීම"
    ],
    "keyTakeaways": [
      "සේවාදායකයාගේ පණිවිඩ වලට හැකි ඉක්මනින් (විනාඩි කිහිපයක් ඇතුළත) පිළිතුරු දීමෙන් ඇණවුම ලැබීමේ සම්භාවිතාව වැඩිවේ.",
      "\"Sir\" කියා ආමන්ත්‍රණය කරනවාට වඩා ඔවුන්ගේ නමින් ආමන්ත්‍රණය කිරීම විදේශිකයින් ප්‍රිය කරයි."
    ],
    "exercise": {
      "prompt": "ඔබ මීට පෙර කර ඇති නිර්මාණ හෝ වැඩකටයුතු සේවාදායකයාට පෙන්වීමට යවන ලැයිස්තුව / ගොනුව හඳුන්වන්නේ කුමක් ලෙසද?",
      "hint": "Port...",
      "solution": "Portfolio"
    }
  },
  {
    "id": "fr-5",
    "title": "05. Payoneer හරහා මුදල් ලංකාවට ගෙන්වා ගැනීම",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "Fiverr/Upwork හි උපයන ඩොලර් මුදල් ආරක්ෂිතව ශ්‍රී ලංකාවේ බැංකු ගිණුමකට ලබාගැනීම.",
    "analogy": "Payoneer කියන්නේ හරියට අන්තර්ජාලයේ තියෙන ඔබේ ජාත්‍යන්තර මුදල් පසුම්බිය වගේ. විදේශිකයන්ගෙන් ඩොලර් ඒකට එනවා, එතනින් ලංකාවේ බැංකුවට රුපියල් කරලා ගන්නවා.",
    "content": [
      "Payoneer ගිණුමක් ලංකාවේ සිට සාදාගන්නා ආකාරය",
      "Payoneer ගිණුම Fiverr/Upwork වෙත සම්බන්ධ කිරීම",
      "ලංකාවේ බැංකු ගිණුමකට මුදල් මාරු කිරීම (Withdrawal)",
      "ගිණුම් අවහිර වීම් (Bans) වළක්වා ගනිමින් ආරක්ෂිතව වැඩ කිරීම"
    ],
    "keyTakeaways": [
      "එක් අයෙකුට සෑදිය හැක්කේ එක් Payoneer ගිණුමක් පමණි.",
      "ඔබගේ නම, ලිපිනය සහ හැඳුනුම්පතේ විස්තර සියල්ල 100% ක් නිවැරදි විය යුතුය."
    ],
    "exercise": {
      "prompt": "Fiverr හි උපයන මුදල් ලංකාවේ බැංකු ගිණුමකට ගෙන්වා ගැනීමට භාවිතා කරන ප්‍රධානතම ජාත්‍යන්තර ගෙවීම් ක්‍රමය (Payment Gateway) කුමක්ද?",
      "hint": "Payo...",
      "solution": "Payoneer"
    }
  }
]
};
