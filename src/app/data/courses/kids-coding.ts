import { CourseTrackData } from '../../courses.data';

export const KIDS_CODING_COURSE: CourseTrackData = {
  id: 'kids-coding-scratch',
  title: 'Kids Coding Logic & Game Design (16 Lessons)',
  titleSinhala: 'කුඩා දරුවන්ට Coding Logic, Scratch සහ පරිගණක ක්‍රීඩා නිර්මාණය (පාඩම් 16)',
  tag: 'Kids',
  category: 'kids',
  targetAudience: 'kids',
  targetAudienceLabel: 'වයස අවුරුදු 8-16 දරුවන් සහ පාසල් සිසුන් සඳහා',
  level: 'Beginner to Pro (ආරම්භකයේ සිට උසස් මට්ටම දක්වා)',
  icon: 'sports_esports',
  gradient: 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500',
  badgeName: 'Junior Game Creator',
  totalDuration: 'පැය 4.0 (පාඩම් 16)',
  description: 'Learn computational thinking, loops, variables, Scratch block coding, sound effects, physics, and build 2D playable arcade games.',
  descriptionSinhala: 'දරුවන්ට තාර්කික චින්තනය (Logic), Scratch Visual Blocks, සජීවීකරණය (Animation), චරිත (Sprites), ශබ්ද ප්‍රයෝග සහ සුපිරි 2D Games නිර්මාණය මුල සිට සරලව.',
  lessons: [
    {
      id: 'kid-1',
      title: '01. Coding කියන්නේ මොකක්ද? පරිගණකයට උපදෙස් දෙන රහස් භාෂාව',
      level: 'Beginner',
      duration: 'මිනිත්තු 6 (6 min)',
      summary: 'Coding හෙවත් ක්‍රමලේඛනය යනු කුමක්ද, පරිගණකය මිනිස් භාෂාව තේරුම් නොගන්නා ආකාරය, සහ පරිගණකයකට පියවරෙන් පියවර උපදෙස් ලබාදෙන ආකාරය.',
      analogy: 'Coding කියන්නේ අම්මා කේක් එකක් හදන්න Recipe එකක් පිළිපදිනවා වගේ වැඩක්: සෑම පියවරක්ම නිවැරදි පිළිවෙලට කලොත් පමණක් රසවත් කේක් එකක් හැදේ.',
      simplifiedExplanation: 'පරිගණකය කියන්නේ ඔබ කියන දේ පමණක් කරන ඉතා කීකරු රොබෝවරයෙක් වගේ. ඔබ නිවැරදිව උපදෙස් දුන්නොත් එය ඕනෑම ක්‍රීඩාවක් සාදා පෙන්වයි.',
      content: [
        'Algorithms: සරල පියවරෙන් පියවර උපදෙස් මාලාවක් (Step-by-step instructions).',
        'Human Language vs Machine Language (1 සහ 0 සංඥා).',
        'Visual Block Coding (Scratch) මඟින් පහසුවෙන් කේත ලිවීම.',
        'පළමු උපදෙස: "Sprite එක පියවර 10ක් ඉදිරියට ගෙන යන්න".'
      ],
      keyTakeaways: [
        'Coding කියන්නේ අපහසු දෙයක් නොවේ, එය Lego Bricks සවි කරනවා වැනි විනෝදජනක ක්‍රීඩාවකි.',
        'පරිගණකයට නිවැරදි පිළිවෙලට උපදෙස් ලබාදිය යුතුය.'
      ],
      exercise: {
        prompt: 'පරිගණකයකට ලබාදෙන පියවරෙන් පියවර උපදෙස් මාලාව හඳුන්වන නම කුමක්ද?',
        hint: 'Algo...',
        solution: 'ඇල්ගොරිතමයක් (Algorithm).'
      }
    },
    {
      id: 'kid-2',
      title: '02. Scratch Interface එක හඳුනා ගනිමු (Sprites, Stage සහ Block Palette)',
      level: 'Beginner',
      duration: 'මිනිත්තු 6 (6 min)',
      summary: 'MIT Scratch වේදිකාව: Sprites (චරිත), Stage (ක්‍රීඩා පිටිය), Blocks Palette (වර්ණවත් උපදෙස් කුට්ටි), සහ Green Flag (ක්‍රීඩාව ආරම්භ කිරීම).',
      analogy: 'Scratch කියන්නේ රූකඩ නාට්‍ය වේදිකාවක් වගේ: Sprites කියන්නේ රූකඩ චරිත, Stage කියන්නේ වේදිකාව, Scripts කියන්නේ රූකඩ වලට චලනය වීමට දෙන උපදෙස්.',
      simplifiedExplanation: 'Scratch බළලා අපේ පළමු චරිතයයි. පාට පාට Blocks එකට එකතු කරලා බළලාට නටන්න, පනින්න උගන්වමු.',
      content: [
        'Stage: ක්‍රීඩාවේ දර්ශන දිස්වන තිරය (Coordinates: X සහ Y).',
        'Sprites: බළලා, බෝල, කුරුල්ලන් හෝ ඔබේම චරිත ඇඳීම.',
        'Blocks Palette: Motion (නිල්), Looks (දම්), Sound (රෝස), Events (කහ).',
        'When Green Flag Clicked: ක්‍රීඩාව පටන් ගන්නා කහ පැහැති ප්‍රධාන Block එක.'
      ],
      keyTakeaways: [
        'Scratch හි කේත ටයිප් කිරීමට අවශ්‍ය නැත, වර්ණවත් Blocks එක මත එක සවි කිරීම ප්‍රමාණවත්ය.',
        'Green Flag එබූ විට ඔබ හැදූ සියලුම Blocks ක්‍රියාත්මක වේ.'
      ],
      exercise: {
        prompt: 'Scratch හි ක්‍රීඩාවක් ආරම්භ කිරීමට ඔබන ප්‍රධාන සංකේතය කුමක්ද?',
        hint: 'කොළ පාට කොඩිය.',
        solution: 'Green Flag (කොළ පැහැති ධජය).'
      }
    },
    {
      id: 'kid-3',
      title: '03. Motion Blocks: Sprite චරිතය තිරයේ එහා මෙහා ගෙන යමු (X & Y Coordinates)',
      level: 'Beginner',
      duration: 'මිනිත්තු 6 (6 min)',
      summary: 'X (තිරස් අතට වමට/දකුණට) සහ Y (සිරස් අතට ඉහළට/පහළට) අක්ෂ තේරුම් ගැනීම, Move 10 steps, Go to X Y, සහ Glide to position.',
      analogy: 'X සහ Y කියන්නේ නිවසක ලිපිනයක් වගේ: තිරයේ මැද (0, 0) වන අතර දකුණට යනවිට X වැඩිවේ, ඉහළට යනවිට Y වැඩිවේ.',
      simplifiedExplanation: 'දකුණට යන්න X එකට +10ක් එකතු කරන්න. උඩට පනින්න Y එකට +10ක් එකතු කරන්න.',
      content: [
        'X Axis: වම (-240) සිට දකුණ (+240) දක්වා.',
        'Y Axis: පහළ (-180) සිට ඉහළ (+180) දක්වා.',
        'Point in direction 90 (දකුණට මුහුණ ලෑම).',
        'If on edge, bounce: තිරයේ කොනක වැදුණු විට ආපසු හැරවීම.'
      ],
      keyTakeaways: [
        'X මඟින් වම-දකුණත්, Y මඟින් උඩ-යටත් පාලනය වේ.',
        'If on edge, bounce යෙදූ විට චරිතය තිරයෙන් එළියට නොයා ක්‍රීඩා පිටියේම රැඳේ.'
      ],
      exercise: {
        prompt: 'චරිතයක් තිරයේ ඉහළට ගෙන යාමට වෙනස් කළ යුත්තේ X අගයද Y අගයද?',
        hint: 'සිරස් අක්ෂය.',
        solution: 'Y අගය (Y Coordinate) වැඩි කළ යුතුය.'
      }
    },
    {
      id: 'kid-4',
      title: '04. Looks & Costumes: චරිත වලට පණ දීම සහ ඇවිදින Animation සැකසීම',
      level: 'Beginner',
      duration: 'මිනිත්තු 6 (6 min)',
      summary: 'Costumes (ඇඳුම්/ඉරියව්) මාරු කරමින් චරිත ඇවිදින ආකාරය පෙන්වීම (Next Costume), Say Hello for 2 seconds (කතා කිරීම), සහ Change Size by 10.',
      analogy: 'Costumes කියන්නේ සජීවීකරණ චිත්‍රපටයක (Cartoon) එකිනෙකට සුළු වෙනස්කම් සහිත පින්තූර වේගයෙන් පෙරලීම වගේ.',
      simplifiedExplanation: 'බළලාගේ Costume 1 සහ Costume 2 මාරුවෙන් මාරුවට දැමූ විට බළලා ඇත්තටම ඇවිදිනවා වගේ පෙනේ.',
      content: [
        'Costumes Tab: Sprite එකක විවිධ ඉරියව් ඇඳීම සහ තෝරාගැනීම.',
        'Next Costume block එක සමඟ Wait 0.1 seconds යෙදීම.',
        'Say "Welcome to my Game!" Speech Bubbles.',
        'Ghost Effect සහ Color Effect මඟින් මැජික් වර්ණ වෙනස්කම් කිරීම.'
      ],
      keyTakeaways: [
        'Next Costume block එක මඟින් චරිත වලට සජීවී ඇවිදීමේ හෝ පියාසර කිරීමේ පෙනුමක් ලැබේ.',
        'Wait block එකක් නොදැමුවහොත් Animation එක ඕනෑවට වඩා වේගයෙන් සිදුවේ.'
      ],
      exercise: {
        prompt: 'චරිතයක් ඇවිදින පෙනුමක් ලබාගැනීමට එක දිගට මාරු කරන්නේ මොනවාද?',
        hint: 'Costumes...',
        solution: 'Costumes (ඉරියව්/ඇඳුම්).'
      }
    },
    {
      id: 'kid-5',
      title: '05. Sounds & Music: සතුටුදායක ශබ්ද ප්‍රයෝග සහ Game Background Music',
      level: 'Beginner',
      duration: 'මිනිත්තු 6 (6 min)',
      summary: 'Sound Blocks: Play Sound until done, Start Sound, Sound Editor එකෙන් ශබ්ද කැපීම සහ වේගවත් කිරීම, මෙන්ම මයික්‍රෆෝනයෙන් ඔබේම කටහඬ පටිගත කිරීම.',
      analogy: 'ශබ්ද ප්‍රයෝග කියන්නේ චිත්‍රපටයක පසුබිම් සංගීතය වගේ: Coin එකක් ගත් විට "Ting" ශබ්දය ඇසුණු විට ක්‍රීඩාව වඩාත් විනෝදජනක වේ.',
      simplifiedExplanation: 'ක්‍රීඩාවේ Coin එකක් අහුලද්දී "Coin" සද්දෙත්, Game Over වෙද්දී "Oops" සද්දෙත් දාන්න Sound Blocks යොදමු.',
      content: [
        'Sound Library එකෙන් ජනප්‍රිය සත්ව නාද සහ Game Sounds තෝරාගැනීම.',
        'Play Sound vs Start Sound (අනෙක් Blocks නොනවත්වා පසුබිමින් වාදනය වීම).',
        'Change Pitch and Volume (ශබ්දය සහ තාරතාව වෙනස් කිරීම).',
        'ඔබේම හඬින් Game Voiceover එකක් පටිගත කර එකතු කිරීම.'
      ],
      keyTakeaways: [
        'Start Sound යෙදූ විට ශබ්දය වාදනය වන අතරතුරම චරිතයට චලනය විය හැක.',
        'ක්‍රීඩාව ආරම්භයේදීම මෘදු පසුබිම් සංගීතයක් Loop කර තැබිය හැක.'
      ],
      exercise: {
        prompt: 'ක්‍රීඩාවක ලකුණක් ලැබුණු විට ශබ්දයක් වාදනය කිරීමට යොදාගන්නේ කුමන වර්ණයේ Blocks ද?',
        hint: 'Sound Blocks (රෝස පැහැය).',
        solution: 'Sound Blocks (Magenta/Pink Blocks).'
      }
    },
    {
      id: 'kid-6',
      title: '06. Events & Keyboard Controls: Arrow Keys මඟින් චරිතය පාලනය කරමු',
      level: 'Beginner',
      duration: 'මිනිත්තු 7 (7 min)',
      summary: 'Keyboard Events: When [Right Arrow] key pressed -> Change X by 10, When [Left Arrow] key pressed -> Change X by -10, Space Key Jump.',
      analogy: 'Keyboard Controls කියන්නේ PlayStation හෝ Remote Control එකක බොත්තම් ඔබන විට රූපවාහිනී චරිතය චලනය වීම වගේ.',
      simplifiedExplanation: 'යතුරුපුවරුවේ ඊතල (Arrow Keys) එබූ විට අපේ ක්‍රීඩකයා වමට, දකුණට, උඩට සහ පහළට ගෙන යමු.',
      content: [
        'When key pressed block එකෙහි ක්‍රියාකාරිත්වය.',
        'Smooth Movement: Forever loop එකක් ඇතුළේ `If <Key pressed?> then Change X`.',
        'Space Bar එක එබූ විට උඩ පැන ආපසු බිමට වැටීම (Jump Simulation).',
        'Mobile Touch Buttons සෑදීම (When this sprite clicked).'
      ],
      keyTakeaways: [
        'Forever loop එකක් ඇතුළේ Key Pressed පරීක්ෂා කළ විට චරිතය ඉතාම සුමටව (Smoothly) ගමන් කරයි.',
        'Change X by 10 දකුණටත්, Change X by -10 වමටත් ගෙන යයි.'
      ],
      exercise: {
        prompt: 'යතුරුපුවරුවේ වම් ඊතලය (Left Arrow) එබූ විට චරිතය වමට යාමට Change X කළ යුත්තේ කුමන අගයකින්ද?',
        hint: 'Minus අගයක්.',
        solution: 'Change X by -10 (සෘණ 10කින්).'
      }
    },
    {
      id: 'kid-7',
      title: '07. Loops (පුනරාවර්තන): Repeat 10 vs Forever Loops මඟින් කාලය ඉතිරි කිරීම',
      level: 'Beginner',
      duration: 'මිනිත්තු 7 (7 min)',
      summary: 'එකම දේ නැවත නැවත නොලියා Loops භාවිතය: Repeat (නියමිත වාර ගණනක්), Forever (නොනවත්වා සදාකාලිකව), සහ Repeat Until (කොන්දේසියක් සත්‍ය වන තුරු).',
      analogy: 'Forever Loop එකක් කියන්නේ ඔරලෝසුවක කටු නොනවත්වා කැරකෙනවා වගේ; Repeat 10 කියන්නේ ගුරුවරයා "10 වතාවක් පනින්න" කී විට 10 වරක් පැන නතර වීම වැනිය.',
      simplifiedExplanation: 'Move 10 steps කියා 100 වතාවක් ලියන්නේ නැතිව, Repeat 100 ඇතුළට එක Move block එකක් දැමීම ප්‍රමාණවත්ය.',
      content: [
        'Repeat (10): නියමිත වාර ගණනක් චලනය වීම.',
        'Forever: ක්‍රීඩාව පවතින තාක් කල් සතුරු චරිත එහා මෙහා යැවීම.',
        'Repeat Until <Touching Edge?>: බිත්තියේ වදින තුරු පමණක් දිවීම.',
        'Stop All block: ක්‍රීඩාව අවසන් වූ විට සියලුම Loops නතර කිරීම.'
      ],
      keyTakeaways: [
        'Loops මඟින් විශාල කේත පේළි ගණනක් තනි කුඩා Block එකක් බවට පත් කරයි.',
        'Game Engine එකක් සැමවිටම ධාවනය වන්නේ Forever Loop එකක් මතයි.'
      ],
      exercise: {
        prompt: 'ක්‍රීඩාව අවසන් වන තුරු පසුබිම් සංගීතය නොනවත්වා වාදනය වීමට භාවිතා කළ යුතු Loop එක කුමක්ද?',
        hint: 'Forever...',
        solution: 'Forever Loop එක.'
      }
    },
    {
      id: 'kid-8',
      title: '08. Conditions (කොන්දේසි): If-Then සහ If-Then-Else මඟින් පරිගණකයට තීරණ ගැනීමට උගන්වමු',
      level: 'Intermediate',
      duration: 'මිනිත්තු 7 (7 min)',
      summary: 'තීරණ ගැනීමේ තර්කනය (Logic): If <Touching Apple?> then (Change Score by 1), If <Touching Lava?> then (Game Over) Else (Keep Playing).',
      analogy: 'Condition එකක් කියන්නේ "වැස්සොත් කුඩය ඉහලන්න, නැත්නම් සාමාන්‍ය පරිදි යන්න" වැනි එදිනෙදා ජීවිතයේ තීරණ ගැනීමකි.',
      simplifiedExplanation: '"සතුරාව ඇල්ලුවොත් ලකුණු 1ක් දෙන්න, බෝම්බය ඇල්ලුවොත් පණ 1ක් අඩු කරන්න" කියා පරිගණකයට කියා දෙන්නේ If-Then මඟිනි.',
      content: [
        'If <Condition> then Structure.',
        'If <Condition> then ... Else ... Dual Branching.',
        'Operators: Greater than (>), Less than (<), Equals (=).',
        'Nested Ifs: එක කොන්දේසියක් ඇතුළේ තවත් කොන්දේසියක් පරීක්ෂා කිරීම.'
      ],
      keyTakeaways: [
        'If block එකක් ඇතුළේ ඇති කේතය ක්‍රියාත්මක වන්නේ එහි ඇති කොන්දේසිය True (සත්‍ය) වූ විට පමණි.',
        'ක්‍රීඩාවක සියලුම නීති සහ ජයග්‍රහණ පාලනය වන්නේ කොන්දේසි මඟිනි.'
      ],
      exercise: {
        prompt: 'ක්‍රීඩකයා ඇපල් ගෙඩියක ස්පර්ශ වූ විට ලකුණු වැඩි කිරීමට භාවිතා කරන Block එක කුමක්ද?',
        hint: 'If <Touching Apple?> then...',
        solution: 'If <Touching Apple?> then (Change Score by 1).'
      }
    },
    {
      id: 'kid-9',
      title: '09. Sensing Blocks: Touching Color, Distance to Mouse & User Questions (Ask & Answer)',
      level: 'Intermediate',
      duration: 'මිනිත්තු 7 (7 min)',
      summary: 'පරිසරය හඳුනාගැනීම (Sensors): Touching Sprite?, Touching Color (රතු පාට ගින්දර හඳුනාගැනීම), Distance to Mouse-pointer, සහ Ask "What is your name?" and wait.',
      analogy: 'Sensing කියන්නේ මිනිසාගේ ඇස්, කන් සහ සම වැනි ඉන්ද්‍රියන් වගේ: ක්‍රීඩාවේ චරිත බිත්ති වල වදිනවාද, තණකොළ පාගනවාද යන්න හඳුනා ගනී.',
      simplifiedExplanation: 'ස්ප්‍රයිට් එක මවුස් එක පස්සෙන් එලවන්න Distance to Mouse යොදන්න. ප්‍රශ්නයක් අසන්න Ask block එක යොදන්න.',
      content: [
        'Touching Color: Maze (ප්‍රහේලිකා) ක්‍රීඩා වලදී කළු බිත්ති වල නොවැදී යාම.',
        'Point towards mouse-pointer: තුවක්කුව හෝ චරිතය මවුස් එක දෙසට හැරවීම.',
        'Ask "ඔබේ නම කුමක්ද?" and wait -> Say (join "ආයුබෝවන් " answer).',
        'Timer and Loudness (මයික්‍රෆෝනයේ ශබ්දය අනුව පනින ක්‍රීඩා).'
      ],
      keyTakeaways: [
        'Touching Color මඟින් සංකීර්ණ Maze Maps නිර්මාණය කිරීම ඉතා පහසු වේ.',
        'Answer block එකේ ගබඩා වන්නේ පරිශීලකයා යතුරුපුවරුවෙන් ටයිප් කළ පිළිතුරයි.'
      ],
      exercise: {
        prompt: 'ප්‍රහේලිකා (Maze) ක්‍රීඩාවක බිත්තියක වැදුණාදැයි හඳුනා ගැනීමට යොදන Sensing Block එක කුමක්ද?',
        hint: 'Touching Color...',
        solution: 'Touching Color <Wall Color> Block එක.'
      }
    },
    {
      id: 'kid-10',
      title: '10. Variables (විචල්‍යයන්): Score (ලකුණු), Lives (පණ ගණන) සහ Timer සාදමු',
      level: 'Intermediate',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'විචල්‍යයන් යනු දත්ත තබාගන්නා පෙට්ටි වැනිය: Make a Variable (Score, Lives, Level), Set Score to 0, Change Score by 1, සහ Show/Hide Variable.',
      analogy: 'Variable එකක් කියන්නේ ක්‍රිකට් ලකුණු පුවරුවක් වගේ: හතරේ පහරක් ගැසූ විට පැරණි ලකුණ මකා අලුත් ලකුණ (+4) ලියයි.',
      simplifiedExplanation: 'ක්‍රීඩාව පටන් ගනිද්දී Score = 0 කරන්න. Coin එකක් අහුලද්දී Change Score by 1 කරන්න.',
      content: [
        'Variables Tab -> Make a Variable (For all sprites).',
        'Score Counter සෑදීම සහ Screen එකේ ඉහළින් පෙන්වීම.',
        'Lives System: Set Lives to 3 -> සතුරෙකු වැදුණු විට Change Lives by -1.',
        'Game Over Condition: If <Lives = 0> then (Broadcast Game Over).'
      ],
      keyTakeaways: [
        'ක්‍රීඩාව ආරම්භයේදී (Green Flag) සැමවිටම Variables Reset (Score = 0, Lives = 3) කළ යුතුය.',
        'Change Variable by 1 මඟින් ලකුණු 1කින් වැඩි වන අතර -1 මඟින් 1කින් අඩු වේ.'
      ],
      exercise: {
        prompt: 'ක්‍රීඩාවක ජීවිත 3ක් ලබාදී සතුරෙකු ස්පර්ශ වන සෑම විටම ජීවිත 1 බැගින් අඩු කිරීමට යොදන block එක කුමක්ද?',
        hint: 'Change Lives by -1',
        solution: 'Change Lives by -1'
      }
    },
    {
      id: 'kid-11',
      title: '11. Broadcast Messages: චරිත අතර පණිවිඩ හුවමාරුව (Game Over & Next Level)',
      level: 'Intermediate',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'Inter-Sprite Messaging: Broadcast [Start Game], Broadcast [Game Over], When I receive [Game Over] -> Show Game Over Banner සහ Stop Other Scripts.',
      analogy: 'Broadcast කියන්නේ පාසලේ විදුහල්පතිතුමා ශබ්ද විකාශන යන්ත්‍රයෙන් (Loudspeaker) නිවේදනයක් කළ විට මුළු පාසලේම ළමුන් එයට සවන් දී ක්‍රියාත්මක වීම වගේ.',
      simplifiedExplanation: 'බළලා පැරදුණු විට "Game Over" පණිවිඩය විකාශය (Broadcast) කරයි. එවිට Game Over තිරය මතුවී සියලුම සතුරන් අතුරුදහන් වේ.',
      content: [
        'Broadcast <Message Name> block එක සෑදීම.',
        'When I receive <Message Name> block මඟින් ප්‍රතිචාර දැක්වීම.',
        'Stage Backdrop එක Next Level එකට මාරු කිරීම.',
        'Winner Screen සහ Confetti Particle Effects පෙන්වීම.'
      ],
      keyTakeaways: [
        'Broadcast Messages මඟින් විවිධ චරිත එකිනෙකා සමඟ සම්බන්ධීකරණය (Sync) කරයි.',
        'Level මාරු කිරීමේදී Broadcast NextLevel යවා නව පසුබිම සහ සතුරන් කැඳවිය හැක.'
      ],
      exercise: {
        prompt: 'එක් චරිතයක් මියගිය විට අනෙක් සියලුම චරිත වලට එය දැනුම් දීමට භාවිතා කරන Block එක කුමක්ද?',
        hint: 'Broadcast...',
        solution: 'Broadcast <Game Over> Block එක.'
      }
    },
    {
      id: 'kid-12',
      title: '12. Clones (චරිත පිටපත්): වැටෙන ඇපල්, උණ්ඩ (Bullets) සහ තරු වැස්සක් හදමු',
      level: 'Intermediate',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'චරිත 100ක් තනි තනිව නොසාදා Clones භාවිතය: Create clone of myself, When I start as a clone (Random X Position, Fall Down Y by -5), සහ Delete this clone.',
      analogy: 'Clone කියන්නේ සෙවණැලි හමුදාවක් හෝ ජෙරොක්ස් මැෂිමකින් එකම චිත්‍රයේ පිටපත් 100ක් ක්ෂණිකව මුද්‍රණය කරනවා වගේ.',
      simplifiedExplanation: 'අහසින් ඇපල් 100ක් වැටෙන්න එක ඇපල් ගෙඩියකින් Clones හදන්න. බිම වැදුණු පසු Delete this clone කරන්න.',
      content: [
        'Create clone of myself block එක Forever loop එකක යෙදීම.',
        'When I start as a clone: Pick random X (-200 to 200), Y = 180.',
        'Fall Physics: Repeat until <Touching Edge or Basket> { Change Y by -5 }.',
        'Delete this clone මඟින් Memory පිරීම වැළැක්වීම.'
      ],
      keyTakeaways: [
        'Clones මඟින් Space Invaders වැනි Shooting Games සහ Falling Objects Games පහසුවෙන් සෑදිය හැක.',
        'වැඩ අවසන් වූ Clone එක සැමවිටම Delete this clone මඟින් මකා දමන්න.'
      ],
      exercise: {
        prompt: 'අහසින් වැටුණු පලතුරක් බිම පතිත වූ පසු ක්‍රීඩාවෙන් ඉවත් කිරීමට යොදන block එක කුමක්ද?',
        hint: 'Delete this clone',
        solution: 'Delete this clone Block එක.'
      }
    },
    {
      id: 'kid-13',
      title: '13. Game Project 1: "Catch the Falling Fruits" (Arcade Game එකක් මුල සිට අගට)',
      level: 'Intermediate',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'සම්පූර්ණ ක්‍රීඩාවක් ගොඩනඟමු: බඳුනක් (Bowl) Arrow Keys වලින් පාලනය කිරීම, අහසින් අහඹු ලෙස වැටෙන පලතුරු ඇල්ලීම, Score එක 20 වූ විට Next Level එකට යාම, සහ බෝම්බ ඇල්ලීමෙන් වැළකීම.',
      analogy: 'පළතුරු අල්ලන ක්‍රීඩාව හරියට ගසකින් වැටෙන අඹ ගෙඩි කූඩයකට අල්ලා ගන්නවා වගේ ක්‍රීඩාවකි.',
      simplifiedExplanation: 'අපි දැන් ඉගෙන ගත් Motion, Loops, If-Then, Variables සහ Clones එකතු කරලා අපේම පළමු ක්‍රීඩාව හදමු!',
      content: [
        'පියවර 1: Basket Sprite එක සාදා Arrow Key Controls දැමීම.',
        'පියවර 2: Apple Sprite එක Clones මඟින් ඉහළ සිට පහළට වැටීමට සැලැස්වීම.',
        'පියවර 3: Basket එකේ වැදුණු විට Ding Sound සමඟ Score +1 කිරීම.',
        'පියවර 4: Bomb Sprite එකක් සාදා වැදුණු විට Game Over කිරීම.'
      ],
      keyTakeaways: [
        'කුඩා කොටස් එකිනෙක සම්බන්ධ කිරීමෙන් විශිෂ්ට පරිගණක ක්‍රීඩාවක් සෑදිය හැක.',
        'ක්‍රීඩාව මිතුරන්ට ක්‍රීඩා කිරීමට දී ඔවුන්ගේ අදහස් (Feedback) ලබාගන්න.'
      ],
      exercise: {
        prompt: 'Catch the Fruits ක්‍රීඩාවේ පලතුරක් වැටෙන වේගය වැඩි කර ක්‍රීඩාව අපහසු කරන්නේ කෙසේද?',
        hint: 'Change Y by -5 වෙනුවට -10 කිරීම.',
        solution: 'Change Y by සෘණ අගය වැඩි කිරීමෙන් (උදා: -5 වෙනුවට -10 කිරීමෙන්).'
      }
    },
    {
      id: 'kid-14',
      title: '14. Game Project 2: "Flappy Bird" හෝ "Dino Jump" Physics Game එකක් හදමු',
      level: 'Pro',
      duration: 'මිනිත්තු 9 (9 min)',
      summary: 'Physics & Gravity (ගුරුත්වාකර්ෂණය): Y Velocity Variable එකක් සාදා චරිතය ස්වයංක්‍රීයව පහළට වැටීම (Gravity), Space Bar එබූ විට ඉහළට පැනීම (Flap/Jump), සහ බාධක (Pipes) මඟහැරීම.',
      analogy: 'Gravity කියන්නේ පන්දුවක් උඩ දැමූ විට එය නැවත බිමට ඇද වැටෙන ස්වභාවික නීතියයි.',
      simplifiedExplanation: 'චරිතය නිතරම පහළට වැටෙනවා. අපි Space ගැහුවම උඩට පනිනවා. පයිප්ප වල නොවැදී පියාසර කරන්න ඕන.',
      content: [
        'Gravity Engine: Set Velocity_Y to -1 -> Change Y by Velocity_Y.',
        'Jump Impulse: When Space pressed -> Set Velocity_Y to 12.',
        'Moving Obstacles: Pipes දකුණේ සිට වමට ගමන් කරවීම.',
        'High Score System: Cloud Variables මඟින් වැඩිම ලකුණ Save කිරීම.'
      ],
      keyTakeaways: [
        'Velocity_Y Variable එකක් මඟින් ඉතාම යථාර්ථවාදී (Realistic) පැනීම් සහ ගුරුත්වාකර්ෂණයක් ලැබේ.',
        'Flappy Bird වැනි ලොව සුපතල ක්‍රීඩා වලට පදනම වන්නේද මෙම සරල තර්කයයි.'
      ],
      exercise: {
        prompt: 'පැනීමේදී චරිතය ස්වභාවිකව බිමට ඇද වැටීමට යොදන භෞතික විද්‍යා සංකල්පය කුමක්ද?',
        hint: 'Gravity (ගුරුත්වාකර්ෂණය).',
        solution: 'Gravity (ගුරුත්වාකර්ෂණය / Y Velocity).'
      }
    },
    {
      id: 'kid-15',
      title: '15. Scratch සිට Python සහ Text-Based Coding වෙත පාලම (Next Step)',
      level: 'Pro',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'Scratch Blocks සැබෑ Python කේත බවට පරිවර්තනය වන අයුරු: `repeat 10` යනු `for i in range(10):`, `if-then` යනු `if score > 10:`, Variables, සහ Turtle Graphics මඟින් චිත්‍ර ඇඳීම.',
      analogy: 'Scratch කියන්නේ බයිසිකල් පදින්න පුහුණු රෝද (Training wheels) වගේ: එයින් සමබරතාව ඉගෙන ගත් පසු ඕනෑම ලොකු බයිසිකලයක් (Python/JavaScript) පැදිය හැක.',
      simplifiedExplanation: 'ඔබ Scratch වලින් ඉගෙන ගත් සියලුම දේවල් සැබෑ Software Engineers ලා ලියන Python භාෂාවට සමානයි.',
      content: [
        'Scratch Block: `Move 10 steps` -> Python: `player.forward(10)`.',
        'Scratch Block: `If Touching Color` -> Python: `if player.colliderect(obstacle):`.',
        'Python Turtle Graphics මඟින් ජ්‍යාමිතික රටා ඇඳීම.',
        'වෘත්තීය Game Engines (Roblox Lua, Godot, Unity C#) පිළිබඳ හැඳින්වීම.'
      ],
      keyTakeaways: [
        'ඔබ දැන් ලෝකයේ ඕනෑම පරිගණක භාෂාවක් තේරුම් ගත හැකි ශක්තිමත් Logic පදනමක් ගොඩනගා අවසන්!',
        'Scratch වලදී ඉගෙන ගත් Loops සහ Variables සියලුම Text Coding භාෂා වලද ඒ ආකාරයෙන්ම ක්‍රියා කරයි.'
      ],
      exercise: {
        prompt: 'Scratch හි `repeat 5` යන loop එක Python භාෂාවෙන් ලියන්නේ කෙසේද?',
        hint: 'for i in range(5):',
        solution: 'for i in range(5):'
      }
    },
    {
      id: 'kid-16',
      title: '16. Junior Game Creator: ඔබේ ක්‍රීඩාව ලෝකයට බෙදාහරිමු (Scratch Community & Portfolio)',
      level: 'Pro',
      duration: 'මිනිත්තු 8 (8 min)',
      summary: 'ඔබේ ක්‍රීඩාව අන්තර්ජාලයට Publish කිරීම: Project Instructions ලිවීම, Credits ලබාදීම, Remixing (අන් අයගේ කේත වලින් ඉගෙනීම), සහ අනාගත Coding ගමනට සුබපැතුම්!',
      analogy: 'ඔබ හැදූ කලා නිර්මාණයක් ප්‍රදර්ශනයකට තබනවාක් මෙන් ඔබේ ක්‍රීඩාව ලොව පුරා සිටින මිලියන සංඛ්‍යාත මිතුරන්ට ක්‍රීඩා කිරීමට ලබාදිය හැක.',
      simplifiedExplanation: 'Share බොත්තම ඔබලා ඔබේ ක්‍රීඩාවේ Link එක යාළුවන්ට සහ ගුරුවරුන්ට යවන්න. ඔබ දැන් දක්ෂ Junior Game Creator කෙනෙක්!',
      content: [
        'Project Title සහ පැහැදිලි Instructions ලිවීම (How to play).',
        'Credits: භාවිත කළ සංගීතය සහ චිත්‍ර වලට ස්තූති කිරීම.',
        'Scratch Community Guidelines සහ අන්තර්ජාල ආරක්ෂාව (Safe Online Sharing).',
        'Coding Badge එක ලබාගෙන ඔබේ ඊළඟ Game Design ගමන අරඹන්න.'
      ],
      keyTakeaways: [
        'සුබපැතුම්! ඔබ පාඩම් 16ම සාර්ථකව අවසන් කර Junior Game Creator සහතිකයට හිමිකම් කීවෙහිය.',
        'නිරන්තරයෙන් අලුත් ක්‍රීඩා අදහස් අත්හදා බලන්න; නිර්මාණශීලී වන්න!'
      ],
      exercise: {
        prompt: 'වෙනත් කෙනෙකුගේ Scratch ව්‍යාපෘතියක් බලා එයට අලුත් දේවල් එකතු කර තමන්ගේ එකක් සාදාගැනීම හඳුන්වන්නේ කුමක්ද?',
        hint: 'Remix...',
        solution: 'Remix කිරීම (Remixing).'
      }
    }
  ]
};
