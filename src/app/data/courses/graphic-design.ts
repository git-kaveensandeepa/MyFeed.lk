import { CourseTrackData } from '../../courses.data';

export const GRAPHIC_DESIGN_COURSE: CourseTrackData = {
  id: 'graphic-design',
  title: 'Graphic Design Basics (Canva & Photoshop)',
  titleSinhala: 'Graphic Design මූලික කරුණු: Canva සහ Photoshop සරලව',
  tag: 'Design',
  category: 'design',
  targetAudience: 'creatives',
  targetAudienceLabel: 'නිර්මාණශීලී දේවල් කිරීමට කැමති සැමට',
  level: 'Beginner to Intermediate',
  icon: 'palette',
  gradient: 'bg-gradient-to-tr from-fuchsia-500 via-pink-600 to-rose-500',
  badgeName: 'Creative Designer',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Learn the principles of good design and how to create stunning graphics using Canva and Adobe Photoshop.',
  descriptionSinhala: 'වර්ණ භාවිතය, අකුරු ගැලපීම වැනි Graphic Design මූලධර්ම සහ Canva, Photoshop භාවිතයෙන් අලංකාර නිර්මාණ කරන ආකාරය ඉගෙන ගන්න.',
  lessons: [
  {
    "id": "gd-1",
    "title": "01. Graphic Design මූලධර්ම සහ වර්ණ භාවිතය (Color Theory)",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "සාර්ථක නිර්මාණයක් සඳහා අවශ්‍ය මූලික නීති සහ වර්ණ ගැලපීම.",
    "analogy": "Graphic Design කියන්නේ ගෙදරක් ලස්සනට පිළිවෙලට අස් කරනවා වගේ. හැමදේම තියෙන්න ඕන තැනක් තියෙනවා, පාට ගැලපෙන්න ඕන.",
    "content": [
      "Design Principles (Alignment, Contrast, Repetition)",
      "වර්ණ චක්‍රය (Color Wheel) සහ Primary/Secondary Colors",
      "Warm සහ Cool වර්ණ මනෝවිද්‍යාව (Color Psychology)",
      "White Space (හිස් ඉඩ) වල වැදගත්කම"
    ],
    "keyTakeaways": [
      "ඕනෑවට වඩා වර්ණ භාවිතා කිරීමෙන් නිර්මාණයේ පැහැදිලිබව නැතිවේ. වර්ණ 2ක් හෝ 3ක් පමණක් භාවිතා කිරීම සුදුසුය.",
      "නිර්මාණයේ හිස් ඉඩ (White space) තැබීමෙන් එය කියවීමට සහ බැලීමට ප්‍රියමනාප වේ."
    ],
    "exercise": {
      "prompt": "නිර්මාණයක කොටස් අතර ඇති හිස් ඉඩ (කඩදාසියේ වර්ණය කුමක් වුවත්) හඳුන්වන්නේ කුමන නමකින්ද?",
      "hint": "White ...",
      "solution": "White Space (හෝ Negative Space)"
    }
  },
  {
    "id": "gd-2",
    "title": "02. Typography: අකුරු (Fonts) නිවැරදිව තෝරාගැනීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "නිර්මාණයකට ගැලපෙන අකුරු විලාසයන් තෝරාගැනීම සහ භාවිතා කිරීම.",
    "analogy": "Typography කියන්නේ ඇඳුමක් තෝරගන්නවා වගේ. Office යන්න අඳින ඇඳුමයි, පාටි යන්න අඳින ඇඳුමයි වෙනස් වගේම, එක එක නිර්මාණ වලට ගැලපෙන අකුරු වෙනස්.",
    "content": [
      "Serif සහ Sans-Serif අකුරු අතර වෙනස",
      "Display Fonts සහ Script Fonts",
      "අකුරු වල ප්‍රමාණය (Hierarchy) පවත්වා ගැනීම",
      "Fonts 2ක් ගැලපීම (Font Pairing)"
    ],
    "keyTakeaways": [
      "පොතක ඡේද වැනි දිගු දේවල් කියවීමට Serif හෝ සරල Sans-Serif අකුරු යොදාගත යුතුය.",
      "එක් නිර්මාණයකට Fonts 2කට වඩා භාවිතා කිරීමෙන් වළකින්න."
    ],
    "exercise": {
      "prompt": "අකුරුවල කෙළවරේ කුඩා කෑලි (වලිග වැනි) නොමැති, නවීන පෙනුමක් ඇති අකුරු වර්ගය හඳුන්වන්නේ කුමක් ලෙසද?",
      "hint": "Sans-S...",
      "solution": "Sans-Serif"
    }
  },
  {
    "id": "gd-3",
    "title": "03. Canva හඳුන්වාදීම සහ මූලික නිර්මාණ සෑදීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 20",
    "summary": "Canva මෘදුකාංගය භාවිතා කරමින් ෆේස්බුක් පෝස්ට් සහ පියාසර පත්‍රිකා (Flyers) නිර්මාණය කිරීම.",
    "analogy": "Canva කියන්නේ හරියට නූඩ්ල්ස් හදනවා වගේ. ගොඩක් දේවල් කලින්ම හදලා (Templates) තියෙන්නේ, අපිට තියෙන්නේ වතුර ටිකක් දාලා අවශ්‍ය විදියට වෙනස් කරගන්න විතරයි.",
    "content": [
      "Canva අතුරුමුහුණත (Interface) හඳුනාගැනීම",
      "Templates නිවැරදිව තෝරාගැනීම සහ වෙනස් කිරීම",
      "Images, Elements සහ Text එකතු කිරීම",
      "නිර්මාණය Export කිරීම (PNG, JPG, PDF)"
    ],
    "keyTakeaways": [
      "Canva මඟින් කිසිදු Design දැනුමක් නොමැතිව වුවද ඉතා ඉක්මනින් වෘත්තීය මට්ටමේ නිර්මාණයක් කළ හැක.",
      "පින්තූර අප්ලෝඩ් කර පසුබිම ඉවත් කිරීම (Background Remove) වැනි පහසුකම් මෙහි ඇත."
    ],
    "exercise": {
      "prompt": "අන්තර්ජාලය හරහා ඉතා පහසුවෙන් Graphic Design කිරීමට භාවිතා කළ හැකි ප්‍රසිද්ධ නොමිලේ දෙන වෙබ් අඩවිය කුමක්ද?",
      "hint": "Can...",
      "solution": "Canva"
    }
  },
  {
    "id": "gd-4",
    "title": "04. Adobe Photoshop මූලික කරුණු (Layers සහ Selection)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "Photoshop හි Layers සංකල්පය සහ පින්තූරවල කොටස් තෝරාගැනීම (Select කිරීම).",
    "analogy": "Photoshop Layers කියන්නේ විනිවිද පෙනෙන වීදුරු තහඩු කිහිපයක් එක උඩ එක තියලා චිත්‍රයක් අඳිනවා වගේ. යට තියෙන තහඩුවේ (Layer) දේවල් උඩින් තියෙන තහඩුවෙන් වැහෙනවා.",
    "content": [
      "Photoshop Interface සහ Tools හඳුනාගැනීම",
      "Layers ක්‍රියාකරන ආකාරය",
      "Selection Tools (Magic Wand, Quick Selection, Lasso)",
      "පින්තූරයක පසුබිම (Background) ඉවත් කිරීම"
    ],
    "keyTakeaways": [
      "Photoshop හි සෑම දෙයක්ම වෙන වෙනම Layers වල තැබීමෙන් පසුව පහසුවෙන් සංස්කරණය කළ හැක.",
      "Selection එකක් නිවැරදිව ගැනීම පින්තූරය තාත්විකව (Realistic) පෙනීමට ඉතා වැදගත් වේ."
    ],
    "exercise": {
      "prompt": "Photoshop හි පින්තූරයක විවිධ කොටස් වෙන වෙනම තබා ගැනීමට භාවිතා කරන ක්‍රමය කුමක්ද?",
      "hint": "Lay...",
      "solution": "Layers"
    }
  },
  {
    "id": "gd-5",
    "title": "05. Photo Retouching සහ Effects (ඡායාරූප සංස්කරණය)",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "Photoshop භාවිතයෙන් ඡායාරූප වල ලප කැලැල් ඉවත් කිරීම සහ වර්ණ නිවැරදි කිරීම.",
    "analogy": "Photo Retouching කියන්නේ හරියට මූණට මේකප් (Makeup) දානවා වගේ, තියෙන අඩුපාඩු මකලා ලස්සන කරන එකයි.",
    "content": [
      "Spot Healing Brush සහ Clone Stamp භාවිතය",
      "Brightness, Contrast සහ Color Balance වෙනස් කිරීම",
      "Filters සහ Blending Modes භාවිතය",
      "Text Effects සහ Drop Shadows එකතු කිරීම"
    ],
    "keyTakeaways": [
      "Clone Stamp tool එක මඟින් පින්තූරයේ එක් කොටසක් කොපි කර වෙනත් තැනකට පේස්ට් කළ හැක.",
      "Blending Modes මඟින් Layers දෙකක් ඉතා අලංකාර ලෙස එකට මිශ්‍ර කළ හැක."
    ],
    "exercise": {
      "prompt": "මුහුණේ ඇති කුරුලෑ හෝ ලප පහසුවෙන් මකා දැමීමට Photoshop හි බහුලවම භාවිතා කරන tool එක කුමක්ද?",
      "hint": "Spot Healing...",
      "solution": "Spot Healing Brush Tool"
    }
  }
]
};
