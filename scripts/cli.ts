import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import { manual, submodules, vendors } from '../meta.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function exec(cmd: string, cwd = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function execSafe(cmd: string, cwd = root): string | null {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

function getGitSha(dir: string): string | null {
  return execSafe('git rev-parse HEAD', dir)
}

const LICENSE_PATHS = [
  '/LICENSE',
  '/LICENSE.md',
  '/LICENSE.txt',
  '/license',
  '/license.md',
  '/license.txt',
]

function getVendorSparsePaths(config: VendorConfig): string[] {
  if (config.sparsePaths)
    return config.sparsePaths

  const skillsBasePath = config.skillsPath || 'skills'
  const skillPaths = Object.keys(config.skills).map(skillName => `/${skillsBasePath}/${skillName}/`)

  return [...skillPaths, ...LICENSE_PATHS]
}

function applySparseCheckout(dir: string, sparsePaths: string[]): void {
  if (sparsePaths.length === 0)
    return

  exec('git sparse-checkout init --no-cone', dir)
  exec(`git sparse-checkout set --no-cone ${sparsePaths.join(' ')}`, dir)
}

function fetchShallow(dir: string, branch?: string): void {
  const currentBranch = branch || execSafe('git rev-parse --abbrev-ref HEAD', dir)
  if (!currentBranch || currentBranch === 'HEAD')
    return

  execSafe(`git fetch --depth=1 origin ${currentBranch}`, dir)
}

function submoduleExists(path: string): boolean {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return false
  const content = readFileSync(gitmodules, 'utf-8')
  return content.includes(`path = ${path}`)
}

const RE_SUBMODULE_PATH = /path\s*=\s*(.+)/g
const RE_GIT_SHA = /Git SHA:\*\* `([0-9a-f]+)`/
const RE_FRONTMATTER = /^---\n([\s\S]*?)\n---/
const RE_FRONTMATTER_NAME = /^name:[ \t]*(\S.*)$/m
const RE_FRONTMATTER_DESCRIPTION = /^description:\s*\S/m
const RE_SKILL_LINK = /\]\(((?:references|scripts)\/[^)#]+)(?:#[^)]+)?\)/g

function getExistingSubmodulePaths(): string[] {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return []
  const content = readFileSync(gitmodules, 'utf-8')
  const matches = content.matchAll(RE_SUBMODULE_PATH)
  return Array.from(matches, match => match[1].trim())
}

function removeSubmodule(submodulePath: string): void {
  // Deinitialize the submodule
  execSafe(`git submodule deinit -f ${submodulePath}`)
  // Remove from .git/modules
  const gitModulesPath = join(root, '.git', 'modules', submodulePath)
  if (existsSync(gitModulesPath)) {
    rmSync(gitModulesPath, { recursive: true })
  }
  // Remove from working tree and .gitmodules
  exec(`git rm -f ${submodulePath}`)
}

interface Project {
  name: string
  url: string
  branch?: string
  shallow?: boolean
  sparsePaths?: string[]
  type: 'source' | 'vendor'
  path: string
}

interface VendorConfig {
  source: string
  branch?: string
  shallow?: boolean
  sparsePaths?: string[]
  skillsPath?: string // Optional custom path to skills directory (default: 'skills')
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

interface SourceConfig {
  source: string
  branch?: string
  shallow?: boolean
  sparsePaths?: string[]
}

async function initSubmodules(skipPrompt = false) {
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, config]) => ({
      name,
      url: (config as SourceConfig).source,
      branch: (config as SourceConfig).branch,
      shallow: (config as SourceConfig).shallow,
      sparsePaths: (config as SourceConfig).sparsePaths,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      branch: (config as VendorConfig).branch,
      shallow: (config as VendorConfig).shallow,
      sparsePaths: getVendorSparsePaths(config as VendorConfig),
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const spinner = p.spinner()

  // Check for extra submodules that are not in meta.ts
  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedPaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedPaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra submodules?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove ${submodulePath}: ${e}`)
        }
      }
    }
  }

  const existingProjects = allProjects.filter(p => submoduleExists(p.path))
  const newProjects = allProjects.filter(p => !submoduleExists(p.path))

  if (newProjects.length === 0) {
    p.log.info('All submodules already initialized')
    return
  }

  const selected = skipPrompt
    ? newProjects
    : await p.multiselect({
        message: 'Select projects to initialize',
        options: newProjects.map(project => ({
          value: project,
          label: `${project.name} (${project.type})`,
          hint: project.url,
        })),
        initialValues: newProjects,
      })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return
  }

  for (const project of selected as Project[]) {
    spinner.start(`Adding submodule: ${project.name}`)

    // Ensure parent directory exists
    const parentDir = join(root, dirname(project.path))
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true })
    }

    try {
      const branchArgs = project.branch ? ` -b ${project.branch}` : ''
      exec(`git submodule add${branchArgs} ${project.url} ${project.path}`)
      if (project.shallow) {
        exec(`git config -f .gitmodules submodule.${project.path}.shallow true`)
        fetchShallow(join(root, project.path), project.branch)
      }
      applySparseCheckout(join(root, project.path), project.sparsePaths)
      spinner.stop(`Added: ${project.name}`)
    }
    catch (e) {
      spinner.stop(`Failed to add ${project.name}: ${e}`)
    }
  }

  p.log.success('Submodules initialized')

  if (existingProjects.length > 0) {
    p.log.info(`Already initialized: ${existingProjects.map(p => p.name).join(', ')}`)
  }
}

async function syncSubmodules(targets: string[] = []) {
  const spinner = p.spinner()
  const targetSet = new Set(targets)
  const vendorEntries = Object.entries(vendors).filter(([vendorName, config]) => {
    if (targetSet.size === 0)
      return true

    const vendorConfig = config as VendorConfig
    const outputSkillNames = Object.values(vendorConfig.skills)
    return targetSet.has(vendorName) || outputSkillNames.some(skillName => targetSet.has(skillName))
  })

  if (targetSet.size > 0 && vendorEntries.length === 0) {
    p.log.warn(`No matching vendor skills found for: ${targets.join(', ')}`)
    return
  }

  // Update all submodules, or only the selected vendored submodules.
  const submodulePaths = targetSet.size > 0
    ? vendorEntries.map(([vendorName]) => `vendor/${vendorName}`)
    : []

  spinner.start(targetSet.size > 0 ? `Updating submodules: ${submodulePaths.join(', ')}` : 'Updating submodules...')
  try {
    const pathArgs = submodulePaths.length > 0 ? ` -- ${submodulePaths.join(' ')}` : ''
    exec(`git submodule update --remote --merge --recommend-shallow${pathArgs}`)
    for (const [vendorName, config] of vendorEntries) {
      const vendorConfig = config as VendorConfig
      applySparseCheckout(join(root, 'vendor', vendorName), getVendorSparsePaths(vendorConfig))
    }
    spinner.stop('Submodules updated')
  }
  catch (e) {
    spinner.stop(`Failed to update submodules: ${e}`)
    return
  }

  // Sync Type 2 skills
  for (const [vendorName, config] of vendorEntries) {
    const vendorConfig = config as VendorConfig
    const vendorPath = join(root, 'vendor', vendorName)
    const skillsBasePath = vendorConfig.skillsPath || 'skills'
    const vendorSkillsPath = join(vendorPath, skillsBasePath)

    if (!existsSync(vendorPath)) {
      p.log.warn(`Vendor submodule not found: ${vendorName}. Run init first.`)
      continue
    }

    if (!existsSync(vendorSkillsPath)) {
      p.log.warn(`No skills directory in vendor/${vendorName}/${skillsBasePath}/`)
      continue
    }

    // Sync each specified skill
    for (const [sourceSkillName, outputSkillName] of Object.entries(vendorConfig.skills)) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      if (!existsSync(sourceSkillPath)) {
        p.log.warn(`Skill not found: vendor/${vendorName}/skills/${sourceSkillName}`)
        continue
      }

      spinner.start(`Syncing skill: ${sourceSkillName} → ${outputSkillName}`)

      // Remove existing output directory to ensure clean sync
      if (existsSync(outputPath)) {
        rmSync(outputPath, { recursive: true })
      }
      mkdirSync(outputPath, { recursive: true })

      // Copy all files from source skill to output
      const files = readdirSync(sourceSkillPath, { recursive: true, withFileTypes: true })
      for (const file of files) {
        if (file.isFile()) {
          const fullPath = join(file.parentPath, file.name)
          const relativePath = fullPath.replace(sourceSkillPath, '')
          const destPath = join(outputPath, relativePath)

          // Ensure destination directory exists
          const destDir = dirname(destPath)
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true })
          }

          cpSync(fullPath, destPath)
        }
      }

      // Copy LICENSE file from vendor repo root if it exists
      const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']
      for (const licenseName of licenseNames) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      // Update SYNC.md (instead of GENERATION.md for vendored skills)
      const sha = getGitSha(vendorPath)
      const syncPath = join(outputPath, 'SYNC.md')
      const date = new Date().toISOString().split('T')[0]

      const syncContent = `# Sync Info

- **Source:** \`vendor/${vendorName}/${skillsBasePath}/${sourceSkillName}\`
- **Git SHA:** \`${sha}\`
- **Synced:** ${date}
`

      writeFileSync(syncPath, syncContent)

      spinner.stop(`Synced: ${sourceSkillName} → ${outputSkillName}`)
    }
  }

  p.log.success('All skills synced')
}

async function checkUpdates() {
  const spinner = p.spinner()
  spinner.start('Fetching remote changes...')

  try {
    exec('git submodule foreach git fetch')
    spinner.stop('Fetched remote changes')
  }
  catch (e) {
    spinner.stop(`Failed to fetch: ${e}`)
    return
  }

  const updates: { name: string, type: string, behind: number }[] = []

  // Check sources
  for (const name of Object.keys(submodules)) {
    const path = join(root, 'sources', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      updates.push({ name, type: 'source', behind: count })
    }
  }

  // Check vendors
  for (const [name, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const path = join(root, 'vendor', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      const skillNames = Object.values(vendorConfig.skills).join(', ')
      updates.push({ name: `${name} (${skillNames})`, type: 'vendor', behind: count })
    }
  }

  if (updates.length === 0) {
    p.log.success('All submodules are up to date')
  }
  else {
    p.log.info('Updates available:')
    for (const update of updates) {
      p.log.message(`  ${update.name} (${update.type}): ${update.behind} commits behind`)
    }
  }
}

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  // Skills from submodules (generated skills use same name as submodule key)
  for (const name of Object.keys(submodules)) {
    expected.add(name)
  }

  // Skills from vendors (use the output skill name)
  for (const config of Object.values(vendors)) {
    const vendorConfig = config as VendorConfig
    for (const outputName of Object.values(vendorConfig.skills)) {
      expected.add(outputName)
    }
  }

  // Manual skills
  for (const name of manual) {
    expected.add(name)
  }

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir))
    return []

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

function readGitSha(filePath: string): string | null {
  if (!existsSync(filePath))
    return null

  const content = readFileSync(filePath, 'utf-8')
  return content.match(RE_GIT_SHA)?.[1] ?? null
}

function collectSkillErrors(skillName: string): string[] {
  const dir = join(root, 'skills', skillName)
  const skillFile = join(dir, 'SKILL.md')

  if (!existsSync(skillFile))
    return [`skills/${skillName}/SKILL.md is missing`]

  const errors: string[] = []
  const content = readFileSync(skillFile, 'utf-8')
  const frontmatter = content.match(RE_FRONTMATTER)?.[1]

  if (!frontmatter) {
    errors.push(`skills/${skillName}/SKILL.md has no frontmatter`)
  }
  else {
    const name = frontmatter.match(RE_FRONTMATTER_NAME)?.[1]?.trim()
    if (name !== skillName)
      errors.push(`skills/${skillName}/SKILL.md declares name "${name}"`)
    if (!RE_FRONTMATTER_DESCRIPTION.test(frontmatter))
      errors.push(`skills/${skillName}/SKILL.md has no description`)
  }

  for (const match of content.matchAll(RE_SKILL_LINK)) {
    const target = match[1]
    if (!existsSync(join(dir, target)))
      errors.push(`skills/${skillName}/SKILL.md links to missing ${target}`)
  }

  return errors
}

async function verifySkills() {
  const errors: string[] = []
  const warnings: string[] = []
  const existing = getExistingSkillNames()
  const expected = getExpectedSkillNames()

  for (const name of existing) {
    if (!expected.has(name))
      errors.push(`skills/${name} is not tracked in meta.ts`)
  }

  for (const name of expected) {
    if (!existing.includes(name))
      errors.push(`skills/${name} is tracked in meta.ts but missing`)
  }

  for (const [vendorName, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    for (const outputName of Object.values(vendorConfig.skills)) {
      const sha = readGitSha(join(root, 'skills', outputName, 'SYNC.md'))
      if (!sha) {
        errors.push(`skills/${outputName}/SYNC.md is missing`)
        continue
      }

      const head = getGitSha(join(root, 'vendor', vendorName))
      if (head && sha !== head)
        warnings.push(`skills/${outputName}: SYNC.md ${sha.slice(0, 7)} differs from vendor/${vendorName} HEAD ${head.slice(0, 7)} (pending sync?)`)
    }
  }

  for (const name of existing)
    errors.push(...collectSkillErrors(name))

  for (const warning of warnings)
    p.log.warn(warning)

  if (errors.length > 0) {
    for (const error of errors)
      p.log.error(error)
    p.log.error(`Verification failed with ${errors.length} error(s)`)
    process.exitCode = 1
    return
  }

  p.log.success(`Verified ${existing.length} skills${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ''}`)
}

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()
  let hasChanges = false

  // 1. Find and remove extra submodules
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, config]) => ({
      name,
      url: (config as SourceConfig).source,
      branch: (config as SourceConfig).branch,
      shallow: (config as SourceConfig).shallow,
      sparsePaths: (config as SourceConfig).sparsePaths,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      branch: (config as VendorConfig).branch,
      shallow: (config as VendorConfig).shallow,
      sparsePaths: getVendorSparsePaths(config as VendorConfig),
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedSubmodulePaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedSubmodulePaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`Found ${extraSubmodules.length} submodule(s) not in meta.ts:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra submodules?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const submodulePath of extraSubmodules) {
        spinner.start(`Removing submodule: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`Removed: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove ${submodulePath}: ${e}`)
        }
      }
    }
  }

  // 2. Find and remove extra skills
  const existingSkills = getExistingSkillNames()
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = existingSkills.filter(name => !expectedSkills.has(name))

  if (extraSkills.length > 0) {
    p.log.warn(`Found ${extraSkills.length} skill(s) not in meta.ts:`)
    for (const name of extraSkills) {
      p.log.message(`  - skills/${name}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra skills?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const skillName of extraSkills) {
        spinner.start(`Removing skill: ${skillName}`)
        try {
          rmSync(join(root, 'skills', skillName), { recursive: true })
          spinner.stop(`Removed: skills/${skillName}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove skills/${skillName}: ${e}`)
        }
      }
    }
  }

  if (!hasChanges && extraSubmodules.length === 0 && extraSkills.length === 0) {
    p.log.success('Everything is clean, no unused submodules or skills found')
  }
  else if (hasChanges) {
    p.log.success('Cleanup completed')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipPrompt = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // Handle subcommands directly
  if (command === 'init') {
    p.intro('Skills Manager - Init')
    await initSubmodules(skipPrompt)
    p.outro('Done')
    return
  }

  if (command === 'sync') {
    p.intro('Skills Manager - Sync')
    const targets = args.filter(arg => !arg.startsWith('-')).slice(1)
    await syncSubmodules(targets)
    p.outro('Done')
    return
  }

  if (command === 'check') {
    p.intro('Skills Manager - Check')
    await checkUpdates()
    p.outro('Done')
    return
  }

  if (command === 'cleanup') {
    p.intro('Skills Manager - Cleanup')
    await cleanup(skipPrompt)
    p.outro('Done')
    return
  }

  if (command === 'verify') {
    p.intro('Skills Manager - Verify')
    await verifySkills()
    p.outro('Done')
    return
  }

  // No subcommand: show interactive menu (requires interaction)
  if (skipPrompt) {
    p.log.error('Command required when using -y flag')
    p.log.info('Available commands: init, sync, check, cleanup, verify')
    process.exit(1)
  }

  p.intro('Skills Manager')

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'sync', label: 'Sync submodules', hint: 'Pull latest and sync Type 2 skills' },
      { value: 'init', label: 'Init submodules', hint: 'Add new submodules' },
      { value: 'check', label: 'Check updates', hint: 'See available updates' },
      { value: 'cleanup', label: 'Cleanup', hint: 'Remove unused submodules and skills' },
      { value: 'verify', label: 'Verify skills', hint: 'Validate metadata, frontmatter and links' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    process.exit(0)
  }

  switch (action) {
    case 'init':
      await initSubmodules()
      break
    case 'sync':
      await syncSubmodules()
      break
    case 'check':
      await checkUpdates()
      break
    case 'cleanup':
      await cleanup()
      break
    case 'verify':
      await verifySkills()
      break
  }

  p.outro('Done')
}

main().catch(console.error)
