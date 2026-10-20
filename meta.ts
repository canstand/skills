export interface SourceMeta {
  source: string
  branch?: string
  shallow?: boolean
  sparsePaths?: string[] // Optional; source repos are not sparse by default
}

export interface VendorSkillMeta {
  official?: boolean
  source: string
  branch?: string
  shallow?: boolean
  sparsePaths?: string[] // Optional override; defaults to synced skill dirs plus root LICENSE files
  skillsPath?: string // Optional custom path to skills directory (default: 'skills')
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

/**
 * Repositories to clone as submodules and generate skills from source
 */
export const submodules: Record<string, SourceMeta> = {
  vue: {
    source: 'https://github.com/vuejs/docs',
    shallow: true,
  },
  nuxt: {
    source: 'https://github.com/nuxt/nuxt',
    shallow: true,
  },
  vite: {
    source: 'https://github.com/vitejs/vite',
    shallow: true,
  },
  unocss: {
    source: 'https://github.com/unocss/unocss',
    shallow: true,
  },
  pnpm: {
    source: 'https://github.com/pnpm/pnpm.io',
    shallow: true,
  },
  pinia: {
    source: 'https://github.com/vuejs/pinia',
    shallow: true,
  },
  vitest: {
    source: 'https://github.com/vitest-dev/vitest',
    shallow: true,
  },
  vitepress: {
    source: 'https://github.com/vuejs/vitepress',
    shallow: true,
  },
  nitro: {
    source: 'https://github.com/nitrojs/nitro',
    shallow: true,
  },
}

/**
 * Already generated skills, sync with their `skills/` directory
 */
export const vendors: Record<string, VendorSkillMeta> = {
  'tsdown': {
    official: true,
    source: 'https://github.com/rolldown/tsdown',
    skills: {
      tsdown: 'tsdown',
    },
  },
  'vuejs-ai': {
    source: 'https://github.com/vuejs-ai/skills',
    skills: {
      'vue-best-practices': 'vue-best-practices',
      'vue-router-best-practices': 'vue-router-best-practices',
      'vue-testing-best-practices': 'vue-testing-best-practices',
    },
  },
  'nuxt-ui': {
    official: true,
    source: 'https://github.com/nuxt/ui',
    branch: 'v4',
    shallow: true,
    skills: {
      'nuxt-ui': 'nuxt-ui',
    },
  },
}

/**
 * Hand-written skills with Anthony Fu's preferences/tastes/recommendations
 */
export const manual = [
  'antfu',
  'antfu-create-pr',
]
