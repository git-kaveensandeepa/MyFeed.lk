import { CourseTrackData } from '../../courses.data';

export const EXCEL_COURSE: CourseTrackData = {
  id: 'excel-data-entry',
  title: 'Microsoft Excel & Data Entry Basics',
  titleSinhala: 'Microsoft Excel සහ Data Entry මූලික කරුණු',
  tag: 'Office',
  category: 'office',
  targetAudience: 'everyone',
  targetAudienceLabel: 'කාර්යාල සේවකයින් සහ රැකියා සොයන සැමට',
  level: 'Beginner to Advanced',
  icon: 'table_view',
  gradient: 'bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-500',
  badgeName: 'Excel Master',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Master Microsoft Excel formulas, functions, VLOOKUP, and Pivot Tables for office work and data entry jobs.',
  descriptionSinhala: 'කාර්යාලීය වැඩකටයුතු සහ Freelance Data Entry රැකියා සඳහා අවශ්‍ය වන Excel ගණනය කිරීම්, VLOOKUP සහ Pivot Tables සරලව ඉගෙන ගන්න.',
  lessons: [
  {
    "id": "ex-1",
    "title": "01. Microsoft Excel මූලික හඳුන්වාදීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "Excel අතුරුමුහුණත හඳුනාගැනීම සහ දත්ත ඇතුළත් කිරීමේ (Data Entry) මූලික කරුණු.",
    "analogy": "Excel කියන්නේ හරියට කොටු රූල් පොතක් වගේ. අපි ඒකෙ ඉලක්කම් ලියනවා විතරක් නෙවෙයි, ඒකෙන් අපිට ඕන ගණන් ටිකත් හදලා දෙනවා.",
    "content": [
      "Rows, Columns සහ Cells යනු මොනවාද?",
      "Workbook එකක් සහ Worksheet එකක් අතර වෙනස",
      "මූලික දත්ත ඇතුළත් කිරීම (Text, Numbers, Dates)",
      "Cells වල පළල සහ උස වෙනස් කිරීම (AutoFit)"
    ],
    "keyTakeaways": [
      "තීරුවක් (Column) ඉංග්‍රීසි අකුරු වලින්ද (A, B, C), පේළියක් (Row) ඉලක්කම් වලින්ද (1, 2, 3) දක්වයි.",
      "සෙල් එකක (Cell) නම සැදෙන්නේ අකුර සහ ඉලක්කම එකතු වීමෙනි (උදා: B5)."
    ],
    "exercise": {
      "prompt": "Excel හි තීරු (Columns) දක්වන්නේ අකුරු වලින්ද නැතහොත් ඉලක්කම් වලින්ද?",
      "hint": "අකු...",
      "solution": "අකුරු වලින් (A, B, C...)"
    }
  },
  {
    "id": "ex-2",
    "title": "02. Formatting සහ වගු (Tables) අලංකාර කිරීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "වගුවකට වර්ණ යෙදීම, බෝඩර්ස් (Borders) දැමීම සහ දත්ත පිළිවෙලට සැකසීම.",
    "analogy": "Formatting කියන්නේ හරියට අපි ලියපු රචනාවක මාතෘකා යටින් ඉරි ඇඳලා, පාට පෑන් වලින් ලස්සන කරනවා වගේ වැඩක්.",
    "content": [
      "Font Color, Fill Color සහ Borders යෙදීම",
      "Merge & Center (සෙල් කිහිපයක් එකක් කිරීම)",
      "Wrap Text (දිගු වාක්‍යයන් කොටුව ඇතුළට ගැලපීම)",
      "Format as Table පහසුකම භාවිතා කිරීම"
    ],
    "keyTakeaways": [
      "Merge & Center මඟින් ප්‍රධාන මාතෘකාවක් (Heading) වගුවේ මැදට ගෙන ආ හැක.",
      "Format as Table භාවිතා කිරීමෙන් වගුවකට පහසුවෙන් අලංකාර පෙනුමක් සහ Filters එකතු කරගත හැක."
    ],
    "exercise": {
      "prompt": "දිගු වාක්‍යයක් ඊළඟ කොටුවට (cell) නොගොස්, එම කොටුව ඇතුලතම පේළි දෙකකට කැඩී පෙන්වීමට භාවිතා කරන පහසුකම කුමක්ද?",
      "hint": "Wrap ...",
      "solution": "Wrap Text"
    }
  },
  {
    "id": "ex-3",
    "title": "03. මූලික සූත්‍ර සහ ශ්‍රිත (Formulas and Functions)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "එකතු කිරීම්, අඩු කිරීම් සහ සාමාන්‍යය (Average) වැනි ගණනය කිරීම්.",
    "analogy": "Formula එකක් කියන්නේ Calculator එකේ අපි ගණන් හදනවා වගේ. හැබැයි මේකේ අපි අංක වෙනුවට දෙන්නේ ඒ අංක තියෙන කොටුවල නම් (Cells).",
    "content": [
      "සෑම සූත්‍රයක්ම සමාන ලකුණින් (=) ආරම්භ කිරීම",
      "මූලික ගණනය කිරීම් (+, -, *, /)",
      "SUM() මඟින් එකතුව සෙවීම",
      "AVERAGE(), MIN(), MAX() සහ COUNT() භාවිතය"
    ],
    "keyTakeaways": [
      "ඔබ යම් ගණනය කිරීමක් Excel හි සිදු කරන විට අනිවාර්යයෙන්ම '=' ලකුණ මුලින් යෙදිය යුතුය.",
      "SUM(A1:A10) යන්නෙන් අදහස් වන්නේ A1 සිට A10 දක්වා ඇති සියලුම අගයන් එකතු කිරීමයි."
    ],
    "exercise": {
      "prompt": "Excel හි ගණනය කිරීමක් (Formula එකක්) ආරම්භ කිරීමට පෙර අනිවාර්යයෙන්ම යෙදිය යුතු ලකුණ කුමක්ද?",
      "hint": "සමාන...",
      "solution": "සමාන ලකුණ (= / Equals sign)"
    }
  },
  {
    "id": "ex-4",
    "title": "04. දත්ත පෙරා ගැනීම සහ අනුක්‍රමණය (Sort and Filter)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "විශාල වගුවකින් අපට අවශ්‍ය දත්ත පමණක් වෙන් කරගැනීම සහ පිළිවෙලට සැකසීම.",
    "analogy": "Sort කරනවා කියන්නේ ළමයි ටිකක් උස පිළිවෙලට පෝලිම් කරනවා වගේ. Filter කරනවා කියන්නේ ඒ පෝලිමෙන් කණ්ණාඩි දාපු ළමයි ටික විතරක් ඉස්සරහට එන්න කියනවා වගේ.",
    "content": [
      "දත්ත අකාරාදී පිළිවෙලට (A-Z) සැකසීම (Sort)",
      "කුඩාම අගයේ සිට විශාලතම අගයට සැකසීම",
      "Filter පහසුකම මඟින් නිශ්චිත දත්ත වෙන් කරගැනීම (උදා: \"කොළඹ\" නගරය පමණක්)",
      "Number Filters (උදා: 50 ට වඩා වැඩි දත්ත පමණක්)"
    ],
    "keyTakeaways": [
      "Filter කිරීමේදී අනවශ්‍ය දත්ත මැකී නොයන අතර ඒවා තාවකාලිකව සැඟවීමක් පමණක් සිදුවේ.",
      "ඔබට අවශ්‍ය ඕනෑම අවස්ථාවක Clear Filter ලබා දී නැවත මුළු වගුවම බලාගත හැක."
    ],
    "exercise": {
      "prompt": "නම් ලැයිස්තුවක් අකාරාදී පිළිවෙලට (A ඉඳන් Z දක්වා) සැකසීමට භාවිතා කරන ක්‍රමය කුමක්ද?",
      "hint": "So...",
      "solution": "Sort (A-Z)"
    }
  },
  {
    "id": "ex-5",
    "title": "05. VLOOKUP සහ Pivot Tables (උසස් භාවිතයන්)",
    "level": "Advanced",
    "duration": "මිනිත්තු 25",
    "summary": "වෙනත් වගුවකින් දත්ත සොයාගැනීම සහ විශාල දත්ත ප්‍රමාණයක් සාරාංශ කිරීම.",
    "analogy": "VLOOKUP කියන්නේ හරියට ටෙලිෆෝන් ඩිරෙක්ටරියකින් කෙනෙකුගේ නම බලලා එයාගේ ෆෝන් නම්බර් එක හොයාගන්නවා වගේ වැඩක්.",
    "content": [
      "VLOOKUP ශ්‍රිතය ක්‍රියාකරන ආකාරය සහ එහි භාවිතයන්",
      "දෝෂ (Errors) හඳුනාගැනීම (#N/A, #REF!)",
      "Pivot Tables යනු කුමක්ද?",
      "Pivot Table එකක් මඟින් ක්ෂණිකව වාර්තාවක් (Report) සාදාගැනීම"
    ],
    "keyTakeaways": [
      "VLOOKUP මඟින් විශාල කාලයක් ගතවන දත්ත සෙවීමේ කටයුතු තත්පරයෙන් කරගත හැක.",
      "Pivot Table යනු Excel හි ඇති බලවත්ම පහසුකමක් වන අතර එමඟින් සූත්‍ර ලිවීමකින් තොරවම දත්ත විශ්ලේෂණය කළ හැක."
    ],
    "exercise": {
      "prompt": "එක් වගුවක ඇති අගයක් (උදා: ID අංකය) භාවිතා කර වෙනත් වගුවකින් ඊට අදාළ දත්තයක් (උදා: නම) සොයාගැනීමට භාවිතා කරන ජනප්‍රිය ශ්‍රිතය කුමක්ද?",
      "hint": "VLO...",
      "solution": "VLOOKUP"
    }
  }
]
};
