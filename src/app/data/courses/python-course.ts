import { CourseTrackData } from '../../courses.data';

export const PYTHON_COURSE: CourseTrackData = {
  id: 'python-data-science',
  title: 'Python Programming & Data Science Fundamentals',
  titleSinhala: 'Python Programming සහ දත්ත විශ්ලේෂණය (Data Science) මුල සිට',
  tag: 'Programming',
  category: 'programming',
  targetAudience: 'beginners',
  targetAudienceLabel: 'පරිගණක භාෂා ඉගෙනීමට කැමති ආධුනිකයින් සඳහා',
  level: 'Beginner to Advanced (ආරම්භකයේ සිට උසස් මට්ටම දක්වා)',
  icon: 'code',
  gradient: 'bg-gradient-to-tr from-blue-500 via-cyan-600 to-teal-500',
  badgeName: 'Python Developer',
  totalDuration: 'පැය 3.5 (පාඩම් 10)',
  description: 'Learn Python from scratch. Variables, loops, functions, and an introduction to Data Science using Pandas.',
  descriptionSinhala: 'ලොව ජනප්‍රියතම පරිගණක භාෂාව වන Python මුල සිට සරලව සිංහලෙන් ඉගෙන ගන්න. Variables, Loops වල සිට Data Science (Pandas) දක්වා.',
  lessons: [
  {
    "id": "py-1",
    "title": "01. Python හඳුන්වාදීම සහ Setup කිරීම",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "Python යනු කුමක්ද සහ ඔබේ පරිගණකයේ එය ස්ථාපනය කර පළමු වැඩසටහන ලියන ආකාරය.",
    "analogy": "Python කියන්නේ හරියට ඉංග්‍රීසි භාෂාව වගේ - කියවන්න, තේරුම් ගන්න ඉතාම පහසු පරිගණක භාෂාවක්.",
    "content": [
      "Python වල ඉතිහාසය සහ එහි භාවිතයන්",
      "Python සහ VS Code ස්ථාපනය (Installation)",
      "ඔබගේ පළමු \"Hello, World!\" වැඩසටහන",
      "print() ශ්‍රිතය (function) භාවිතය"
    ],
    "keyTakeaways": [
      "Python ලොව පුරා Data Science, Web Development, සහ AI සඳහා බහුලවම භාවිතා වේ.",
      "print() ශ්‍රිතය මඟින් අපට අවශ්‍ය දේ තිරය මත පෙන්විය හැක."
    ],
    "codeSnippet": "print(\"Hello, World!\")\nprint(\"Welcome to Python Course!\")",
    "exercise": {
      "prompt": "තිරය මත ඔබගේ නම පෙන්වීමට ලිවිය යුතු Python කේතය කුමක්ද?",
      "hint": "pr...(\"Your Name\")",
      "solution": "print(\"ඔබේ නම\")"
    }
  },
  {
    "id": "py-2",
    "title": "02. Variables (විචල්‍යයන්) සහ Data Types",
    "level": "Beginner",
    "duration": "මිනිත්තු 20",
    "summary": "පරිගණක මතකයේ දත්ත ගබඩා කරන්නේ කෙසේද යන්න සහ එහි විවිධ වර්ග.",
    "analogy": "Variable එකක් කියන්නේ ලේබලයක් අලවපු පෙට්ටියක් වගේ. අපිට ඕනෑම දෙයක් (අංක, නම්) ඒ පෙට්ටිය ඇතුලට දාලා පස්සේ පාවිච්චි කරන්න පුළුවන්.",
    "content": [
      "Variables සෑදීම සහ නම් කිරීමේ නීති",
      "Numbers: Integers (පූර්ණ සංඛ්‍යා) සහ Floats (දශම)",
      "Strings: අකුරු සහ වචන",
      "Booleans: True හෝ False",
      "type() ශ්‍රිතය මඟින් Data Type එක හඳුනාගැනීම"
    ],
    "keyTakeaways": [
      "Python වලදී variable එකක් සෑදීමට Data Type එක (int, str) කලින් සඳහන් කිරීම අවශ්‍ය නොවේ.",
      "Strings සැමවිටම උද්ධෘත ලකුණු (\"\", '') ඇතුළත ලිවිය යුතුය."
    ],
    "codeSnippet": "age = 25\nname = \"Kamal\"\nis_student = True\nprint(type(age)) # Output: <class 'int'>",
    "exercise": {
      "prompt": "මිලක් (Price) දශම සංඛ්‍යාවක් ලෙස (උදා: 15.50) ගබඩා කරන්නේ කුමන Data Type එකකින්ද?",
      "hint": "F...t",
      "solution": "Float"
    }
  },
  {
    "id": "py-3",
    "title": "03. Operators සහ User Input (පරිශීලකයාගෙන් දත්ත ලබාගැනීම)",
    "level": "Beginner",
    "duration": "මිනිත්තු 20",
    "summary": "ගණිතමය කර්ම සිදුකිරීම සහ වැඩසටහන භාවිතා කරන්නාගෙන් තොරතුරු ලබාගැනීම.",
    "analogy": "Calculator එකකින් එකතු කරනවා වගේම, Python වලටත් ගණන් හදන්න පුළුවන්.",
    "content": [
      "Arithmetic Operators (+, -, *, /, //, %, **)",
      "Assignment Operators (=, +=, -=)",
      "input() ශ්‍රිතය මඟින් දත්ත ලබාගැනීම",
      "Data Type Casting (උදා: string එකක් integer එකක් කිරීම - int())"
    ],
    "keyTakeaways": [
      "input() මඟින් ලබාගන්නා සියලුම දත්ත Python සලකන්නේ Strings (අකුරු) ලෙසයි.",
      "එබැවින් ගණනය කිරීම් සඳහා ඒවා int() හෝ float() හරහා පරිවර්තනය කළ යුතුය."
    ],
    "codeSnippet": "name = input(\"Enter your name: \")\nage = int(input(\"Enter your age: \"))\nprint(\"Next year, you will be\", age + 1)",
    "exercise": {
      "prompt": "input() මඟින් ලබාගන්නා දත්තයක් පූර්ණ සංඛ්‍යාවක් බවට පත් කිරීමට භාවිතා කරන ශ්‍රිතය කුමක්ද?",
      "hint": "i...()",
      "solution": "int()"
    }
  },
  {
    "id": "py-4",
    "title": "04. Control Flow: If..Else Statements (කොන්දේසි)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "තීරණ මත පදනම්ව වැඩසටහනේ ගමන් මග වෙනස් කරන ආකාරය.",
    "analogy": "පාරක යද්දී පාර දෙකට බෙදෙනවා නම්, ඔබ යා යුත්තේ කොයි පාරේද කියලා තීරණය කරනවා වගේ වැඩක්.",
    "content": [
      "Comparison Operators (==, !=, >, <, >=, <=)",
      "Logical Operators (and, or, not)",
      "if, elif, සහ else භාවිතය",
      "Indentation (හිඩැස් තැබීමේ) වැදගත්කම"
    ],
    "keyTakeaways": [
      "Python වලදී code blocks වෙන් කරන්නේ අනිවාර්ය Indentation (හිඩැස්) මඟිනි (බොහෝ විට spaces 4ක්).",
      "'==' යනු සමානදැයි පරීක්ෂා කිරීමටයි, '=' යනු අගයක් ආදේශ කිරීමටයි."
    ],
    "codeSnippet": "marks = 75\nif marks >= 75:\n    print(\"Grade A\")\nelif marks >= 65:\n    print(\"Grade B\")\nelse:\n    print(\"Grade C\")",
    "exercise": {
      "prompt": "Python වලදී කේත කොටසක් (Block) වෙන් කිරීමට භාවිතා කරන්නේ කුමක්ද?",
      "hint": "In......on (Spaces)",
      "solution": "Indentation (හිඩැස් / Spaces තැබීම)"
    }
  },
  {
    "id": "py-5",
    "title": "05. Loops: For සහ While (පුනරාවර්තන)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "එකම දේ නැවත නැවතත් කිරීම සඳහා Loops භාවිතා කරන ආකාරය.",
    "analogy": "ක්‍රීඩාපිටියක් වටා රවුම් 10ක් දුවන්න කිව්වොත්, එකම රවුම 10 වතාවක් දුවනවා වගේ වැඩක්.",
    "content": [
      "while loop එකෙහි ක්‍රියාකාරිත්වය",
      "for loop එක සහ range() ශ්‍රිතය",
      "break සහ continue statements භාවිතය",
      "Infinite loops (නොනැවතී ධාවනය වන loops) වළක්වාගැනීම"
    ],
    "keyTakeaways": [
      "යම් නිශ්චිත වාර ගණනක් ක්‍රියාත්මක වීමට for loop එක වඩාත් සුදුසුය.",
      "break මඟින් loop එක සම්පූර්ණයෙන්ම නතර කරන අතර, continue මඟින් එම වාරය පමණක් මඟහැර ඊළඟ වාරයට යයි."
    ],
    "codeSnippet": "for i in range(1, 6):\n    if i == 3:\n        continue\n    print(\"Lap number:\", i)",
    "exercise": {
      "prompt": "Loop එකක් අතරමගදී සම්පූර්ණයෙන්ම නතර කර දැමීමට (exit) භාවිතා කරන command එක කුමක්ද?",
      "hint": "br...",
      "solution": "break"
    }
  },
  {
    "id": "py-6",
    "title": "06. Data Structures: Lists (ලැයිස්තු)",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "එකවර දත්ත විශාල ප්‍රමාණයක් එකම Variable එකක ගබඩා කිරීම.",
    "analogy": "List එකක් කියන්නේ හරියට කෝච්චියක් වගේ. එකම කෝච්චියේ පෙට්ටි (Items) ගොඩක් තියෙනවා, ඒ පෙට්ටි අංක (Index) කරලා තියෙන්නේ.",
    "content": [
      "List එකක් සෑදීම සහ Indexing (දත්ත ලබාගැනීම)",
      "List එකකට අලුතින් දත්ත එකතු කිරීම (append, insert)",
      "දත්ත ඉවත් කිරීම (remove, pop)",
      "List Slicing (කොටසක් පමණක් ලබාගැනීම)"
    ],
    "keyTakeaways": [
      "Python වල Index එක (පටන් ගන්නා අංකය) සැමවිටම 0 වේ.",
      "Lists සෑදීමට කොටු වරහන් [] භාවිතා කරයි."
    ],
    "codeSnippet": "fruits = [\"Apple\", \"Banana\", \"Orange\"]\nfruits.append(\"Mango\")\nprint(fruits[0]) # Apple\nprint(fruits[-1]) # Mango",
    "exercise": {
      "prompt": "List එකක අවසානයටම අලුත් අයිතමයක් (item) එකතු කිරීමට භාවිතා කරන method එක කුමක්ද?",
      "hint": "app...",
      "solution": "append()"
    }
  },
  {
    "id": "py-7",
    "title": "07. Functions (ශ්‍රිත) නිර්මාණය කිරීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 25",
    "summary": "නැවත නැවත භාවිතා කළ හැකි කේත කොටස් Functions ලෙස වෙන් කිරීම.",
    "analogy": "Function එකක් කියන්නේ හරියට ජූස් හදන බ්ලෙන්ඩරයක් වගේ. අපි පළතුරු (Inputs) දෙනවා, ඒක අපිට ජූස් (Output) දෙනවා.",
    "content": [
      "def Keyword එක භාවිතයෙන් Function එකක් සෑදීම",
      "Parameters සහ Arguments",
      "Return statement එක මඟින් අගයක් ආපසු ලබාදීම",
      "Variable Scope (Local සහ Global Variables)"
    ],
    "keyTakeaways": [
      "Functions මඟින් කේතය නැවත ලිවීම අවම කරන අතර (DRY concept), කියවීමට පහසු කරයි.",
      "Function එකකින් ලැබෙන ප්‍රතිඵලය වෙනත් තැනක භාවිතා කිරීමට නම් අනිවාර්යයෙන්ම return කළ යුතුය."
    ],
    "codeSnippet": "def add_numbers(a, b):\n    return a + b\n\nresult = add_numbers(10, 5)\nprint(\"Total is:\", result)",
    "exercise": {
      "prompt": "Python වල Function එකක් අර්ථ දැක්වීමට (Define කිරීමට) භාවිතා කරන වචනය කුමක්ද?",
      "hint": "d...",
      "solution": "def"
    }
  },
  {
    "id": "py-8",
    "title": "08. Dictionaries සහ Tuples",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "Key-Value යුගල ලෙස දත්ත ගබඩා කරන Dictionaries සහ වෙනස් කළ නොහැකි Tuples.",
    "analogy": "Dictionary එකක් හරියට ශබ්දකෝෂයක් වගේ. වචනය (Key) සෙව්වම එහි තේරුම (Value) ලැබෙනවා.",
    "content": [
      "Dictionaries සෑදීම සහ භාවිතය (Key-Value pairs)",
      "Dictionary එකකට දත්ත එකතු කිරීම සහ ඉවත් කිරීම",
      "Tuples සෑදීම (පසු වරහන් () භාවිතය)",
      "Lists සහ Tuples අතර වෙනස (Mutability)"
    ],
    "keyTakeaways": [
      "Tuples වල දත්ත වරක් සෑදූ පසු වෙනස් කළ නොහැක (Immutable).",
      "Dictionaries වල Key එකක් භාවිතා කර ඉතා වේගයෙන් Value එක ලබාගත හැක."
    ],
    "codeSnippet": "student = {\"name\": \"Saman\", \"age\": 20, \"city\": \"Colombo\"}\nprint(student[\"name\"])\nstudent[\"age\"] = 21",
    "exercise": {
      "prompt": "Key සහ Value යුගල ලෙස දත්ත ගබඩා කිරීමට භාවිතා කරන Data Structure එක කුමක්ද?",
      "hint": "Dict...",
      "solution": "Dictionary (dict)"
    }
  },
  {
    "id": "py-9",
    "title": "09. File Handling (ගොනු හැසිරවීම)",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "Text ෆයිල් කියවීම සහ ඒවාට දත්ත ලිවීම.",
    "analogy": "මෙය හරියට පරිගණකයේ Notepad එකක් open කරලා, ඒකෙ ලියලා, ආපසු save කරනවා වගේ වැඩක්.",
    "content": [
      "open() ශ්‍රිතය සහ File Modes (r, w, a)",
      "ෆයිල් එකකින් දත්ත කියවීම (read, readlines)",
      "ෆයිල් එකකට දත්ත ලිවීම (write, append)",
      "with statement එක භාවිතයෙන් ෆයිල් නිවැරදිව වැසීම (close)"
    ],
    "keyTakeaways": [
      "'w' (write) mode එකෙන් ෆයිල් එකක් විවෘත කළහොත් එහි ඇති පරණ දත්ත මැකී යයි. පරණ දත්ත සුරකිමින් අලුත් දත්ත ලිවීමට 'a' (append) භාවිතා කරන්න.",
      "with open(...) statement එක භාවිතා කිරීමෙන් ෆයිල් එක ස්වයංක්‍රීයව වැසේ."
    ],
    "codeSnippet": "with open(\"data.txt\", \"w\") as file:\n    file.write(\"Hello File!\\n\")\n    file.write(\"Second Line\")",
    "exercise": {
      "prompt": "පරණ දත්ත නොමකා අලුත් දත්ත ෆයිල් එකක අගට එකතු කිරීමට භාවිතා කරන File Mode එක කුමක්ද?",
      "hint": "a (app...)",
      "solution": "a (append mode)"
    }
  },
  {
    "id": "py-10",
    "title": "10. Introduction to Data Science: Pandas (දත්ත විශ්ලේෂණය)",
    "level": "Advanced",
    "duration": "මිනිත්තු 25",
    "summary": "Pandas ලයිබ්‍රරිය භාවිතයෙන් Excel/CSV ෆයිල් වලින් දත්ත ලබාගෙන විශ්ලේෂණය කිරීම.",
    "analogy": "Pandas කියන්නේ Excel මෘදුකාංගයට වඩා 100 ගුණයක් වේගවත්, කේත වලින් වැඩ කරන සුපිරි Excel එකක් වගේ.",
    "content": [
      "Libraries (පුස්තකාල) යනු කුමක්ද සහ pip install භාවිතය",
      "Pandas Library එක import කිරීම",
      "DataFrame සහ Series යනු මොනවාද?",
      "CSV ෆයිල් එකක් කියවා එයින් තොරතුරු ලබාගැනීම"
    ],
    "keyTakeaways": [
      "Pandas යනු ලොව පුරා Data Scientists ලා භාවිතා කරන ප්‍රධානතම මෙවලමකි.",
      "DataFrame එකක් හරියටම Excel Sheet එකක් වගේ පේළි (rows) සහ තීරු (columns) වලින් යුක්ත වේ."
    ],
    "codeSnippet": "import pandas as pd\n\ndata = pd.read_csv(\"sales.csv\")\nprint(data.head()) # මුල් පේළි 5 පෙන්වයි\nprint(data.describe()) # දත්තවල සාරාංශයක්",
    "exercise": {
      "prompt": "Python හි දත්ත විශ්ලේෂණය (Data Analysis) සඳහා බහුලවම භාවිතා වන පුස්තකාලය (Library) කුමක්ද?",
      "hint": "Pan...",
      "solution": "Pandas"
    }
  }
]
};
