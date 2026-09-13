import { ArrowLeftRight, Search } from 'lucide-react'
import { useState } from 'react'
import { AngularIcon, ReactIcon } from '../components/ui/BrandIcons'
import { PageHeader } from '../components/ui/PageHeader'
import { RichText } from '../components/ui/RichText'
import { cheatSheet } from '../data/cheatsheet'
import styles from './CheatSheetPage.module.css'

const total = cheatSheet.reduce((sum, section) => sum + section.rows.length, 0)

export function CheatSheetPage() {
  const [query, setQuery] = useState('')
  const search = query.trim().toLowerCase().replaceAll('`', '')

  const sections = cheatSheet
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) =>
        `${row.angular} ${row.react} ${row.note ?? ''}`.replaceAll('`', '').toLowerCase().includes(search),
      ),
    }))
    .filter((section) => section.rows.length > 0)

  const matches = sections.reduce((sum, section) => sum + section.rows.length, 0)

  return (
    <>
      <title>Cheat sheet · Refract</title>
      <PageHeader
        eyebrow={
          <>
            <ArrowLeftRight size={16} /> Cheat sheet
          </>
        }
        title="Angular to React, line by line"
        description={`${total} Angular APIs and patterns with their React and Next.js counterparts. Search for anything you would reach for in Angular.`}
      />

      <div className={`container ${styles.toolbar}`}>
        <label className={styles.search}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Try ngOnInit, @for, inject or guard"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <nav className={styles.jump} aria-label="Sections">
          {cheatSheet.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="container">
        {search && (
          <p className={styles.count}>
            {matches} {matches === 1 ? 'match' : 'matches'} for "{query}"
          </p>
        )}

        {sections.length === 0 && <p className={styles.empty}>Nothing found. Try a shorter search.</p>}

        {sections.map((section) => (
          <section key={section.id} id={section.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.table} role="table" aria-label={section.title}>
              <div className={styles.head} role="row">
                <span role="columnheader">
                  <AngularIcon size={15} className={styles.angularIcon} /> Angular
                </span>
                <span role="columnheader">
                  <ReactIcon size={16} className={styles.reactIcon} /> React and Next.js
                </span>
              </div>
              {section.rows.map((row) => (
                <div key={row.angular} className={styles.row} role="row">
                  <div role="cell" className={styles.cell}>
                    <span className={styles.mobileLabel}>Angular</span>
                    <RichText text={row.angular} />
                  </div>
                  <div role="cell" className={styles.cell}>
                    <span className={styles.mobileLabel}>React</span>
                    <RichText text={row.react} />
                    {row.note && <p className={styles.note}>{row.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
