import React from "react";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

import WebPack from "./bundlers/_webpack.md";
import Vite from "./bundlers/_vite.md";
import Cra from "./bundlers/_cra.md";

export default function ({}) {
  return [
    <Tabs>
      <TabItem value="webpack" label="Webpack 5">
        <WebPack />
      </TabItem>
      <TabItem value="vite" label="Vite">
        <Vite />
      </TabItem>
      <TabItem value="cra" label="Create React App">
        <Cra />
      </TabItem>
    </Tabs>,
  ];
}
