import fs from "fs/promises"
import path from "path"

const pattern = /(translation:|backend:)\w+.\w+/gm
const dirPath = path.join(__dirname, "..", "..", "src")

const getFilesInDir = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir)
  const filesInDir = await Promise.all(
    files.map(async file => {
      const filePath = path.join(dir, file)
      const stats = await fs.stat(filePath)
      if (stats.isDirectory()) {
        return getFilesInDir(filePath)
      }
      return filePath
    })
  )
  return filesInDir.flat()
}

const generateKeys = async (files: string[]) => {
  const keys = await Promise.all(
    files.map(async file => {
      const fileContent = await fs.readFile(file, "utf-8")
      const matches: string[] = []
      fileContent.split("\n").forEach(line => {
        if (pattern.test(line)) {
          const content = `${line.match(pattern)}`
          matches.push(content)
        }
      })
      return matches
    })
  )

  return keys.flat()
}

getFilesInDir(dirPath).then(files => {
  generateKeys(files).then(results => {
    console.log(results)
  })
})
