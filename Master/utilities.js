// NODE LIBRARIES
const fs     = require('fs'),
	    path   = require('path'),
	    rimraf = require("rimraf"),
	    util   = require('util'),
      exec   = util.promisify(require('child_process').exec);

// HELPER FUNCTIONS
module.exports = {

  create_folder: function (folder_path, recursive) {

    if (!fs.existsSync(folder_path)){
        fs.mkdirSync(folder_path);
    }else if (recursive){
        rimraf.sync(folder_path);
        fs.mkdirSync(folder_path);
    }
  },

  write_error: function (crawler_name, url, stderr) {

   	module.exports.create_folder(path.join("log", "error"), false);
    file_path = path.join("log", "error", crawler_name);        
    module.exports.create_folder(file_path, false);

    url = String(url).replace(/(^\w+:|^)\/\//, '');
    fs.writeFileSync(path.join(file_path, url + ".txt"), String(stderr));
  },

  map_to_json: function (input_map) {

  	let obj = {};
    input_map.forEach(function(value, key){
        obj[key.id] = value;
    });
    return obj;
  },

  read_input_file: function (filename) {

  	return fs.readFileSync(filename).toString().split("\n").slice(0, -1);
  },

  write_log: function (data) {

  	fs.appendFileSync(path.join('log', 'slaves-connection-log.json'), JSON.stringify(data) + '\n');
  },

  eval_ip_reputation: async function(ip) {

  	const { stdout, stderr } = await exec('master-env/bin/ciscoreputation ' + String(ip) + ' --tos --values');

  	if (stderr) {
    	console.error(`error: ${stderr}`);
  	}

  	return stdout.slice(0, stdout.length - 1);
  },

  get_clean_ip_addr: async function(addresses) {

  	for (var i = 0; i < addresses.length; i++){

  		let reputation = await module.exports.eval_ip_reputation(addresses[i]);
  		if (reputation.toString().trim() != "Poor"){
  			return addresses[i];
  		}
  	}
  	
  	return addresses[0];
  },

  generate_ip_block: function(start_ip, end_ip) {

  	let start = dot2num(start_ip);
  	let end = dot2num(end_ip);

    if (start > end){
      console.error('Defined IP Addresses are corrupt.');
      process.exit();
    }

  	var addr_list = [];
  	for (var ip = start; ip <= end; ip++){
  		addr_list.push(num2dot(ip));
  	}

  	return addr_list;
  }

};

// LOCAL HELPER FUNCTIONS
function dot2num(dot) 
{
    let d = dot.split('.');
    return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function num2dot(num) 
{
    let d = num%256;
    for (var i = 3; i > 0; i--) 
    { 
        num = Math.floor(num/256);
        d = num%256 + '.' + d;
    }
    return d;
}