// Node Libraries
const io = require('socket.io-client'),
      fs = require('fs')
    util = require('util'),
    exec = util.promisify(require('child_process').exec),
    argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
   spawn = require('child_process').spawn,
  rimraf = require("rimraf"),
publicIp = require('public-ip');

// GLOBALS
const MASTER_ADDR = argv["master-url"]
const CRAWLER_NAME = argv["crawler"]
const MASTER_SERVER_PORT = 10000;

if (MASTER_ADDR === undefined || CRAWLER_NAME === undefined){
    console.log("Usage: node slave.js --master-url=[e.g http://localhost] --crawler=[crawler-name]")
    process.exit()
}

// MAKE PCAP RESULT FOLDER
const pcap_folder = "pcap_results"
if (!fs.existsSync(pcap_folder)){
    fs.mkdirSync(pcap_folder);
}else {
    rimraf.sync(pcap_folder);
    fs.mkdirSync(pcap_folder);
}

const make_execution_cmd = (script_name) =>{

    extension = path.extname(script_name)
    let cmd = ''

    if (extension == ".py"){
        cmd = "python " + script_name
    }else if (extension == ".sh"){
        cmd = "chmod +x " + script_name + ";./" + script_name
    }else{
        return "echo \"invalid file extension! \""
    }
    
    return cmd;
}

const main = async () => {

    const socket = io(MASTER_ADDR + ":" + MASTER_SERVER_PORT)
    
    // HANDSHAKE WITH MASTER
    socket.emit("slave-machine-info", {

        crawler_name: CRAWLER_NAME,
        public_ip: await publicIp.v4()
    });

    socket.on("state-initialized", () =>{
        // WEBSITE TO CRAWL
        socket.emit("job-request", {

            message: CRAWLER_NAME
        });
    });

    // EXECUTE CRAWLER SCRIPTS
    socket.on("crawl-url", async (data) =>{
        
        let domain_name = String(data.url).replace(/(^\w+:|^)\/\//, '')
        let proxy_cmd = "\"tcpdump -s 0 host " + domain_name + " -w " + path.join(pcap_folder, domain_name + ".pcap\"")

        let crawler_cmd = "python driver.py " + String(data.url) + " " + String(proxy_cmd)
        const { stdout, stderr } = await exec(crawler_cmd)

        if (stderr && !String(stderr).includes("tcpdump: listening")){
            console.log(stderr)
            console.log("Error Executing: " + String(data.url))
            
            // SEND BACK ERROR REPORT
            socket.emit("stderr" ,{
                crawler_name: CRAWLER_NAME,
                url: data.url,
                stderr: stderr
            });

        }else{

            console.log("Crawled: " + String(data.url))
        }

        // IP-CLEANLINESS CHECK
        socket.emit("validate-ip-address" ,{
            crawler_name: CRAWLER_NAME,
            public_ip: " "
        });
    });

    // UPDATE IP-ADDR, IF NEEDED
    socket.on("update-ip-address", async (data) => {

        if (data.ip) {
            //await exec("sudo ip addr add " + data.ip + "/24 brd 203.128.6.255 dev eth0");
            console.log("sudo ip addr add " + data.ip + "/24 brd 203.128.6.255 dev eth0")
            //await exec("sudo ip route change default via 203.128.6.1 src " + data.ip);
            console.log("sudo ip route change default via 203.128.6.1 src " + data.ip)

        }

        // NEXT WEBSITE TO CRAWL
        socket.emit("job-request", {
            message: CRAWLER_NAME
        });

    });

    // SLAVE TERMINATED
    socket.on('terminate', () => {
        console.log("Process terminated by master...")
        process.exit()
    })

    // MASTER DISCONNECTED
    socket.on("disconnect", () =>{
        console.log("Pipe broke, master server down...")
        process.exit()
    });

}

main()