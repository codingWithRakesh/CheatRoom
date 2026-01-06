import dotenv from "dotenv"
import { app } from "./src/app.js"
dotenv.config({ path: "./.env" })

const PORT = process.env.PORT || 4000


app.on("error", (err) => {
  console.log(err)
})

app.listen(PORT, () => {
  console.log("server running", PORT)
})