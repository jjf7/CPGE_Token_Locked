import { useEffect } from "react";

const Banner = () => {
  useEffect(() => {
    const metamaskBanner = document.getElementById("metamask-banner");
    //const metamaskClose = document.getElementById("metamask-close");

    if (typeof window.ethereum === "undefined") {
      metamaskBanner.style.display = "block";
    }else{
        metamaskBanner.style.display = "none";
    }

    // metamaskClose.addEventListener("click", () => {
    //   metamaskBanner.style.display = "none";
    // });
  }, []);

  return (
    <div id="metamask-banner" className="bg-yellow-300 py-2 px-4">
      <p className="text-sm font-medium text-gray-700">
        Para interactuar con esta página web, necesitas tener instalado Metamask
        en tu navegador.
        <a
          href="https://metamask.io/"
          rel="noreferrer"
          target="_blank"
          className="underline text-gray-900"
        >
          Instalar Metamask
        </a>
      </p>
      
    </div>
  );
};

export default Banner;
