import fs from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import Ncp from 'ncp'
import { spawn, execSync } from "child_process"

const { ncp } = Ncp
const __dirname = dirname(fileURLToPath(import.meta.url));
const _cwd = process.cwd()
async function create(project_name, flags) {
    const project_directory = join(_cwd, project_name)
    console.time('Run Time')
    console.log('Running create-blast-app on NodeJs', process.version)
    console.log(`Creating ${project_name} at ${project_directory}`)
    await fs.mkdir(project_name,'777')
        .then(() => {
            console.log("Project directory created.")
        })
        .catch(e => {
            if (e.code !== "EEXIST") throw e
            console.log("Project directory already exists.")
        })

    console.log("Copying all necessary files.")
    await new Promise(r => ncp(join(__dirname, "files"), project_directory, r))

    console.log("Generating package.json.")
    const package_json = await fs.readFile(join(project_directory, "package.json"), 'utf-8')

    await fs.writeFile(join(project_directory, "package.json"), package_json.replace('<project_name>', project_name))

    console.log("Generating index.html.")
    const indexHTML = await fs.readFile(join(project_directory, "public/index.html"), 'utf-8')

    await fs.writeFile(join(project_directory, "public/index.html"), indexHTML.replace('<project_name>', project_name))

    console.log("Installing packages.")
    process.chdir(join(process.cwd(), project_name))
    await new Promise((resolve, reject) => {
        const install = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm',["install","--legacy-peer-deps"], { stdio: [process.stdin, process.stdout, process.stderr] })
        install.on('close', code => {
            if (code !== 0) {
                reject("npm install exited with code " + code)
            } else {
                resolve()
            }
        })
    }).catch(() => process.exit(1))

    console.log(`
    
Create-Blast-App Succeeded ✔ 
New application ${project_name} created 🌟

To run your application, use:
    $ yarn start # or npm run start

To generate a production build, use:
    $ yarn build # or npm run build

Thanks for using this package 😘`
    )
    console.timeEnd('Run Time')
}

export default create