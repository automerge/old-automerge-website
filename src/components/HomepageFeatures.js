import React from 'react'
import clsx from 'clsx'
import styles from './HomepageFeatures.module.css'
import Link from '@docusaurus/Link'

const FeatureList = [
  {
    title: 'Collaboration is effortless',
    Svg: require('../../static/img/merge.svg').default,
    description: (
      <>
        The core of Automerge is a <a href="http://crdt.tech" target="_blank">Conflict-free Replicated Data Type (CRDT)</a>, which allows concurrent changes on different devices
        to be merged automatically without a central server.
      </>
    ),
  },
  {
    title: 'Clouds are optional',
    Svg: require('../../static/img/network.svg').default,
    description: (
      <>
        Automerge's sync engine supports any <Link to="docs/repositories/networking">network protocol</Link>: client-server, peer-to-peer, or local. You can even send an <Link to="docs/concepts/#documents">Automerge document</Link> as an email attachment or store it on a file server.
      </>
    ),
  },
  {
    title: 'Code is cross-platform',
    Svg: require('../../static/img/portable.svg').default,
    description: (
      <>
        Implemented in <a href="https://github.com/automerge/automerge" target="_blank">JavaScript</a> and{' '}
        <a href="https://github.com/automerge/automerge-rs" target="_blank">Rust</a> for maximum portability, Automerge lets you build collaborative multiplayer experiences across web, mobile, and desktop.
      </>
    ),
  },
]

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(props) {
  return (
    <section className={clsx(styles.features, props.className || '')}>
      <div className="container">
        <h2 className="text--center">The Automerge Advantage</h2>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
