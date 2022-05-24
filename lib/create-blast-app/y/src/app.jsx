import Blast from "@oriun/blast";

const App = () => {
  return (
    <div>
      Here is your first Blast App
    </div>
  );
};

window.onload = function () {
  const Application = new Blast().mount(App, "#root");
};
