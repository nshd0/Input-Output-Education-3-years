/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StageId = 'root' | 'stem' | 'leaf' | 'bloom';

export interface Module {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  type: 'literacy' | 'numeracy' | 'world' | 'art';
}

export interface Stage {
  id: StageId;
  name: string;
  fullName: string;
  ageRange: string;
  description: string;
  gradeEquivalent: string;
  modules: Module[];
}

export const STAGES: Stage[] = [
  {
    id: 'root',
    name: 'Root',
    fullName: 'BalVatika Root (Playgroup)',
    ageRange: '3-4 Years',
    gradeEquivalent: 'Pre-school Level 1',
    description: 'Sensory exploration and cognitive play.',
    modules: [
      { id: 'colors', title: 'Color World', icon: 'Palette', color: 'bg-brand-red', description: 'Match and learn colors', type: 'art' },
      { id: 'shapes', title: 'Shape Box', icon: 'Shapes', color: 'bg-brand-blue', description: 'Identify basic shapes', type: 'literacy' },
      { id: 'sounds', title: 'Animal Sounds', icon: 'Volume2', color: 'bg-brand-yellow', description: 'Listen and mimic', type: 'world' }
    ]
  },
  {
    id: 'stem',
    name: 'Stem',
    fullName: 'BalVatika Stem (LKG/UKG)',
    ageRange: '4-6 Years',
    gradeEquivalent: 'Early Childhood Education',
    description: 'Foundational literacy and basic numeracy.',
    modules: [
      { id: 'phonics', title: 'ABC Phonics', icon: 'Languages', color: 'bg-brand-green', description: 'Letter sounds and traces', type: 'literacy' },
      { id: 'counting', title: 'Number Train', icon: 'Hash', color: 'bg-brand-purple', description: 'Count 1 to 20', type: 'numeracy' },
      { id: 'nature', title: 'My Earth', icon: 'Leaf', color: 'bg-brand-blue', description: 'Plants and Animals', type: 'world' }
    ]
  },
  {
    id: 'leaf',
    name: 'Leaf',
    fullName: 'BalVatika Leaf (Grade 1)',
    ageRange: '6-7 Years',
    gradeEquivalent: 'Foundational Grade 1',
    description: 'Word building and combined operations.',
    modules: [
      { id: 'words', title: 'Word Builder', icon: 'BookOpen', color: 'bg-brand-red', description: 'Two and three-letter words', type: 'literacy' },
      { id: 'math-basic', title: 'Add & Subtract', icon: 'PlusCircle', color: 'bg-brand-yellow', description: 'Basic math operations', type: 'numeracy' },
      { id: 'ourselves', title: 'My Body & Home', icon: 'User', color: 'bg-brand-green', description: 'Understanding self', type: 'world' }
    ]
  },
  {
    id: 'bloom',
    name: 'Bloom',
    fullName: 'BalVatika Bloom (Grade 2)',
    ageRange: '7-8 Years',
    gradeEquivalent: 'Foundational Grade 2',
    description: 'Fluent reading and analytical thinking.',
    modules: [
      { id: 'reading', title: 'Reading Time', icon: 'BookOpenCheck', color: 'bg-brand-purple', description: 'Fluent reading practice', type: 'literacy' },
      { id: 'money', title: 'Money Magic', icon: 'Coins', color: 'bg-brand-yellow', description: 'Intro to Indian Rupee', type: 'numeracy' },
      { id: 'community', title: 'Our Community', icon: 'Users', color: 'bg-brand-blue', description: 'Helpers and transport', type: 'world' }
    ]
  }
];
