import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import HomepageFeatures from '../components/HomepageFeatures'
import Logos from '../components/Logos'
import RecentPosts from '../components/RecentPosts'
import '@fontsource/merriweather'
import '@fontsource/overpass'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--secondary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="docs/hello">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}


function ResearchProduction() {
  return (<section className={styles.homesection}>

    <div className="container text--center" style={{ alignSelf: "flex-start" }}>
      <h2>Rigorously researched</h2>
      <p>Developed at <a href="https://inkandswitch.com">Ink & Switch</a> by the team who started the <a href="https://inkandswitch.com/local-first">local-first software</a> movement, Automerge features industry-leading technology based on years of research.</p>
      <Link className="button button--primary button--lg" to="https://inkandswitch.com/local-first">
        Read the white paper
      </Link>
    </div>
    <div className="container text--center" style={{ alignSelf: "flex-start" }}>
      <h2>Proven in production</h2>
      <p>Automerge powers well-known collaboration apps, as well as other developer tools for building local-first apps.</p>
      <Logos />

    </div>
  </section >)

}

function IntroVideo() {
  return (<section className={styles.homesection}>
    <div className="container text--center">
      <h2>See Automerge in Action</h2>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/L9fdyDlhByM?si=skxe0RBRA_OXmXgD" title="YouTube video player" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    </div>
  </section>)
}


function ExternalLinkIcon() {
  return (<span style={{ paddingLeft: "1ch" }} ><svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24" className="iconExternalLink_nPIU"><path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path></svg></span>)
}


function Community() {
  return (<section className={styles.homesection}>
    <div className="container text--center">
      <h2>Merge with the community</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textWrap: "wrap" }}>

        <RecentPosts />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textWrap: "nowrap" }}>
          <h3>Connect with us</h3>
          <p>Join the conversation on <Link to="https://discord.gg/zKGe4DCfgR">Discord<ExternalLinkIcon /></Link></p>
          <p>Follow&nbsp;
            <Link to="https://github.com/automerge">@automerge on Github<ExternalLinkIcon /></Link>
          </p>

          <p>Follow&nbsp;
            <Link to="https://twitter.com/inkandswitch">@inkandswitch on Twitter<ExternalLinkIcon /></Link>
          </p>
        </div>
      </div>
    </div>
  </section>)
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.description}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures className={styles.homesection} />
        <ResearchProduction />
        <IntroVideo />
        <Community />
      </main>
    </Layout>
  )
}
