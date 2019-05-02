from analysis import Analysis
import json
import csv
import sys

def write_json(filename, data):
	with open(filename, 'w+') as f:
		json.dump(data, f)

def read_file(filename):

	data = []
	with open(filename,'r',encoding='utf-8') as f:
		file = csv.reader(f)
		for row in file:
			data.append(row)

	return data

def main():

	papers = read_file(sys.argv[1])
	analysis = Analysis()

	column_labels = papers[0]
	data = papers[1:]

	write_json('confCount.json',analysis.per_conf_crawler_count(data))
	write_json('confUserInt.json',analysis.per_conf_user_interactions_count(data))
	write_json('yearCount.json',analysis.per_year_crawler_count(data))
	write_json('confYear.json',analysis.per_conf_year_count(data))
	write_json('confUndefined.json',analysis.per_conf_undefined_count(data))
	write_json('catCount.json',analysis.per_category_crawler_count(data))


if __name__ == '__main__':

	if len(sys.argv) != 2:
		print ("Usage: python main.py [input-file-name]")
		exit()

	main()