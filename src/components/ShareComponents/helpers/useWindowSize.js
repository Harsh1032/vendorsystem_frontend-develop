import { useEffect, useState } from "react";

function useWindowSize(className = null) {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      if (className) {
        const node = document.getElementsByClassName(className)[0];
        setWindowSize({
          width: node.offsetWidth,
          height: node.offsetHeight,
        });
      } else {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [className]); // Empty array ensures that effect is only run on mount

  return windowSize;
}

export default useWindowSize;
