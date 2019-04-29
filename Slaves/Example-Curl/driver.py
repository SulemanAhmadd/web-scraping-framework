import subprocess
import errno
import time
import sys
import os

'''
Makes all parent directories as well
'''
def mkdir_p(path):
    try:
        os.makedirs(path)

    except OSError as exc: # preventing race condition
        
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

'''
command line check
'''
if len(sys.argv) != 3:
	sys.stderr.write('command line arguement error\n')
	exit()

url = sys.argv[1].strip()
proxy_cmd = sys.argv[2].strip("")

'''
crawler files path
'''
CRAWLER_DIR  = 'crawler-files'
CRAWLER_PATH = os.path.join(os.getcwd(), CRAWLER_DIR)

'''
create results/output directory
'''
RESULTS_DIR  = os.path.join('results', url.strip('http://'))
RESULTS_PATH = os.path.join(os.getcwd(), RESULTS_DIR)
mkdir_p(RESULTS_PATH)

'''
start tcpdump
'''
pcap_dump_process = subprocess.Popen("exec " + proxy_cmd, shell=True)
time.sleep(2)

'''
change directory to crawler. results will be saved in results directory.
'''
os.chdir(CRAWLER_PATH)

'''
run crawler
'''
try:

    crawler_process = subprocess.Popen(['./curl_crawler.sh', url, os.path.join(RESULTS_PATH, url.strip('http://'))])

    try:
        crawler_process.wait()
    except KeyboardInterrupt:
        try:
            crawler_process.terminate()
            pcap_dump_process.terminate()
        except OSError:
           pass
        crawler_process.wait()

except Exception as e: 

    pcap_dump_process.terminate()
    sys.stderr.write(e)

time.sleep(2)
pcap_dump_process.terminate()