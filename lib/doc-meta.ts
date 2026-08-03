// Pure data — no fs, no server-only imports. Safe to use in client components.

export interface DocMeta {
  slug: string
  index: number
  title: string
  subtitle: string
  filename: string
}

export const DOC_META: DocMeta[] = [
  {
    slug: 'start-here',
    index: 0,
    filename: '00-start-here.md',
    title: 'Start Here',
    subtitle: 'What a design system actually is — and why previous attempts failed.',
  },
  {
    slug: 'foundation-thinking',
    index: 1,
    filename: '01-foundation-thinking.md',
    title: 'Foundation Thinking',
    subtitle: 'Design tokens done right — the three-tier model, naming, and scales.',
  },
  {
    slug: 'color-mastery',
    index: 2,
    filename: '02-color-mastery.md',
    title: 'Color Mastery',
    subtitle: 'Color for systems, not decoration — roles, contrast, HSL, dark mode.',
  },
  {
    slug: 'typography-mastery',
    index: 3,
    filename: '03-typography-mastery.md',
    title: 'Typography Mastery',
    subtitle: 'The backbone of every interface — scales, rhythm, and typeface selection.',
  },
  {
    slug: 'space-and-layout',
    index: 4,
    filename: '04-space-and-layout.md',
    title: 'Space & Layout',
    subtitle: 'The mathematics of breathing room — spacing systems and layout primitives.',
  },
  {
    slug: 'component-philosophy',
    index: 5,
    filename: '05-component-philosophy.md',
    title: 'Component Philosophy',
    subtitle: 'Building things that last — contracts, composition, and accessibility.',
  },
  {
    slug: 'documentation-discipline',
    index: 6,
    filename: '06-documentation-discipline.md',
    title: 'Documentation Discipline',
    subtitle: 'Why writing is designing — decision logs, changelogs, and maintenance.',
  },
  {
    slug: 'what-to-study',
    index: 7,
    filename: '07-what-to-study.md',
    title: 'What to Study',
    subtitle: 'Curated books, real systems to dissect, and a week-by-week reading order.',
  },
]
