import sys
import twint
import json
import io
from contextlib import redirect_stdout

# file = sys.argv[0]
# user = sys.argv[1]
# search = sys.argv[2]
# since = sys.argv[3]
# until = sys.argv[4]
# near = sys.argv[5]

# Config twint
c = twint.Config()

if sys.argv[1] != "undefined":
    c.Username = sys.argv[1]
if sys.argv[2] != "undefined":
    c.Search = sys.argv[2]
if sys.argv[3] != "undefined":
    c.Since = sys.argv[3]
if sys.argv[4] != "undefined":
    c.Until = sys.argv[4]
if sys.argv[5] != "undefined":
    c.Near = sys.argv[5]

c.Limit = 100
c.Store_object = True
c.Hide_output = True

# Redirect printing of [!] No more scraping keme
f = io.StringIO()
with redirect_stdout(f):
    twint.run.Search(c)

out = f.getvalue()

# Convert tweet objects to dictionary
tweets = [tweet.__dict__ for tweet in twint.output.tweets_list]

# Dump tweet array as json object
# print(json.dumps(tweets))
print(tweets)