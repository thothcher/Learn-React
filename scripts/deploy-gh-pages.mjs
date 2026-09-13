// Builds the site for GitHub Pages and publishes dist/ to the gh-pages branch.
// Usage: npm run deploy
import { execSync } from 'node:child_process'
import { copyFileSync, rmSync, writeFileSync } from 'node:fs'

const run = (command, options = {}) => execSync(command, { stdio: 'inherit', ...options })
const read = (command) => execSync(command).toString().trim()

const origin = read('git remote get-url origin')
const [, owner, repo] = origin.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/) ?? []
if (!repo) throw new Error(`Could not read the GitHub repository from origin: ${origin}`)

// CI passes an authenticated URL; locally, git uses your saved credentials.
const remote = process.env.DEPLOY_REMOTE ?? origin
const commit = read('git rev-parse --short HEAD')

// Project sites are served from /<repo>/, so assets and routes need that prefix.
run('npm run build', { env: { ...process.env, BASE_PATH: repo } })

// GitHub Pages has no URL rewrites. Serving the app as 404.html lets deep links
// like /lessons/props load index.html's code and hand off to React Router.
copyFileSync('dist/index.html', 'dist/404.html')
// Skip Jekyll so every file is served exactly as built.
writeFileSync('dist/.nojekyll', '')

rmSync('dist/.git', { recursive: true, force: true })
const git = (args) => run(`git ${args}`, { cwd: 'dist' })
git('init -q')
git('checkout -q -b gh-pages')
git('add -A')
git(`commit -q -m "Deploy ${commit}"`)
git(`push -f ${remote} gh-pages`)
rmSync('dist/.git', { recursive: true, force: true })

console.log(`\nPublished ${commit}. GitHub Pages updates https://${owner.toLowerCase()}.github.io/${repo}/ within a minute or two.`)
