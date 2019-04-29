from analysis import Analysis
import json
import csv
import sys

def write_json(filename, data):
	with open(filename, 'w+') as f:
		json.dump(data, f)

def read_file(filename):

	data = []
	with open(filename,'rb') as f:
		file = csv.reader(f)
		for row in file:
			data.append(row)

	return data

def main():

	papers = read_file(sys.argv[1])
	analysis = Analysis()

	column_labels = papers[0]
	data = papers[1:]

	# analysis.per_conf_crawler_count(data)
	# analysis.per_conf_user_interactions_count(data)
	# analysis.per_year_crawler_count(data)
	# analysis.per_conf_year_count(data)
	# analysis.per_conf_undefined_count(data)
	analysis.per_category_crawler_count(data)

if __name__ == '__main__':

	if len(sys.argv) != 2:
		print ("Usage: python main.py [input-file-name]")
		exit()

	main()