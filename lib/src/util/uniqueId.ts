
let idNum = Math.floor(Math.random() * 0xFFFFFFF);

export function getUniqueId() {
    while (true) {
        const id = `sm-uid-${idNum}`;
        idNum++;

        if (!document.getElementById(id)) {
            return id;
        }
    }
}