import matplotlib.pyplot as plt
import pprint

'''
['Paper Title', 'Venue', 'Year', 'Purpose of Paper', 'Scraping Tool Used', 'Tool Category', 
'Tool Sub-Category', 'Country', 'Hosted Machine', 'User Interactions (Y/N)', 'Comments']
'''

## Globals
NULL = '-'

confs = ["ccs", "imc", "pets", "usenix", "ndss", "sp"]

crawlers = ["selenium", "phantom", "wget", "curl", "tracking", "ghost.py", "modified", "scrapy", "openwpm",  \
			"selendroid", "watir", "puppeteer", "tor", "script", "grub", "heritrix", "zap", "undefined"]

years = ["2018", "2017", "2016", "2015"]

categories = ["security", "privacy", "censorship", "online", "performance", "mining", "content", "experiment"]

u_interactions = ["y", "n", NULL]

class Analysis():

	def per_conf_crawler_count(self, data):
		per_conf_crawler_count = {}

		# Initialize dict object
		for conf in confs:
			per_conf_crawler_count[conf] = {}
			for crawler in crawlers:
				per_conf_crawler_count[conf][crawler] = 0

		# Parse survey data
		for row in data:
			venue = row[1].lower()

			if venue in per_conf_crawler_count:

				found = False; specified_crawlers = row[4].lower()
				for crawler in crawlers:
					if crawler in specified_crawlers:
						found = True
						per_conf_crawler_count[venue][crawler] += 1
				
				if not found and specified_crawlers != NULL:
					print ('Crawler Mismatch: %s' % specified_crawlers)
			else:
				print ('Venue Mismatch: %s' % venue)

		pprint.pprint(per_conf_crawler_count)
		return per_conf_crawler_count

	def per_year_crawler_count(self, data):
		per_year_crawler_count = {}

		# Initialize dict object
		for year in years:
			per_year_crawler_count[year] = {}
			for crawler in crawlers:
				per_year_crawler_count[year][crawler] = 0

		# Parse survey data
		for row in data:
			year = row[2].lower()

			if year in per_year_crawler_count:

				found = False; specified_crawlers = row[4].lower()
				for crawler in crawlers:
					if crawler in specified_crawlers:
						found = True
						per_year_crawler_count[year][crawler] += 1
				
				if not found and specified_crawlers != NULL:
					print ('Crawler Mismatch: %s' % specified_crawlers)
			else:
				print ('Year Mismatch: %s' % year)

		pprint.pprint(per_year_crawler_count)
		return per_year_crawler_count

	def per_conf_user_interactions_count(self, data):
		per_conf_interactions_count = {}

		# Initialize dict object
		for conf in confs:
			per_conf_interactions_count[conf] = {}
			for ui in u_interactions:
				per_conf_interactions_count[conf][ui] = 0

		# Parse survey data
		for row in data:
			venue = row[1].lower()

			if venue in per_conf_interactions_count:
				ui = row[9].lower()
				per_conf_interactions_count[venue][ui] += 1

			else:
				print ('Venue Mismatch: %s' % venue)

		pprint.pprint(per_conf_interactions_count)
		return per_conf_interactions_count

	def per_conf_year_count(self, data):
		per_conf_year_count = {}

		# Initialize dict object
		for conf in confs:
			per_conf_year_count[conf] = {}
			for y in years:
				per_conf_year_count[conf][y] = 0

		# Parse survey data
		for row in data:
			venue = row[1].lower()

			if venue in per_conf_year_count:
				specified_year = row[2].lower()
				per_conf_year_count[venue][specified_year] += 1

			else:
				print ('Venue Mismatch: %s' % venue)

		pprint.pprint(per_conf_year_count)
		return per_conf_year_count

	def per_conf_undefined_count(self, data):
		per_conf_undef_count = {}

		# Initialize dict object
		for conf in confs:
			per_conf_undef_count[conf] = 0

		# Parse survey data
		for row in data:
			venue = row[1].lower()

			if venue in per_conf_undef_count:

				if 'undefined' in row[4].lower():
					per_conf_undef_count[venue] += 1

			else:
				print ('Venue Mismatch: %s' % venue)

		pprint.pprint(per_conf_undef_count)
		return per_conf_undef_count

	def per_category_crawler_count(self, data):

		per_category_crawler_count = {}

		# Initialize dict object
		for cat in categories:
			per_category_crawler_count[cat] = {}
			for crawler in crawlers:
				per_category_crawler_count[cat][crawler] = 0

		# Parse survey data
		for row in data:
			specified_category = row[5].lower()

			category_found = False
			for category in categories:

				if category in specified_category:
					category_found = True
					crawler_found = False; specified_crawlers = row[4].lower();
					for crawler in crawlers:
						if crawler in specified_crawlers:
							crawler_found = True
							per_category_crawler_count[category][crawler] += 1
					
					if not crawler_found and specified_crawlers != NULL:
						print ('Crawler Mismatch: %s' % specified_crawlers)

			if not category_found and specified_category != NULL:
				print ("Category Mismatch: %s" % specified_category)

		pprint.pprint(per_category_crawler_count)
		return per_category_crawler_count