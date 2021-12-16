import tex00 from "/assets/tex00.jpg";
// import tex02 from "/assets/tex01.jpg";
// import tex02 from "/assets/tex02.jpg";
import tex03 from "/assets/tex03.jpg";
import tex04 from "/assets/tex04.jpg";
import tex05 from "/assets/tex05.jpg";
// import tex06 from "/assets/tex06.jpg";
import tex07 from "/assets/tex07.jpg";
import tex08 from "/assets/tex08.jpg";
import tex09 from "/assets/tex09.jpg";

const defaultImages = [tex00, tex03, tex04, tex05, tex07, tex08, tex09];

function randomImage() {
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

export { randomImage };
