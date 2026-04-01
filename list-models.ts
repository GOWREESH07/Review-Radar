import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const req = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await req.json();
    if (data.models) {
      console.log(data.models.map((m: any) => m.name).join("\n"));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
main();
