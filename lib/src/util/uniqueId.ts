let idNum = Math.floor(Math.random() * 0xFFFFFFF);

export default function getUniqueId() {
  for (;;) {
    const id = `sm-uid-${idNum}`;
    idNum += 1;

    if (!document.getElementById(id)) {
      return id;
    }
  }
}
