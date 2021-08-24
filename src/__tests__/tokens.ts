import download from "../functions/download";

async function a() {
for (let i = 0;i < 100;i++) {
  await  download("https://www.youtube.com/watch?v=e3fWFJwFXZQ")
}

console.log("done ")
}

a()