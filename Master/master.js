/*
TODO: - Make an option to use framework for default parameters. Command line argument [Defualt]
      - Make an option to use framework in configurable mode, where for each crawler parameters will
        be given in a JSON (config) file.
*/

// NODE LIBRARIES
const argv = require('minimist')(process.argv.slice(2))
    server = require('http').createServer(),
    util   = require('./utilities'),
    io     = require('socket.io')(server);

// GLOBALS
var NUM_CRAWLERS = argv["crawler-count"] // Total number of crawlers
var INPUT_FILENAME = argv["url-file"]    // File containing newline separated domain names
var START_ADDR  = argv["s-ip"]           // IP ADDRESS BLOCK START
var END_ADDR  = argv["e-ip"]             // IP ADDRESS BLOCK END
var CONNECTED_SLAVES = new Map()         // Map that stores the information of all slave nodes
var MASTER_PORT = 10000                  // Master script port number
var JOB_COUNTER = 0                      // Monotonically increment job counter
var URL_INDEX = 0

// PARSE CMD INPUT
if (NUM_CRAWLERS === undefined || INPUT_FILENAME === undefined || START_ADDR === undefined || END_ADDR === undefined){
    console.log('Usage: node master.js --crawler-count=[num-of-crawlers] --url-file=[filename] --s-ip=[ip-block-first-ip] --e-ip=[ip-block-last-ip]')
    process.exit()
}

// CREATE LOG FOLDER
util.create_folder("log", true)

// READ INPUT FILE
const URLS = util.read_input_file(INPUT_FILENAME)

// GENERATE ADDRESS SPACE
const ADDRESS_SPACE = util.generate_ip_block(START_ADDR, END_ADDR)

// SOCKET EVENT LOOP
const main = () => {

    io.on('connection', (socket) => {

        console.log(`client connected [id=${socket.id}]`)
        CONNECTED_SLAVES.set(socket, {})
        
        socket.on("slave-machine-info", (data) =>{

            // Check for IP-addr conflict
            if (!ADDRESS_SPACE.includes(data.public_ip)){

            	console.log(`${data.public_ip} not in IP-ADDR Space! Terminating ${data.crawler_name}`)
                util.write_error(data.crawler_name, data.public_ip, 'Invalid IP Addr')
                socket.emit('terminate')

            }else {
                CONNECTED_SLAVES.set(socket, data)
                util.write_log(data)

                ADDRESS_SPACE.splice( ADDRESS_SPACE.indexOf(data.public_ip), 1 )
                socket.emit('state-initialized')
                console.log(data)
            }
        });

        // SEND CRAWL REQUEST
        socket.on("job-request", (data) => {

            JOB_COUNTER++
        	if (JOB_COUNTER == NUM_CRAWLERS){

                // TERMINATION COND
        		if (URL_INDEX == URLS.length){

                    // Broadcast shutdown
                    io.emit("disconnect")
                    process.exit()

                }else{

            		// Broadcast URL to all sockets
            		url = URLS[URL_INDEX]
            		io.emit("crawl-url", {url: url})
                    console.log(`distributed: ${url}`)

    	        	JOB_COUNTER = 0
    	        	URL_INDEX++
                }
	        }
        });

        // VALIDATE IP ADDR REPUTATION
        socket.on("validate-ip-address", async (data) => {

            let machine_ip = CONNECTED_SLAVES.get(socket).public_ip
            let reputation = await util.eval_ip_reputation(machine_ip)

            if (reputation.toString().trim() == "Poor") {

                let new_ip_addr = await util.get_clean_ip_addr(ADDRESS_SPACE)

                data.public_ip = new_ip_addr
                CONNECTED_SLAVES.set(socket, data)
                util.write_log(data)

                ADDRESS_SPACE.push(machine_ip)
                ADDRESS_SPACE.splice( ADDRESS_SPACE.indexOf(new_ip_addr), 1 )

                socket.emit("update-ip-address", {
                    ip: new_ip_addr
                });

            }else{

                socket.emit("update-ip-address", {
                    ip: null
                });
            }

        });

        // LOG ERROR REPORTS
        socket.on("stderr", (data) => {

            util.write_error(data.crawler_name, data.url, data.stderr)
        });
        
        // SLAVE DISCONNECTED
        socket.on("disconnect", () => {

            CONNECTED_SLAVES.delete(socket)
            console.log(`client disconnected [id=${socket.id}]`)
        });

    });

    server.listen(MASTER_PORT, () => console.log("Master Service listening on port " + String(MASTER_PORT)));
}

main()
