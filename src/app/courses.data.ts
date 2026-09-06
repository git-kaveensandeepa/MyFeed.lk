export type LessonLevel = 'Beginner' | 'Intermediate' | 'Pro' | 'Advanced';

export interface LessonItem {
  id: string;
  title: string;
  level: LessonLevel; // Beginner | Intermediate | Pro
  duration: string;
  summary: string;
  analogy?: string; // Everyday real-world analogy for easy understanding by any age
  simplifiedExplanation?: string; // Plain simple explanation for kids & elders
  content: string[];
  keyTakeaways: string[];
  codeSnippet?: string;
  language?: string;
  exercise?: {
    prompt: string;
    hint: string;
    solution: string;
  };
}

export type TargetAudienceType = string;

export interface CourseTrackData {
  id: string;
  title: string;
  titleSinhala: string;
  tag: string;
  category: string;
  targetAudience: TargetAudienceType;
  targetAudienceLabel: string;
  level: string;
  icon: string;
  gradient: string;
  badgeName: string;
  totalDuration: string;
  description: string;
  descriptionSinhala: string;
  lessons: LessonItem[];
}


import { KIDS_CODING_COURSE } from './data/courses/kids-coding';
import { SMARTPHONE_SENIORS_COURSE } from './data/courses/smartphone-seniors';
import { WEB3_BLOCKCHAIN_COURSE } from './data/courses/web3-blockchain';
import { AI_TOOLS_COURSE } from './data/courses/ai-tools';
import { PYTHON_COURSE } from './data/courses/python-course';
import { DIGITAL_MARKETING_COURSE } from './data/courses/digital-marketing';
import { GRAPHIC_DESIGN_COURSE } from './data/courses/graphic-design';
import { CYBERSECURITY_COURSE } from './data/courses/cybersecurity';
import { FREELANCING_COURSE } from './data/courses/freelancing';
import { EXCEL_COURSE } from './data/courses/excel-course';

// We will use ONLY the 10 new generated courses as requested by the user.
export const ALL_COURSES: CourseTrackData[] = [
  KIDS_CODING_COURSE,
  SMARTPHONE_SENIORS_COURSE,
  WEB3_BLOCKCHAIN_COURSE,
  AI_TOOLS_COURSE,
  PYTHON_COURSE,
  DIGITAL_MARKETING_COURSE,
  GRAPHIC_DESIGN_COURSE,
  CYBERSECURITY_COURSE,
  FREELANCING_COURSE,
  EXCEL_COURSE
];
