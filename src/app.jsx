import Blast, { useState, useEffect } from "../lib/blast";

const SVG = () => {
  return (
    <svg
      className=""
      width="12"
      height="13"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 13"
    >
      <path
        d="M10.3846 1.06834H8.53841V0.145264H7.61533V1.06834H3.92302V0.145264H2.99994V1.06834H1.15379C0.646098 1.06834 0.230713 1.48373 0.230713 1.99142V11.2222C0.230713 11.7299 0.646098 12.1453 1.15379 12.1453H10.3846C10.8923 12.1453 11.3076 11.7299 11.3076 11.2222V1.99142C11.3076 1.48373 10.8923 1.06834 10.3846 1.06834ZM10.3846 11.2222H1.15379V4.76065H10.3846V11.2222ZM10.3846 3.83757H1.15379V1.99142H2.99994V2.91449H3.92302V1.99142H7.61533V2.91449H8.53841V1.99142H10.3846V3.83757Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};
const title = ["manu", "theo", "arnaud le boss"];
const App = ({}, $) => {
  console.count("render start");

  const [i, setI] = useState($, 0);
  const [page, setPage] = useState($, 0);
  const [last, setLast] = useState($, 0);

  useEffect(
    $,
    () => {
      console.count("first useEffect");
      setPage(Math.floor(Math.random() * 3));
    },
    [Math.floor(i / 3)]
  );

  useEffect(
    $,
    () => {
      console.count("second useEffect");
      document.title = title[page];
      return () => {
        console.count("effect");
        setLast(page);
      };
    },
    [page]
  );

  console.count("render end");
  return (
    <div className="App" _backgroundColor="green" >
      <div>
        <h4>{i}</h4>
        <h4>Last : {title[last]}</h4>
        <button onclick={() => setI((j) => j + 1)}>incremente</button>
      </div>
      <SVG />
      Yo
    </div>
  );
};

window.onload = function () {
  const Application = new Blast().mount(App, "#root");
};
