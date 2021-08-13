#!/usr/local/bin/python

import os
from urllib.parse import urlparse

uri = os.environ['DATABASE_URL']
result = urlparse(uri)
print('PGHOST={}'.format(result.hostname))
print('PGPORT={}'.format(result.port))
print('PGUSER={}'.format(result.username))
print('PGPASSWORD={}'.format(result.password))
print('PGDATABASE={}'.format(result.path[1:]))
