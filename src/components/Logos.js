import React from 'react'
import GoodnotesBlack from '../../static/img/logos/GoodNotes-Black.svg';
import GoodnotesWhite from '../../static/img/logos/GoodNotes-White.svg';
import DxosBlack from "../../static/img/logos/dxos-logotype-black.svg";
import DxosWhite from "../../static/img/logos/dxos-logotype-white.svg";
import styles from "./Logos.module.css"

export function GoodnotesLogo() {
  return <Logo name="Goodnotes" url="https://goodnotes.com" LightSVG={GoodnotesWhite} DarkSVG={GoodnotesBlack} />
}

export function DxosLogo() {
  return <Logo
    name="DXOS"
    url="https://dxos.org"
    LightSVG={DxosWhite}
    DarkSVG={DxosBlack} />
}

export function Logo({ name, url, LightSVG, DarkSVG }) {
  const title = name + " logo";
  return (<a href={url} aria-label={name} target="_blank">
    <DarkSVG height={"5em"} className={styles.logoDark} alt={title} />
    <LightSVG height={"5em"} className={styles.logoLight} alt={title} />
  </a>)
}

export default function Logos() {
  return (
    <div className="container" id="logos" >
      <GoodnotesLogo />
      <DxosLogo />
    </div>
  )
}
