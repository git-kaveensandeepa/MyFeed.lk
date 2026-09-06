import { CourseTrackData } from '../../courses.data';

export const DIGITAL_MARKETING_COURSE: CourseTrackData = {
  id: 'digital-marketing',
  title: 'Digital Marketing & Social Media Management',
  titleSinhala: 'ඩිජිටල් අලෙවිකරණය සහ Social Media කළමනාකරණය',
  tag: 'Business',
  category: 'business',
  targetAudience: 'entrepreneurs',
  targetAudienceLabel: 'ව්‍යාපාරිකයින් සහ අලෙවිකරුවන් සඳහා',
  level: 'Beginner to Intermediate',
  icon: 'campaign',
  gradient: 'bg-gradient-to-tr from-pink-500 via-rose-500 to-red-600',
  badgeName: 'Marketing Pro',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Learn how to grow your business online using Facebook Ads, SEO, and Email Marketing strategies.',
  descriptionSinhala: 'ඔබේ ව්‍යාපාරය අන්තර්ජාලය හරහා දියුණු කරගන්නා ආකාරය, Facebook Ads දැමීම, SEO සහ නිවැරදි Social Media උපායමාර්ග ඉගෙන ගන්න.',
  lessons: [
  {
    "id": "dm-1",
    "title": "01. Digital Marketing යනු කුමක්ද? (හැඳින්වීම)",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "ඩිජිටල් අලෙවිකරණය යනු කුමක්ද, සාම්ප්‍රදායික අලෙවිකරණයෙන් එය වෙනස් වන්නේ කෙසේද සහ එහි ඇති වාසි.",
    "analogy": "සාම්ප්‍රදායික Marketing කියන්නේ පාරේ යන හැමෝටම පත්‍රිකා බෙදනවා වගේ වැඩක්. ඩිජිටල් Marketing කියන්නේ අපේ භාණ්ඩය හරියටම අවශ්‍ය කෙනා හොයාගෙන ගිහින් පත්‍රිකාව දෙනවා වගේ වැඩක්.",
    "content": [
      "Digital Marketing යනු කුමක්ද?",
      "Inbound vs Outbound Marketing",
      "Target Audience (ඉලක්කගත පාරිභෝගිකයින්) හඳුනාගැනීම",
      "Digital Marketing Channels (SEO, Social Media, Email, PPC)"
    ],
    "keyTakeaways": [
      "ඩිජිටල් අලෙවිකරණයේදී අපගේ දැන්වීම් දකින්නේ කවුරුන්ද යන්න ඉතා නිවැරදිව තීරණය කළ හැක.",
      "ප්‍රතිඵල මැන බැලීම (Tracking) ඉතා පහසුය."
    ],
    "exercise": {
      "prompt": "පුවත්පතක දැන්වීමක් පළ කිරීමට වඩා ෆේස්බුක් දැන්වීමක ඇති ප්‍රධානතම වාසිය කුමක්ද?",
      "hint": "Targeting / ඉලක්කගත...",
      "solution": "අවශ්‍ය අයට පමණක් දැන්වීම පෙන්වීමට හැකිවීම (Targeting)"
    }
  },
  {
    "id": "dm-2",
    "title": "02. Social Media Marketing (Facebook & Instagram)",
    "level": "Beginner",
    "duration": "මිනිත්තු 20",
    "summary": "ෆේස්බුක් සහ ඉන්ස්ටග්‍රෑම් හරහා ව්‍යාපාරයක් ප්‍රවර්ධනය කිරීමේ මූලික පියවර.",
    "analogy": "Social Media Page එකක් කියන්නේ ඔබේ ව්‍යාපාරයේ ඩිජිටල් ප්‍රදර්ශනාගාරය (Showroom) වගේ.",
    "content": [
      "Business Page එකක් නිවැරදිව සකසන ආකාරය",
      "Content Strategy (පළකරන දේවල් සැලසුම් කිරීම)",
      "Engagement (පාරිභෝගිකයින් සම්බන්ධ කරගැනීම) වැඩිකරගන්නා ක්‍රම",
      "Hashtags භාවිතය"
    ],
    "keyTakeaways": [
      "සෑමවිටම භාණ්ඩ විකිණීමට උත්සාහ නොකර, පාරිභෝගිකයාට වටිනාකමක් (Value) දෙන දේවල්ද පළ කළ යුතුය.",
      "පාරිභෝගිකයින්ගේ කමෙන්ට්ස් සහ මැසේජ් වලට ඉක්මනින් ප්‍රතිචාර දැක්වීම වැදගත්ය."
    ],
    "exercise": {
      "prompt": "ව්‍යාපාරයක් සඳහා ෆේස්බුක් හි සැදිය යුත්තේ Personal Profile එකක්ද, නැත්නම් Business Page එකක්ද?",
      "hint": "Business...",
      "solution": "Business Page එකක්"
    }
  },
  {
    "id": "dm-3",
    "title": "03. Facebook Ads: දැන්වීම් නිර්මාණය කිරීම (PPC)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "මුදල් ගෙවා ෆේස්බුක් හරහා ඉලක්කගත පාරිභෝගිකයින් වෙත දැන්වීම් යැවීම.",
    "analogy": "Facebook Ad එකක් දානවා කියන්නේ, සෙනඟ පිරුණු මාකට් එකක ඔබේ කඩේට එන්න පුළුවන් අයට විතරක් පාර පෙන්වන බෝඩ් එකක් ගහනවා වගේ.",
    "content": [
      "Boost Post සහ Ads Manager අතර වෙනස",
      "Campaign Objectives (Traffic, Engagement, Leads)",
      "Audience Targeting (වයස, ස්ථානය, කැමැත්ත අනුව)",
      "Ad Budget සහ Schedule සකස් කිරීම"
    ],
    "keyTakeaways": [
      "Boost Post කරනවාට වඩා Ads Manager හරහා දැන්වීම් සැකසීමෙන් වඩා හොඳ ප්‍රතිඵල ලබාගත හැක.",
      "දැන්වීමේ පින්තූරය/වීඩියෝව මෙන්ම එහි ඇති වාක්‍ය (Copywriting) ද ඉතා වැදගත්ය."
    ],
    "exercise": {
      "prompt": "වඩාත් නිවැරදිව ඉලක්කගත දැන්වීම් (Targeted Ads) සෑදීමට භාවිතා කළ යුතු මෙවලම කුමක්ද?",
      "hint": "Ads Mana...",
      "solution": "Facebook Ads Manager"
    }
  },
  {
    "id": "dm-4",
    "title": "04. Search Engine Optimization (SEO) මූලික කරුණු",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "ගූගල් (Google) සෙවුම් යන්ත්‍රයේ ඔබේ වෙබ් අඩවිය ඉහළින්ම පෙන්වීමට අවශ්‍ය සැකසුම් කිරීම.",
    "analogy": "SEO කියන්නේ විශාල පුස්තකාලයක ඔබේ පොත හොයාගන්න ලේසි වෙන්න, ඒකේ නම සහ විස්තරය නාමාවලියේ හරියට ලියලා තියනවා වගේ වැඩක්.",
    "content": [
      "SEO යනු කුමක්ද සහ එය වැදගත් වන්නේ ඇයි?",
      "Keywords (මූලපද) යනු මොනවාද?",
      "On-page SEO (වෙබ් පිටුව ඇතුළත කරන වෙනස්කම්)",
      "Off-page SEO (Backlinks ලබාගැනීම)"
    ],
    "keyTakeaways": [
      "පාරිභෝගිකයින් ගූගල් හි සොයන වචන (Keywords) අපගේ වෙබ් අඩවියේ අන්තර්ගත කළ යුතුය.",
      "SEO යනු එක දවසින් ප්‍රතිඵල ලැබෙන දෙයක් නොවන අතර, ඊට මාස කිහිපයක් ගතවිය හැක."
    ],
    "exercise": {
      "prompt": "පාරිභෝගිකයින් ගූගල් සෙවුමේ ටයිප් කරන වචන හඳුන්වන්නේ කුමන නමකින්ද?",
      "hint": "Keyw...",
      "solution": "Keywords (මූලපද)"
    }
  },
  {
    "id": "dm-5",
    "title": "05. Email Marketing සහ ප්‍රතිඵල මැන බැලීම (Analytics)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "ඊමේල් මඟින් පාරිභෝගිකයින් සමඟ සම්බන්ධ වීම සහ දැන්වීම් වල සාර්ථකත්වය මැනීම.",
    "analogy": "Email Marketing කියන්නේ ඔබේ පාරිභෝගිකයින්ට ගෙදරටම තැපෑලෙන් ලියුමක් යවනවා වගේ. Analytics කියන්නේ ඒ ලියුම කීදෙනෙක් කියෙව්වද කියලා හොයලා බලනවා වගේ.",
    "content": [
      "Email Marketing වල වැදගත්කම සහ මෙවලම් (Mailchimp)",
      "සාර්ථක ඊමේල් එකක් ලියන ආකාරය",
      "Google Analytics සහ Facebook Insights හඳුන්වාදීම",
      "ROI (Return on Investment) ගණනය කිරීම"
    ],
    "keyTakeaways": [
      "Social Media followers ලාට වඩා ඔබේ Email List එකේ සිටින අය ඔබේ ව්‍යාපාරයට ඉතා වටිනවා (මොකද ඒ ලැයිස්තුවේ අයිතිය තියෙන්නේ ඔබටයි).",
      "දැන්වීමක් සඳහා වියදම් කළ මුදලට වඩා වැඩි ලාභයක් ලැබුණාද යන්න මැන බැලීම අනිවාර්ය වේ."
    ],
    "exercise": {
      "prompt": "වෙබ් අඩවියකට පැමිණෙන පිරිස සහ ඔවුන් කරන දේවල් නිරීක්ෂණය කිරීමට භාවිතා කරන ප්‍රධාන ගූගල් මෙවලම කුමක්ද?",
      "hint": "Google Analy...",
      "solution": "Google Analytics"
    }
  }
]
};
