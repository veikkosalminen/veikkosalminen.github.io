const { exec } = require("child_process");
const http = require("http");
var path = require('path');
const fs = require('fs');

var dir = path.join(__dirname, '..');
var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};


const host = '0.0.0.0';
const port = 8001;

const getIndexHTML = () => {
        return fs.readFileSync('./sky.html', {encoding:'utf8', flag:'r'});
}

const executeCommand = (command) => {
        return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                        if (error) {
                                resolve(error.message)
                                console.log(`error: ${error.message}`);
                                return;
                        }
                        if (stderr) {
                                resolve(stderr)
                                console.log(`stderr: ${stderr}`);
                                return;
                        }
                        resolve(stdout)
                        console.log(`stdout: ${stdout}`);
                });
        })
}

const getNewestImage = () => {
        var files = fs.readdirSync(dir);
        let max = 0
        let filename = null
        for (let file of files) {

                if (file.substring(0,5) !== "IMAGE") continue;
                if (file.slice(-3) !== "JPG") continue;
                const imageNum = parseInt(file.substring(6,9))
                if (imageNum > max) {
                        max = imageNum
                        filename = file
                }
        }
        return filename
}

const serveImage = (res, filename) => {

    if (filename === "newest") filename = getNewestImage();

    var file = path.join(dir, filename);

    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.setHeader('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 404;
        res.end('Not found');
    });
}

const requestListener = async (req, res) => {
    
    console.log(req. method, req.url);
    res.setHeader('Access-Control-Allow-Origin', "*");

    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.writeHead(200);
        return res.end()
    }

    
    //if (req.method === "GET") return res.end(getIndexHTML())

    const splitted = req.url.split("/")

    if (splitted[1] === "image") return serveImage(res, splitted[2])
   
    res.writeHead(200);
    console.log(splitted)

    const commands = splitted[1].split(",")


    const responses = []
    for (let com  of commands) {
        const decodedCommand = decodeURI(com)
        const command = req.method === "GET" ? 
                `indi_getprop ${decodedCommand}` : 
                `indi_setprop "${decodedCommand}=${splitted[2]}"`
        console.log("command", command)    
        //      return res.end(command)
        responses.push(await executeCommand(command))
    }

    res.end(responses.join("\n"))
}


const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
